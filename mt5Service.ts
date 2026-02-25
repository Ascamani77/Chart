// mt5Service.ts — frontend bridge client for MT5 Python bridge
const BRIDGE_HTTP = (import.meta.env.VITE_MT5_BRIDGE_URL as string) || 'http://localhost:62100';
// WebSocket runs on HTTP port + 1 by default
const BRIDGE_WS = (import.meta.env.VITE_MT5_BRIDGE_WS_URL as string) || BRIDGE_HTTP.replace(/^http/, 'ws').replace(/:(\d+)$/, (_, p) => `:${Number(p) + 1}`);

type Tick = { symbol: string; bid: number; ask: number; time: number; volume?: number };

// Simple in-memory cache for historical bars to speed up symbol switches
const historicalCache: Map<string, any[]> = new Map();

// Map display symbols to broker symbols with optional scaling
const SYMBOL_MAP: Record<string, { brokerSymbol: string; scale?: number }> = {
    'NAS100': { brokerSymbol: 'USTEC', scale: 1 }, // use USTEC directly (no scale) to match broker price
    'SPX500': { brokerSymbol: 'US500', scale: 1 },  // use US500 directly (no scale)
};

let ws: WebSocket | null = null;
const callbacks: Map<string, Set<(t: Tick) => void>> = new Map();
const symbolCache: Map<string, string> = new Map();

function ensureWs() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
    ws = new WebSocket(BRIDGE_WS);
    ws.onopen = () => {
        // resubscribe existing symbols
        for (const sym of callbacks.keys()) {
            ws!.send(JSON.stringify({ action: 'subscribe', symbol: sym }));
        }
    };
    ws.onmessage = (ev) => {
        try {
            const data = JSON.parse(ev.data);
            const sym = data.symbol;
            if (!sym) return;
            const set = callbacks.get(sym);
            if (set) {
                const tick: Tick = { symbol: sym, bid: Number(data.bid), ask: Number(data.ask), time: Number(data.time), volume: Number(data.volume || 0) };
                for (const cb of Array.from(set)) cb(tick);
            }
        } catch (e) {
            // ignore
        }
    };
    ws.onclose = () => { ws = null; };
    ws.onerror = () => { /* ignore */ };
}

export async function getHistoricalData(symbol: string, timeframe: string, limit = 5000, originalSymbol?: string) {
    try {
        const tf = timeframe || 'D';
        const url = `${BRIDGE_HTTP.replace(/\/$/, '')}/historical?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(tf)}&limit=${limit}`;

        const cacheKey = `${symbol}|${tf}|${limit}`;
        if (historicalCache.has(cacheKey)) {
            // return a shallow copy to avoid accidental mutation
            return historicalCache.get(cacheKey)!.slice();
        }
        const r = await fetch(url);
        console.log(`[MT5] HTTP GET ${url} -> status ${r.status}`);
        if (!r.ok) return [];
        const j = await r.json();
        try {
            console.log(`[MT5] Raw historical response for ${symbol}: bars=${Array.isArray(j.bars) ? j.bars.length : 0}`);
            if (Array.isArray(j.bars) && j.bars.length > 0) {
                console.log('[MT5] sample bar (first):', j.bars[0], 'sample bar (last):', j.bars[j.bars.length - 1]);
            }
        } catch (e) { /* ignore logging errors */ }
        if (!Array.isArray(j.bars)) return [];
        let bars = j.bars.map((b: any) => ({ time: Number(b.time), open: Number(b.open), high: Number(b.high), low: Number(b.low), close: Number(b.close), volume: Number(b.volume || b.tick_volume || 0) })) as any[];

        // If bars are finer than requested timeframe, aggregate client-side to ensure correct buckets
        const timeframeToSeconds = (t: string) => {
            if (!t) return 60;
            const s = t.toString().toUpperCase();
            const m = s.match(/^(\d+)([MHDW])$/);
            if (m) {
                const n = Number(m[1]);
                const unit = m[2];
                if (unit === 'M') return n * 60; // minutes
                if (unit === 'H') return n * 3600;
                if (unit === 'D') return n * 86400;
                if (unit === 'W') return n * 604800;
            }
            if (s === 'D') return 86400;
            if (s === 'W') return 604800;
            return 60;
        };

        const targetSec = timeframeToSeconds(tf);
        let srcSec: number | null = null;
        if (bars.length >= 2) {
            const deltas: number[] = [];
            for (let i = 0; i < bars.length - 1; i++) deltas.push(bars[i + 1].time - bars[i].time);
            srcSec = Math.min(...deltas);
        }

        if (srcSec && srcSec < targetSec) {
            const agg: Record<number, { time: number; open: number; high: number; low: number; close: number; volume: number }> = {};
            for (const b of bars) {
                const key = Math.floor(b.time / targetSec) * targetSec;
                if (!agg[key]) {
                    agg[key] = { time: key, open: b.open, high: b.high, low: b.low, close: b.close, volume: Number(b.volume || 0) };
                } else {
                    const a = agg[key];
                    a.high = Math.max(a.high, b.high);
                    a.low = Math.min(a.low, b.low);
                    a.close = b.close;
                    a.volume = (a.volume || 0) + Number(b.volume || 0);
                }
            }
            bars = Object.keys(agg).map(k => agg[Number(k)]).sort((x, y) => x.time - y.time);
        }

        // Apply scaling if the original symbol has a scale mapping (e.g., NAS100 -> USTEC x100)
        if (originalSymbol && SYMBOL_MAP[originalSymbol]?.scale !== undefined) {
            const scale = SYMBOL_MAP[originalSymbol].scale!;
            try {
                console.log(`[MT5] Applying scale ${scale} to ${originalSymbol} — pre-sample:`, bars.slice(-3));
            } catch (e) { }
            bars = bars.map(b => ({
                ...b,
                open: b.open * scale,
                high: b.high * scale,
                low: b.low * scale,
                close: b.close * scale
            }));
            try {
                console.log(`[MT5] Applied scale ${scale} to ${originalSymbol} — post-sample:`, bars.slice(-3));
            } catch (e) { }
        }

        // store in cache
        try { historicalCache.set(cacheKey, bars.slice()); } catch (e) { /* ignore cache failures */ }

        return bars;
    } catch (e) {
        return [];
    }
}

