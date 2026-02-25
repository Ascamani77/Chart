"""
List available symbols in the connected MT5 terminal and search for common FX symbols.
Run in the project's venv: python mt5_list_symbols.py
Paste the output here.
"""
import MetaTrader5 as mt5
import pprint

pp = pprint.pprint

print('MetaTrader5 version:', getattr(mt5, '__version__', 'unknown'))
ok = mt5.initialize()
print('mt5.initialize() ->', ok)
print('mt5.last_error() ->', mt5.last_error())

try:
    syms = mt5.symbols_get()
    total = 0 if syms is None else len(syms)
    print('Total symbols available via mt5.symbols_get():', total)
    if total and total <= 300:
        for i, s in enumerate(syms[:300]):
            try:
                name = s.name if hasattr(s, 'name') else str(s)
            except Exception:
                name = str(s)
            visible = getattr(s, 'visible', None)
            print(f'{i+1:3d}: {name} visible={visible}')
    else:
        print('Too many symbols to list; searching for common pairs...')

    # search patterns
    patterns = ['GBP', 'EUR', 'USD', 'US30', 'NAS', 'SPX', 'DAX', 'FTSE']
    found = {}
    if syms:
        for p in patterns:
            found[p] = [s.name for s in syms if p in (s.name if hasattr(s, 'name') else str(s))]
    for p, lst in found.items():
        print(f"\nMatches for '{p}': {len(lst)}")
        for x in lst[:10]:
            print('  ', x)

    # try symbol_select for common FX
    check = ['GBPUSD','EURUSD','USDJPY']
    print('\nAttempting to ensure common symbols are selected (added to Market Watch) using mt5.symbol_select')
    for c in check:
        try:
            res = mt5.symbol_select(c, True)
            print(f"symbol_select('{c}', True) -> {res}")
        except Exception as e:
            print(f"symbol_select('{c}') error -> {e}")

except Exception as e:
    print('symbols_get error ->', e)

mt5.shutdown()
print('\nmt5.shutdown() done')