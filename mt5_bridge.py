#!/usr/bin/env python3
# mt5_bridge.py
import asyncio
import json
import os
import time
import socket
from aiohttp import web
import websockets
import MetaTrader5 as mt5

# Allow overriding port via environment variable for quick retries
HTTP_PORT = int(os.environ.get('MT5_BRIDGE_PORT', '62100'))
clients = set()
subscriptions = {}   # broker_symbol -> set of websocket clients
resolved_symbols = {}  # cache for resolved symbol names (requested -> broker name)

def find_free_port(start_port=62100, range_size=50, extra_ranges=None):
    """Find the first available port starting from start_port.

    Tries the primary range `start_port..start_port+range_size-1`, then any
    `extra_ranges` provided as a list of (start, end) tuples. Returns the first
    bindable port or raises RuntimeError with a sample of bind errors.
    """
    tried = []
    ranges = [(start_port, start_port + range_size - 1)]
    if extra_ranges:
        ranges.extend(extra_ranges)
    else:
        # fallback higher range to avoid common low ephemeral collisions
        ranges.append((63000, 63050))

    for (s, e) in ranges:
        for port in range(s, e + 1):
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                sock.bind(('127.0.0.1', port))
                sock.close()
                return port
            except OSError as exc:
                tried.append((port, str(exc)))
                continue

    sample = "; ".join([f"{p}:{err}" for p, err in tried[:20]])
    raise RuntimeError(f"No available ports found (checked {len(tried)} ports). Sample errors: {sample}")

def ensure_mt5():
    if not mt5.initialize():
        raise RuntimeError("Failed to initialize MetaTrader5. Start the terminal and ensure API is enabled.")


def resolve_symbol(requested_sym: str) -> str:
    """Resolve a user-facing symbol like 'GBPUSD' to the broker's actual symbol name.
    Tries exact match, case-insensitive match, contains match, and common suffix variations.
    Caches results in `resolved_symbols` for performance.
    """
    if not requested_sym:
        return requested_sym
    if requested_sym in resolved_symbols:
        return resolved_symbols[requested_sym]
    try:
        si = mt5.symbol_info(requested_sym)
        if si is not None:
            resolved_symbols[requested_sym] = requested_sym
            return requested_sym
    except Exception:
        pass

    try:
        syms = mt5.symbols_get()
        if syms:
            # exact case-insensitive
            for s in syms:
                name = s.name if hasattr(s, 'name') else str(s)
                if name.lower() == requested_sym.lower():
                    resolved_symbols[requested_sym] = name
                    return name
            # contains
            for s in syms:
                name = s.name if hasattr(s, 'name') else str(s)
                if requested_sym.lower() in name.lower():
                    resolved_symbols[requested_sym] = name
                    return name
            # try common suffixes appended to requested symbol
            suffixes = ['m', '.m', 'micro', '.ecn', 'i']
            for suf in suffixes:
                candidate = requested_sym + suf
                for s in syms:
                    name = s.name if hasattr(s, 'name') else str(s)
                    if name.lower() == candidate.lower():
                        resolved_symbols[requested_sym] = name
                        return name
    except Exception:
        pass

    # fallback to the requested symbol itself
    resolved_symbols[requested_sym] = requested_sym
    return requested_sym

TF_MAP = {
    '1m': mt5.TIMEFRAME_M1,
    '5m': mt5.TIMEFRAME_M5,
    '15m': mt5.TIMEFRAME_M15,
    '30m': getattr(mt5, 'TIMEFRAME_M30', mt5.TIMEFRAME_M30),
    '1h': mt5.TIMEFRAME_H1,
    '2h': getattr(mt5, 'TIMEFRAME_H2', mt5.TIMEFRAME_H1 * 2),
    '3h': getattr(mt5, 'TIMEFRAME_H3', mt5.TIMEFRAME_H1 * 3),
    '4h': mt5.TIMEFRAME_H4,
    '12h': getattr(mt5, 'TIMEFRAME_H12', mt5.TIMEFRAME_H4 * 3),
    'D': mt5.TIMEFRAME_D1,
    'W': mt5.TIMEFRAME_W1,
    '1M': getattr(mt5, 'TIMEFRAME_MN1', mt5.TIMEFRAME_W1 * 4),
}

async def handle_ping(request):
    return web.Response(text="pong")


@web.middleware
async def cors_middleware(request, handler):
    # Handle preflight
    if request.method == 'OPTIONS':
        resp = web.Response(status=200)
    else:
        resp = await handler(request)
    # Allow requests from the frontend during local development
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return resp

