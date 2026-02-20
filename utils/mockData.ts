import { OHLCData, VolumeData } from '../types';

// Simple seedable random number generator to ensure data consistency across reloads
const createRandom = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = h + 0x9e3779b9 | 0;
    let t = h ^ h >>> 16;
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ t >>> 15;
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
  };
};

export const generateMockOHLC = (count: number = 500, interval: 'm' | 'h' | 'd' | 'w' = 'd', symbol: string = 'BTCUSDT'): OHLCData[] => {
  const data: OHLCData[] = [];
  const rng = createRandom(symbol); // Deterministic RNG based on symbol
  let basePrice = 45000 + (rng() * 10000); // Randomized but stable starting price per symbol

  let currentTime = new Date();

  // Snap currentTime to the start of the current interval to keep timestamps stable across refreshes
  if (interval === 'm') {
    currentTime.setSeconds(0, 0);
  } else if (interval === 'h') {
    currentTime.setMinutes(0, 0, 0);
  } else if (interval === 'w' || interval === 'd') {
    currentTime.setHours(0, 0, 0, 0);
  }

  // Adjust starting time back by 'count' units
  if (interval === 'm') {
    currentTime.setMinutes(currentTime.getMinutes() - count);
  } else if (interval === 'h') {
    currentTime.setHours(currentTime.getHours() - count);
  } else if (interval === 'w') {
    currentTime.setDate(currentTime.getDate() - (count * 7));
  } else {
    currentTime.setDate(currentTime.getDate() - count);
  }

  for (let i = 0; i < count; i++) {
    const volatility = basePrice * 0.015;
    const open = basePrice + (rng() - 0.5) * volatility;
    const close = open + (rng() - 0.5) * volatility;
    const high = Math.max(open, close) + rng() * (volatility * 0.5);
    const low = Math.min(open, close) - rng() * (volatility * 0.5);

    data.push({
      time: Math.floor(currentTime.getTime() / 1000) as any,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });

    basePrice = close;

    if (interval === 'm') {
      currentTime.setMinutes(currentTime.getMinutes() + 1);
    } else if (interval === 'h') {
      currentTime.setHours(currentTime.getHours() + 1);
    } else if (interval === 'w') {
      currentTime.setDate(currentTime.getDate() + 7);
    } else {
      currentTime.setDate(currentTime.getDate() + 1);
    }
  }
  return data;
};

export const generateVolumeData = (ohlc: OHLCData[]): VolumeData[] => {
  return ohlc.map((item) => {
    // Generate deterministic volume based on the timestamp
    const pseudoRandom = (Math.sin(Number(item.time)) + 1) / 2;
    return {
      time: item.time,
      value: Math.floor(pseudoRandom * 1000) + 100,
      color: item.close >= item.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
    };
  });
};

export const WATCHLIST_DATA = [
  { ticker: 'BTCUSDT', name: 'Bitcoin / TetherUS', price: 64231.22, change: 124.50, changePercent: 0.19 },
  { ticker: 'ETHUSDT', name: 'Ethereum / TetherUS', price: 3452.12, change: -45.10, changePercent: -1.29 },
  { ticker: 'AAPL', name: 'Apple Inc.', price: 189.20, change: 1.45, changePercent: 0.77 },
  { ticker: 'TSLA', name: 'Tesla, Inc.', price: 175.22, change: -3.40, changePercent: -1.90 },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', price: 890.11, change: 12.55, changePercent: 1.42 },
  { ticker: 'SOLUSDT', name: 'Solana / TetherUS', price: 145.88, change: 5.20, changePercent: 3.70 },
];