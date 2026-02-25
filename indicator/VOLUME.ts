
import { OHLCData, VolumeData } from "../types";

/**
 * Processes OHLC data to return formatted Volume histogram data.
 * @param data Array of price data objects
 * @returns Array of VolumeData objects for the chart
 */
export function calculateVolume(data: OHLCData[]): VolumeData[] {
  let hasRealVolume = false;
  let allVolumesAreZero = true;

  const vals = data.map((item, idx) => {
    // Prefer volume field (which includes tick_volume from MT5)
    const vol = (item as any).volume || (item as any).tick_volume;
    let value: number;

    if (typeof vol === 'number' && vol > 0 && !isNaN(vol)) {
      value = Math.max(0, Math.floor(vol));
      allVolumesAreZero = false;
      if (idx === 0) {
        hasRealVolume = true;
        console.log('[VOLUME] first bar real volume:', vol);
      }
    } else {
      // For bonds and other assets with no volume, use 0 instead of synthetic
      // (FRED bond data returns volume: 0, indicating no volume data available)
      if (vol === 0) {
        value = 0;
      } else {
        // Fallback: use synthetic volume based on price action
        allVolumesAreZero = false;
        value = Math.floor((item.close % 1000) * 10) + 500;
      }
      if (idx === 0) console.log('[VOLUME] using', vol === 0 ? 'zero volume (bonds/no data)' : 'synthetic fallback', '; first bar:', value);
    }
    return { item, value, realVolume: vol };
  });

  if (!hasRealVolume && !allVolumesAreZero) {
    console.log('[VOLUME] using synthetic volume; sample values (first 10):', vals.slice(0, 10).map(v => v.value));
  } else if (allVolumesAreZero) {
    console.log('[VOLUME] all volumes are 0 (likely bonds from FRED), keeping zero');
  } else if (hasRealVolume) {
    const volumeValues = vals.map(v => v.value);
    const minVol = Math.min(...volumeValues);
    const maxVol = Math.max(...volumeValues);
    const avgVol = volumeValues.reduce((a, b) => a + b, 0) / volumeValues.length;
    console.log(`[VOLUME] Real volume stats: min=${minVol}, max=${maxVol}, avg=${Math.round(avgVol)}, sample (first 10):`, vals.slice(0, 10).map(v => v.value));
  }

  const window = 20;
  const threshold = 2; // spike if volume >= threshold * moving average

  // rolling sum for moving average
  let sum = 0;
  const out: VolumeData[] = [];
  for (let i = 0; i < vals.length; i++) {
    sum += vals[i].value;
    if (i >= window) sum -= vals[i - window].value;
    const denom = Math.min(window, i + 1);
    const avg = sum / denom;
    const isSpike = avg > 0 && vals[i].value >= avg * threshold;

    const { item, value } = vals[i];
    const baseColor = item.close >= item.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)';
    const spikeColor = item.close >= item.open ? 'rgba(255, 214, 10, 0.95)' : 'rgba(255, 134, 0, 0.95)';

    out.push({
      time: item.time,
      value,
      color: isSpike ? spikeColor : baseColor,
    });
  }

  return out;
}
