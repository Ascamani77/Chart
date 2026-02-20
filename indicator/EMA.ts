
import { Time } from 'lightweight-charts';
import { OHLCData } from "../types";

/**
 * Calculates the Exponential Moving Average (EMA) for a given set of OHLC data.
 * @param data Array of price data objects
 * @param period EMA period (e.g., 20, 50, 200)
 * @returns Array of { time, value } objects for the chart
 */
export function calculateEMA(data: OHLCData[], period: number) {
  if (data.length < period) return [];

  const result: { time: Time; value: number }[] = [];
  const k = 2 / (period + 1);

  // Initial EMA: use Simple Moving Average (SMA) for the first point
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  
  let prevEma = sum / period;
  result.push({
    time: data[period - 1].time,
    value: prevEma,
  });

  // Calculate subsequent EMA values
  for (let i = period; i < data.length; i++) {
    const currentEma = (data[i].close * k) + (prevEma * (1 - k));
    result.push({
      time: data[i].time,
      value: currentEma,
    });
    prevEma = currentEma;
  }

  return result;
}
