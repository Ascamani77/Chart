
import { Time } from 'lightweight-charts';
import { OHLCData } from "../types";

/**
 * Calculates the Simple Moving Average (SMA) for a given set of OHLC data.
 * @param data Array of price data objects
 * @param period SMA period (e.g., 50, 200)
 * @returns Array of { time, value } objects for the chart
 */
export function calculateSMA(data: OHLCData[], period: number) {
  if (data.length < period) return [];

  const result: { time: Time; value: number }[] = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({
      time: data[i].time,
      value: sum / period,
    });
  }

  return result;
}
