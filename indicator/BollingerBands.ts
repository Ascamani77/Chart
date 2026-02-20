
import { Time } from 'lightweight-charts';
import { OHLCData } from "../types";

/**
 * Calculates Bollinger Bands (Upper, Middle, Lower) for a given set of OHLC data.
 * @param data Array of price data objects
 * @param period SMA period (default is 20)
 * @param multiplier Standard deviation multiplier (default is 2)
 * @returns Object containing arrays for upper, middle, and lower bands
 */
export function calculateBollingerBands(data: OHLCData[], period: number = 20, multiplier: number = 2) {
  if (data.length < period) return { upper: [], middle: [], lower: [] };

  const upper: { time: Time; value: number }[] = [];
  const middle: { time: Time; value: number }[] = [];
  const lower: { time: Time; value: number }[] = [];

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const prices = slice.map(d => d.close);
    
    // Middle Band (SMA)
    const sum = prices.reduce((a, b) => a + b, 0);
    const avg = sum / period;
    
    // Standard Deviation
    const squareDiffs = prices.map(p => Math.pow(p - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / period;
    const stdDev = Math.sqrt(avgSquareDiff);
    
    middle.push({ time: data[i].time, value: avg });
    upper.push({ time: data[i].time, value: avg + (multiplier * stdDev) });
    lower.push({ time: data[i].time, value: avg - (multiplier * stdDev) });
  }

  return { upper, middle, lower };
}
