
import { Time } from 'lightweight-charts';
import { OHLCData } from "../types";

/**
 * Calculates the Average True Range (ATR) for a given set of OHLC data.
 * @param data Array of price data objects
 * @param period ATR period (default is 14)
 * @returns Array of { time, value } objects for the chart
 */
export function calculateATR(data: OHLCData[], period: number = 14) {
  if (data.length < period + 1) return [];

  const tr: { time: Time; value: number }[] = [];

  // Calculate True Range (TR)
  for (let i = 1; i < data.length; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const prevClose = data[i - 1].close;

    const val = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    tr.push({ time: data[i].time, value: val });
  }

  const result: { time: Time; value: number }[] = [];
  
  // Calculate first ATR as simple average of TRs
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += tr[i].value;
  }
  
  let prevAtr = sum / period;
  result.push({ time: tr[period - 1].time, value: prevAtr });

  // Calculate subsequent ATRs using Wilder's smoothing
  for (let i = period; i < tr.length; i++) {
    const currentAtr = (prevAtr * (period - 1) + tr[i].value) / period;
    result.push({ time: tr[i].time, value: currentAtr });
    prevAtr = currentAtr;
  }

  return result;
}
