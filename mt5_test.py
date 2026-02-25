"""
Quick MT5 connection and symbol test script.
Run from the project's virtualenv: `python mt5_test.py`
Paste the full stdout back here.
"""
import MetaTrader5 as mt5
import pprint
import time

pp = pprint.pprint

print('MetaTrader5 package version:', mt5.__version__ if hasattr(mt5, '__version__') else 'unknown')
ok = mt5.initialize()
print('mt5.initialize() ->', ok)
print('mt5.last_error() ->', mt5.last_error())

# show some basic account / terminal info if available
try:
    info = mt5.terminal_info()
    print('terminal_info ->')
    pp(info._asdict() if hasattr(info, '_asdict') else info)
except Exception as e:
    print('terminal_info error ->', e)

# Check a short list of common FX symbols and a few from your environment
symbols_to_check = ['GBPUSD','EURUSD','USDJPY','US30','NAS100']
for s in symbols_to_check:
    try:
        si = mt5.symbol_info(s)
        print(f'symbol_info({s}) ->', si)
        if si is not None:
            # print a couple of useful props
            try:
                print('  visible:', getattr(si, 'visible', None), 'trade_tick_size:', getattr(si, 'trade_tick_size', None))
            except Exception:
                pass
    except Exception as e:
        print(f'symbol_info({s}) error ->', e)

# Try getting a few ticks and a few 1m bars for GBPUSD
for s in ['GBPUSD','EURUSD']:
    try:
        print('\n--- Testing', s, '---')
        tick = mt5.symbol_info_tick(s)
        print('symbol_info_tick ->', tick)
        if tick is not None:
            print(' tick.time', getattr(tick, 'time', None), 'tick.bid', getattr(tick, 'bid', None), 'tick.volume', getattr(tick, 'volume', None))
        rates = mt5.copy_rates_from_pos(s, mt5.TIMEFRAME_M1, 0, 5)
        print('copy_rates_from_pos ->', 'None' if rates is None else f'{len(rates)} rows')
        if rates is not None and len(rates) > 0:
            print(' first row ->', dict((k, getattr(rates[0], k)) for k in rates[0]._fields) if hasattr(rates[0], '_fields') else rates[0])
    except Exception as e:
        print(f'test for {s} error ->', e)

mt5.shutdown()
print('\nmt5.shutdown() done')