export async function findWorkingSymbol(symbol: string, timeframe: string) {
    // return cached mapping if present
    const cached = symbolCache.get(symbol);
    if (cached) return cached;

    // Check if symbol has a broker mapping
    const mapped = SYMBOL_MAP[symbol];
    const baseSymbol = mapped?.brokerSymbol || symbol;

    const candidates = [
        baseSymbol,
        `${baseSymbol}m`,
        `${baseSymbol}c`,
        `${baseSymbol}i`,
        `${baseSymbol}micro`,
        `${baseSymbol.toUpperCase()}`,
        `${baseSymbol.toLowerCase()}`,
    ];

    for (const cand of candidates) {
        try {
            const url = `${BRIDGE_HTTP.replace(/\/$/, '')}/historical?symbol=${encodeURIComponent(cand)}&timeframe=${encodeURIComponent(timeframe)}&limit=1`;
            const r = await fetch(url);
            if (!r.ok) continue;
            const j = await r.json();
            if (Array.isArray(j.bars) && j.bars.length > 0) {
                console.log(`[MT5] findWorkingSymbol: ${symbol} -> ${cand} (ok)`);
                symbolCache.set(symbol, cand);
                return cand;
            }
        } catch (e) {
            // ignore and try next
        }
    }
    symbolCache.set(symbol, baseSymbol);
    console.log(`[MT5] findWorkingSymbol: ${symbol} -> fallback ${baseSymbol}`);
    return baseSymbol;
}

export async function getLatestTick(symbol: string) {
    try {
        const url = `${BRIDGE_HTTP.replace(/\/$/, '')}/tick?symbol=${encodeURIComponent(symbol)}`;
        const r = await fetch(url);
        if (!r.ok) return null;
        const j = await r.json();
        if (!j) return null;
        if (j.tick === null) return null;
        return { bid: Number(j.bid || 0), ask: Number(j.ask || 0), time: Number(j.time || Date.now() / 1000), volume: Number(j.volume || 0) };
    } catch (e) {
        return null;
    }
}

export function subscribeToTicks(symbol: string, cb: (t: Tick) => void, originalSymbol?: string) {
    ensureWs();
    let set = callbacks.get(symbol);
    if (!set) { set = new Set(); callbacks.set(symbol, set); }

    // Wrap callback to apply scaling if needed
    const wrappedCb = (tick: Tick) => {
        try { console.log(`[MT5] tick raw for ${symbol}:`, tick); } catch (e) { }
        if (originalSymbol && SYMBOL_MAP[originalSymbol]?.scale !== undefined) {
            const scale = SYMBOL_MAP[originalSymbol].scale!;
            tick.bid *= scale;
            tick.ask *= scale;
            try { console.log(`[MT5] tick scaled for ${originalSymbol} (scale=${scale}):`, tick); } catch (e) { }
        }
        cb(tick);
    };

    set.add(wrappedCb);
    // if ws is open, send subscribe
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ action: 'subscribe', symbol }));

    return () => {
        const s = callbacks.get(symbol);
        if (s) {
            s.delete(wrappedCb);
            if (s.size === 0) {
                callbacks.delete(symbol);
                if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ action: 'unsubscribe', symbol }));
            }
        }
    };
}

export function toBrokerSymbol(sym: string) {
    return symbolCache.get(sym) || sym;
}

export default { getHistoricalData, subscribeToTicks, toBrokerSymbol, findWorkingSymbol };
