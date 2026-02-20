
import { OHLCData, VolumeData } from "../types";

/**
 * Processes OHLC data to return formatted Volume histogram data.
 * @param data Array of price data objects
 * @returns Array of VolumeData objects for the chart
 */
export function calculateVolume(data: OHLCData[]): VolumeData[] {
  return data.map((item) => ({
    time: item.time,
    // Use close price as a base for mock volume to keep it stable and deterministic
    value: Math.floor((item.close % 1000) * 10) + 500,
    color: item.close >= item.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
  }));
}
