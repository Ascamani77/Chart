export function isForex(symbol?: string): boolean {
    if (!symbol) return false;
    // Normalize symbol: remove exchange prefixes/suffixes, uppercase and strip non-letters
    let clean = symbol.includes(":") ? symbol.split(":")[1] : symbol;
    clean = clean.toUpperCase().replace(/[^A-Z]/g, '');
    if (clean.length !== 6) return false;
    const base = clean.slice(0, 3);
    const quote = clean.slice(3, 6);
    const currencies = ['EUR', 'GBP', 'USD', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'];
    return currencies.includes(base) && currencies.includes(quote);
}

export function priceDecimalsFor(symbol?: string): number {
    if (!symbol) return 2;
    const raw = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const INDEX_DECIMALS: Record<string, number> = {
        'NAS100': 2,
        'SPX500': 2,
        'USTEC': 2,
        'US500': 2,
    };
    for (const k of Object.keys(INDEX_DECIMALS)) {
        if (raw.includes(k)) return INDEX_DECIMALS[k];
    }
    return isForex(symbol) ? 5 : 2;
}

export function priceStepFor(symbol?: string): number {
    return isForex(symbol) ? 0.00001 : 0.1;
}

export function formatPrice(price: number, symbol?: string): string {
    const dec = priceDecimalsFor(symbol);
    return price.toFixed(dec);
}
