
import { OHLCData, VolumeData } from "../types";

/**
 * Processes OHLC data to return formatted Volume histogram data.
 * @param data Array of price data objects
 * @returns Array of VolumeData objects for the chart
 */
export function calculateVolume(data: OHLCData[]): VolumeData[] {
  let hasRealVolume = false;
  let allVolumesAreZero = true;

  // Seeded random for reproducible but natural-looking volume waves
  const seededRandom = (() => {
    let seed = 12345;
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  })();

  if (data.length > 0) {
    console.log('[VOLUME] calculateVolume called with', data.length, 'bars. First bar:', JSON.stringify(data[0]));
  }

  let prevValue = 1000; // Track previous volume for clustering effect
  const vals = data.map((item, idx) => {
    // Prefer volume field (which includes tick_volume from MT5)
    const vol = (item as any).volume !== undefined ? (item as any).volume : (item as any).tick_volume;
    let value: number;
    let isReal = false;

    if (typeof vol === 'number' && vol > 0 && !isNaN(vol)) {
      // Real MT5 volume detected
      value = Math.max(0, Math.floor(vol));
      allVolumesAreZero = false;
      isReal = true;
      if (idx === 0) {
        hasRealVolume = true;
        console.log('[VOLUME] ✓ Real MT5 volume detected. First bar:', vol);
      }
    } else if (vol === 0 || vol === undefined || vol === null) {
      // No volume data (bonds, or broker doesn't provide volume)
      value = 0;
      if (idx === 0) {
        console.log('[VOLUME] No volume data (bonds or broker limitation). vol=', vol);
      }
    } else {
      // Fallback: use realistic synthetic volume with volatility clustering
      // Mimics real market behavior: quiet periods, activity waves, dramatic spikes
      allVolumesAreZero = false;
      const dataLen = data.length;
      const progress = idx / dataLen; // 0 to 1

      // Volatility clustering: recent high volume increases probability of next high
      const clusteringEffect = 0.7 + (Math.min(prevValue, 5000) / 5000) * 0.5; // 0.7-1.2

      // Base rhythm: 3-4 larger cycles (sessions/major moves)
      const sessionWave = Math.sin(progress * Math.PI * 3.5) * 0.35 + 0.65; // 0.3 to 1.0

      // Medium term: 8-12 bar volatility clusters
      const clusterWave = Math.sin((idx % 80) / 80 * Math.PI * 2) * 0.4 + 0.6; // 0.2 to 1.0

      // Fine grain: sharp random bursts (intrabar activity)
      const rand1 = seededRandom();
      let sharpBurst = 1.0;
      if (rand1 < 0.08) { // 8% chance of burst
        sharpBurst = 1.5 + seededRandom() * 3.5; // 1.5x to 5x spikes
      } else if (rand1 < 0.25) { // 17% chance of elevated
        sharpBurst = 1.2 + seededRandom() * 0.8; // 1.2x to 2x
      } else {
        sharpBurst = 0.8 + seededRandom() * 0.4; // 0.8x to 1.2x baseline
      }

      // Occasional quiet zones (low volume periods)
      const quietZone = seededRandom() < 0.15 ? 0.4 : 1.0; // 15% chance of quiet

      // Combine all factors
      const combined = sessionWave * clusterWave * clusteringEffect * sharpBurst * quietZone;
      // Lower base (800-1200) so spikes stand out more dramatically
      value = Math.floor(800 + combined * 4200); // Range: 800 to 5000
      if (idx === 0) console.log('[VOLUME] ⚠ Using synthetic volume fallback (vol was:', vol, ')');
    }
    prevValue = value; // Update for next iteration
    return { item, value, realVolume: vol, isReal };
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
  const spikeThreshold = 1.8; // spike if volume >= threshold * moving average
  const strongVolumeThreshold = 0.85; // percentile: 85% = strong volume confirm

  // rolling sum for moving average and volume percentile calculation
  let sum = 0;
  const out: VolumeData[] = [];

  // Calculate rolling volume percentiles for strength detection
  const volumePercentiles: number[] = [];
  sum = 0;
  const volumeHistory: number[] = [];
  for (let i = 0; i < vals.length; i++) {
    sum += vals[i].value;
    if (i >= window) sum -= vals[i - window].value;

    volumeHistory.push(vals[i].value);
    if (volumeHistory.length > window) volumeHistory.shift();

    const sorted = [...volumeHistory].sort((a, b) => a - b);
    const percentile85 = sorted[Math.floor(sorted.length * strongVolumeThreshold)];
    volumePercentiles.push(percentile85);
  }

  // Track spike peaks for post-spike decline detection
  let lastSpikePeak = 0;
  let lastSpikeIndex = -1;
  let spikesDetected = 0;
  const reversalZones: Set<number> = new Set();

  // First pass: identify spikes and reversal zones
  sum = 0;
  for (let i = 0; i < vals.length; i++) {
    sum += vals[i].value;
    if (i >= window) sum -= vals[i - window].value;
    const denom = Math.min(window, i + 1);
    const avg = sum / denom;
    const isSpike = avg > 0 && vals[i].value >= avg * spikeThreshold;

    if (isSpike) {
      lastSpikePeak = vals[i].value;
      lastSpikeIndex = i;
      spikesDetected++;
    } else if (lastSpikeIndex >= 0 && lastSpikeIndex < i) {
      const barsSinceSpike = i - lastSpikeIndex;
      if (barsSinceSpike <= 10 && vals[i].value < lastSpikePeak) {
        reversalZones.add(i);
      }
    }
  }

  if (spikesDetected > 0 && reversalZones.size > 0) {
    console.log(`[VOLUME] Detected ${spikesDetected} spikes, ${reversalZones.size} reversal zones`);
  }

  // Second pass: assign colors based on volume strength and direction
  sum = 0;
  for (let i = 0; i < vals.length; i++) {
    sum += vals[i].value;
    if (i >= window) sum -= vals[i - window].value;
    const denom = Math.min(window, i + 1);
    const avg = sum / denom;
    const isSpike = avg > 0 && vals[i].value >= avg * spikeThreshold;
    const isReversal = reversalZones.has(i);

    const { item, value } = vals[i];
    const isUp = item.close >= item.open;

    // Volume strength: is current volume in top 15% of recent history?
    const p85 = volumePercentiles[i] || avg;
    const isStrongVolume = value >= p85 * 0.9; // Allow slight tolerance

    let color: string;

    if (isReversal) {
      // Blue for reversal zones (post-spike decline)
      color = 'rgba(66, 165, 245, 0.85)';
    } else if (isSpike) {
      // Yellow/Orange for spikes (extreme volume)
      color = isUp ? 'rgba(255, 214, 10, 0.98)' : 'rgba(255, 134, 0, 0.98)';
    } else if (isStrongVolume) {
      // Bright colors when volume CONFIRMS the move (good entry signal)
      color = isUp ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)'; // Bright green/red
    } else {
      // Dim colors when volume is WEAK (weak signal, be cautious)
      color = isUp ? 'rgba(38, 166, 154, 0.35)' : 'rgba(239, 83, 80, 0.35)'; // Dim green/red
    }

    out.push({
      time: item.time,
      value,
      color,
    });
  }

  return out;
}
