
import { Time } from 'lightweight-charts';
import { OHLCData, VolumeData } from "../types";

/**
 * Calculates the Volume Weighted Average Price (VWAP) for a given set of OHLC and Volume data.
 * @param ohlc Array of price data objects
 * @param volume Array of volume data objects
 * @returns Array of { time, value } objects for the chart
 */
export function calculateVWAP(ohlc: OHLCData[], volume: VolumeData[]) {
  if (ohlc.length === 0 || volume.length === 0) return [];
  
  const result: { time: Time; value: number }[] = [];
  let cumulativePV = 0;
  let cumulativeV = 0;

  // We assume ohlc and volume arrays are aligned by time
  for (let i = 0; i < ohlc.length; i++) {
    const typicalPrice = (ohlc[i].high + ohlc[i].low + ohlc[i].close) / 3;
    const v = volume[i].value;
    
    cumulativePV += typicalPrice * v;
    cumulativeV += v;
    
    result.push({
      time: ohlc[i].time,
      value: cumulativePV / cumulativeV
    });
  }

  return result;
}
