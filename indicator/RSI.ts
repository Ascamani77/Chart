
import { Time } from 'lightweight-charts';
import { OHLCData } from "../types";

/**
 * Calculates the Relative Strength Index (RSI) for a given set of OHLC data.
 * @param data Array of price data objects
 * @param period RSI period (default is 14)
 * @returns Array of { time, value } objects for the chart
 */
export function calculateRSI(data: OHLCData[], period = 14) {
  if (data.length < period + 1) return [];

  const result: { time: Time; value: number }[] = [];
  let gains = 0;
  let losses = 0;

  // Initial calculation for the first period
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push({
    time: data[period].time,
    value: 100 - 100 / (1 + rs),
  });

  // Subsequent calculations using smoothed moving average (Wilder's Smoothing)
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push({
      time: data[i].time,
      value: 100 - 100 / (1 + rs),
    });
  }

  return result;
}