async def handle_historical(request):
    try:
        ensure_mt5()
    except Exception as e:
        # MT5 not initialized or unavailable — return JSON error instead of raising
        print(f"MT5 init error: {e}")
        return web.json_response({'bars': [], 'error': str(e)}, status=503)
    sym = request.query.get('symbol')
    tf = request.query.get('timeframe', '1m')
    limit = int(request.query.get('limit', '200'))
    if not sym:
        return web.json_response({'bars': []})
    try:
        timeframe = TF_MAP.get(tf, mt5.TIMEFRAME_M1)
        print(f"[mt5_bridge] historical request: symbol={sym} timeframe={tf} limit={limit}")
        # resolve broker symbol name if terminal uses suffixes (e.g. GBPUSDm)
        try:
            broker_sym = resolve_symbol(sym)
            if broker_sym != sym:
                print(f"[mt5_bridge] resolved symbol {sym} -> {broker_sym}")
        except Exception as _e:
            broker_sym = sym
            print(f"[mt5_bridge] symbol resolution error: {_e}")

        try:
            si = mt5.symbol_info(broker_sym)
            print(f"[mt5_bridge] symbol_info: {si}")
        except Exception as _e:
            print(f"[mt5_bridge] symbol_info error: {_e}")

        rates = mt5.copy_rates_from_pos(broker_sym, timeframe, 0, limit)
        if rates is None:
            print(f"[mt5_bridge] copy_rates_from_pos returned None for {sym} tf={tf}")
        else:
            try:
                print(f"[mt5_bridge] copy_rates_from_pos returned {len(rates)} records for {sym}")
            except Exception:
                pass
        bars = []
        if rates is not None:
            for idx, r in enumerate(rates):
                # include volume if available (tick_volume or real_volume)
                vol = 0
                try:
                    # rates can be a numpy.record-like object, a tuple, or dict depending on mt5 binding
                    if isinstance(r, dict):
                        vol = int(r.get('tick_volume') or r.get('real_volume') or r.get('volume') or 0)
                    else:
                        # try dict-like access first
                        try:
                            vol = int(r['tick_volume'])
                        except Exception:
                            # fallback to attribute access
                            vol = int(getattr(r, 'tick_volume', None) or getattr(r, 'real_volume', None) or getattr(r, 'volume', None) or 0)
                except Exception:
                    vol = 0

                bars.append({'time': int(r['time']), 'open': r['open'], 'high': r['high'], 'low': r['low'], 'close': r['close'], 'volume': vol})
                # log the first bar for debugging volume availability
                if idx == 0:
                    try:
                        # attempt to display tick_volume from multiple shapes
                        tick_vol = None
                        if isinstance(r, dict):
                            tick_vol = r.get('tick_volume')
                        else:
                            tick_vol = getattr(r, 'tick_volume', None)
                        print(f"[mt5_bridge] first bar -> time={int(r['time'])} tick_volume={tick_vol} volume_field={vol}")
                    except Exception:
                        pass
        # If MT5 returned finer-resolution bars (e.g. 1m) for a coarser requested timeframe
        # aggregate them into the requested timeframe buckets so frontend receives correct bars.
        def tf_to_seconds(tfs: str) -> int:
            if not tfs:
                return 60
            t = tfs.upper()
            # handle patterns like '30M', '1H', 'D', 'W', '1M' (month)
            import re
            m = re.match(r"^(\d+)([MHDW])$", t)
            if m:
                n = int(m.group(1))
                unit = m.group(2)
                if unit == 'M':
                    return n * 60
                if unit == 'H':
                    return n * 3600
                if unit == 'D':
                    return n * 86400
                if unit == 'W':
                    return n * 604800
            if t == 'D':
                return 86400
            if t == 'W':
                return 604800
            # fallback
            return 60

        try:
            target_sec = tf_to_seconds(tf)
            # detect source interval (smallest delta between bars)
            src_sec = None
            if len(bars) >= 2:
                deltas = [bars[i+1]['time'] - bars[i]['time'] for i in range(len(bars)-1)]
                src_sec = min(deltas)
            # if source is finer than target, aggregate
            if src_sec and src_sec < target_sec:
                agg = {}
                for b in bars:
                    key = (b['time'] // target_sec) * target_sec
                    if key not in agg:
                        agg[key] = {'time': key, 'open': b['open'], 'high': b['high'], 'low': b['low'], 'close': b['close']}
                    else:
                        a = agg[key]
                        a['high'] = max(a['high'], b['high'])
                        a['low'] = min(a['low'], b['low'])
                        a['close'] = b['close']
                # produce sorted list
                bars = [agg[k] for k in sorted(agg.keys())]
        except Exception:
            pass

        return web.json_response({'bars': bars})
    except Exception as e:
        print(f"Historical fetch error for {sym}: {e}")
        return web.json_response({'bars': [], 'error': str(e)}, status=500)

async def handle_tick(request):
    try:
        ensure_mt5()
    except Exception as e:
        print(f"MT5 init error on /tick: {e}")
        return web.json_response({'error': str(e)}, status=503)
    sym = request.query.get('symbol')
    if not sym:
        return web.json_response({'error': 'missing symbol'}, status=400)
    try:
        # resolve broker symbol name before requesting tick
        try:
            broker_sym = resolve_symbol(sym)
            if broker_sym != sym:
                print(f"[mt5_bridge] resolved symbol {sym} -> {broker_sym} for /tick")
        except Exception as _e:
            broker_sym = sym
            print(f"[mt5_bridge] /tick symbol resolution error: {_e}")

        tick = mt5.symbol_info_tick(broker_sym)
        print(f"[mt5_bridge] /tick request for {broker_sym}")
        try:
            si = mt5.symbol_info(broker_sym)
            print(f"[mt5_bridge] /tick symbol_info: {si}")
        except Exception as _e:
            print(f"[mt5_bridge] /tick symbol_info error: {_e}")

        if tick is None:
            print(f"[mt5_bridge] symbol_info_tick returned None for {broker_sym}")
            return web.json_response({'symbol': sym, 'tick': None})
        t = int(getattr(tick, 'time', int(time.time())))
        bid = float(getattr(tick, 'bid', 0.0))
        ask = float(getattr(tick, 'ask', 0.0))
        vol = int(getattr(tick, 'volume', 0) or 0)
        return web.json_response({'symbol': sym, 'bid': bid, 'ask': ask, 'time': t, 'volume': vol})
    except Exception as e:
        print(f"/tick error for {sym}: {e}")
        return web.json_response({'error': str(e)}, status=500)

async def ws_handler(ws, path=None):
    clients.add(ws)
    print(f"[mt5_bridge] WS client connected from {ws.remote_address}")
    try:
        async for raw in ws:
            try:
                msg = json.loads(raw)
                print(f"[mt5_bridge] WS received message: {msg}")
            except Exception as e:
                print(f"[mt5_bridge] WS message parse error: {e}")
                continue
            action = msg.get('action')
            symbol = msg.get('symbol')
            if action == 'subscribe' and symbol:
                subs = subscriptions.setdefault(symbol, set())
                subs.add(ws)
                print(f"[mt5_bridge] subscribed to {symbol}, total subscribers: {len(subscriptions)}")
            elif action == 'unsubscribe' and symbol:
                subs = subscriptions.get(symbol)
                if subs:
                    subs.discard(ws)
                print(f"[mt5_bridge] unsubscribed from {symbol}")
    except Exception as e:
        print(f"[mt5_bridge] WS handler error: {e}")
    finally:
        for subs in subscriptions.values():
            subs.discard(ws)
        clients.discard(ws)
        print(f"[mt5_bridge] WS client disconnected")

async def ticker_loop():
    ensure_mt5()
    last = {}
    while True:
        try:
            for requested_sym, subs in list(subscriptions.items()):
                if not subs:
                    continue
                # Resolve the symbol name to broker format (e.g., BTCUSD -> BTCUSDm)
                broker_sym = resolve_symbol(requested_sym)
                tick = mt5.symbol_info_tick(broker_sym)
                if tick is None:
                    continue
                t = int(tick.time)
                bid = float(tick.bid)
                ask = float(tick.ask)
                vol = int(getattr(tick, 'volume', 0) or 0)
                key = f"{requested_sym}"
                prev = last.get(key)
                if prev is None or (prev['bid'] != bid or prev['ask'] != ask or t != prev['time']):
                    last[key] = {'time': t, 'bid': bid, 'ask': ask}
                    payload = json.dumps({'symbol': requested_sym, 'bid': bid, 'ask': ask, 'time': t, 'volume': vol})
                    dead = []
                    for ws in list(subs):
                        try:
                            await ws.send(payload)
                        except Exception:
                            dead.append(ws)
                    for d in dead:
                        subs.discard(d)
            await asyncio.sleep(0.25)
        except Exception:
            await asyncio.sleep(0.5)

def main():
    app = web.Application(middlewares=[cors_middleware])
    app.router.add_get('/ping', handle_ping)
    app.router.add_get('/historical', handle_historical)
    app.router.add_get('/tick', handle_tick)
    runner = web.AppRunner(app)

    async def start_servers():
        try:
            # Find first available port
            http_port = find_free_port(HTTP_PORT)
            ws_port = find_free_port(http_port + 1)
            
            await runner.setup()
            site = web.TCPSite(runner, '127.0.0.1', http_port)
            await site.start()
            
            ws_server = await websockets.serve(ws_handler, '127.0.0.1', ws_port, ping_interval=None)
            asyncio.create_task(ticker_loop())
            
            print(f"\n✓ MT5 bridge started successfully!")
            print(f"  HTTP: http://127.0.0.1:{http_port}")
            print(f"  WS: ws://127.0.0.1:{ws_port}\n")
            
            while True:
                await asyncio.sleep(3600)
        except Exception as e:
            print(f"\n✗ Error starting server: {e}\n")
            raise

    asyncio.run(start_servers())

if __name__ == '__main__':
    main()
