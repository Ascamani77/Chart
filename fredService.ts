// fredService.ts — fetch bond data from FRED API
const FRED_API_KEY = 'cfc256b9732d08123754f4819a6a34e5';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

// Map bond tickers to FRED series IDs
const BOND_SERIES_MAP: Record<string, string> = {
    'US10Y': 'DGS10', // 10-Year Treasury
    'US02Y': 'DGS2',  // 2-Year Treasury
};

export interface BondData {
    time: number;
    value: number;
}

/**
 * Fetch bond data from FRED API and convert to OHLC-like format
 */
export async function getBondHistoricalData(symbol: string, limit = 500): Promise<any[]> {
    try {
        const seriesId = BOND_SERIES_MAP[symbol];
        if (!seriesId) {
            console.warn(`[FRED] Unknown bond symbol: ${symbol}`);
            return [];
        }

        // Use CORS proxy to bypass browser CORS restrictions
        const fredUrl = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&limit=${limit}&sort_order=desc`;
        const corsProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fredUrl)}`;

        console.log(`[FRED] Fetching ${symbol} (${seriesId}) via CORS proxy`);

        const res = await fetch(corsProxyUrl);

        if (!res.ok) {
            console.warn(`[FRED] CORS proxy error for ${symbol}: ${res.status} ${res.statusText}`);
            return [];
        }

        const proxyData = await res.json();
        console.log(`[FRED] Proxy response status:`, proxyData.status);
        console.log(`[FRED] Proxy response keys:`, Object.keys(proxyData));

        let bars: any[] = [];
        try {
            // allorigins returns {status: 200, contents: "..."}
            const xmlString = proxyData.contents;
            console.log(`[FRED] XML string length: ${xmlString ? xmlString.length : 0}`);
            if (!xmlString) {
                console.error(`[FRED] No XML contents in proxy response`);
                return [];
            }

            // Log first 1000 chars to see the structure
            console.log(`[FRED] XML first 1000 chars:`, xmlString.substring(0, 1000));

            // Parse XML manually - extract <observation date="..." value="..."/> elements
            // The actual XML has multiple attributes, so we need a flexible regex
            const observationRegex = /<observation[^>]*date="([^"]+)"[^>]*value="([^"]+)"/g;
            let match;

            const observations: Array<{ date: string, value: string }> = [];
            while ((match = observationRegex.exec(xmlString)) !== null) {
                observations.push({
                    date: match[1],
                    value: match[2]
                });
            }

            if (observations.length === 0) {
                console.warn(`[FRED] No observations found in XML for ${symbol}`);
                return [];
            }

            console.log(`[FRED] Parsed ${observations.length} observations from XML for ${symbol}`);
            if (observations.length > 0) {
                console.log(`[FRED] First observation:`, observations[0]);
                console.log(`[FRED] Last observation:`, observations[observations.length - 1]);
            }

            // Convert observations to OHLC format (bonds don't have high/low/open, just value)
            bars = observations
                .reverse() // Sort ascending by date
                .filter((obs: any) => obs.value && obs.value !== '.') // Filter out missing values
                .map((obs: any) => {
                    const date = new Date(obs.date);
                    const timestamp = Math.floor(date.getTime() / 1000);
                    const value = parseFloat(obs.value);
                    // For bonds, create synthetic OHLC for better candle visuals
                    // Open: value - 0.01, Close: value + 0.01 (creates candle body)
                    // High/Low: ±0.015 (creates wicks)
                    return {
                        time: timestamp,
                        open: value - 0.01,
                        high: value + 0.015,
                        low: value - 0.015,
                        close: value + 0.01,
                        volume: 0, // Bonds don't have volume
                    };
                })
                .slice(-limit);
        } catch (e) {
            console.error(`[FRED] Error parsing XML for ${symbol}:`, e);
            return [];
        }

        console.log(`[FRED] Response received for ${symbol}: fetched ${bars.length} bars`);
        return bars;
    } catch (err) {
        console.error(`[FRED] Error fetching data for ${symbol}:`, err);
        return [];
    }
}

/**
 * Check if a symbol is a bond that should use FRED API
 */
export function isBondSymbol(symbol: string): boolean {
    return symbol in BOND_SERIES_MAP;
}
