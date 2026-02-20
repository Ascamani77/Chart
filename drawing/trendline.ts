
import { ISeriesApi, Time } from 'lightweight-charts';

export interface DrawingPoint {
  time: Time;
  price: number;
}

export interface DrawingInstance {
  id: string;
  type: string;
  points: DrawingPoint[];
  series?: any; 
  selected: boolean;
  metadata?: any;
  text?: string;
  width?: number;
  widthLeft?: number;
  widthRight?: number;
}

export function timeToValue(t: Time): number {
  if (t === null || t === undefined) return 0;
  if (typeof t === 'number') {
    return t < 10000000000 ? t : Math.floor(t / 1000);
  }
  if (typeof t === 'string') {
    const d = new Date(t);
    return isNaN(d.getTime()) ? 0 : Math.floor(d.getTime() / 1000);
  }
  if (typeof t === 'object') {
    const obj = t as any;
    if (obj && typeof obj.year === 'number') {
      const d = new Date(obj.year, (obj.month || 1) - 1, obj.day || 1);
      return isNaN(d.getTime()) ? 0 : Math.floor(d.getTime() / 1000);
    }
  }
  return 0;
}

export function coordinateToTimeEx(chart: any, x: number): Time | null {
  if (!chart) return null;
  const timeScale = chart.timeScale();
  const directTime = timeScale.coordinateToTime(x);
  if (directTime !== null) return directTime;
  
  const logical = timeScale.coordinateToLogical(x);
  if (logical === null) return null;
  
  const visibleRange = timeScale.getVisibleLogicalRange();
  if (!visibleRange) return null;

  const refLogical = Math.floor(visibleRange.to);
  const refTime = timeScale.coordinateToTime(timeScale.logicalToCoordinate(refLogical) || 0);
  if (refTime === null) return null;

  const t1 = timeToValue(refTime);
  const refPrevTime = timeScale.coordinateToTime(timeScale.logicalToCoordinate(refLogical - 1) || 0);
  const t0 = refPrevTime ? timeToValue(refPrevTime) : t1 - 86400;
  
  const interval = (t1 > t0) ? (t1 - t0) : 86400;
  const diff = logical - refLogical;
  
  const extrapolatedUnix = t1 + Math.round(diff * interval);
  return extrapolatedUnix as any;
}

/**
 * Magnet Mode: Snaps a price to the nearest OHLC value of a bar at the given time.
 */
export function snapPointToOHLC(time: Time, price: number, data: any[]): number {
  if (!data || !data.length) return price;
  const val = timeToValue(time);
  const bar = data.find(d => timeToValue(d.time) === val);
  if (!bar) return price;
  
  const points = [bar.open, bar.high, bar.low, bar.close];
  return points.reduce((prev, curr) => 
    Math.abs(curr - price) < Math.abs(prev - price) ? curr : prev
  );
}

export function safeSetSeriesData(series: ISeriesApi<any>, data: any[]) {
    if (!series || !data) return;
    try {
        const valid = data.filter(d => d && d.time !== null && d.time !== undefined);
        if (valid.length === 0) {
            series.setData([]);
            return;
        }
        const sorted = [...valid].sort((a, b) => timeToValue(a.time) - timeToValue(b.time));
        const unique = [];
        for (let i = 0; i < sorted.length; i++) {
            const currentT = timeToValue(sorted[i].time);
            if (i === 0 || currentT > timeToValue(unique[unique.length - 1].time)) {
                unique.push(sorted[i]);
            } else {
                unique[unique.length - 1] = sorted[i];
            }
        }
        series.setData(unique);
    } catch (err) {
        console.warn('Failed to set series data:', err);
    }
}

/**
 * SINGLE-CLICK POSITION TOOL (Long/Short)
 */
export function activatePositionTool(
  type: 'long_position' | 'short_position',
  chart: any,
  mainSeries: ISeriesApi<any>,
  container: HTMLElement,
  onComplete: (drawing: Omit<DrawingInstance, 'selected'>) => void,
  deactivate: () => void
) {
  const onClick = (e: PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = coordinateToTimeEx(chart, x);
    const price = mainSeries.coordinateToPrice(y);
    
    if (time !== null && price !== null) {
      // 1:1.5 Risk Reward default
      const tickSize = price * 0.001; 
      const targetPrice = type === 'long_position' ? price + (tickSize * 30) : price - (tickSize * 30);
      const stopPrice = type === 'long_position' ? price - (tickSize * 20) : price + (tickSize * 20);

      onComplete({ 
        id: `${type}_${Date.now()}`, 
        type: type, 
        points: [
          { time, price: targetPrice }, // Point 0: Target
          { time, price: price },       // Point 1: Entry
          { time, price: stopPrice }    // Point 2: Stop
        ],
        widthLeft: 100,
        widthRight: 100
      });
    }
  };

  container.addEventListener('pointerdown', onClick, { capture: true });

  return {
    cleanup() {
      container.removeEventListener('pointerdown', onClick, { capture: true });
    }
  };
}

/**
 * SINGLE-CLICK TEXT TOOL
 */
export function activateTextTool(
  chart: any,
  mainSeries: ISeriesApi<any>,
  container: HTMLElement,
  onComplete: (drawing: Omit<DrawingInstance, 'selected'>) => void,
  deactivate: () => void
) {
  const onClick = (e: PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = coordinateToTimeEx(chart, x);
    const price = mainSeries.coordinateToPrice(y);
    
    if (time !== null && price !== null) {
      onComplete({ 
        id: `text_${Date.now()}`, 
        type: 'text', 
        points: [{ time, price }],
        text: '' // Start with empty text to trigger editor
      });
    }
  };

  container.addEventListener('pointerdown', onClick, { capture: true });

  return {
    cleanup() {
      container.removeEventListener('pointerdown', onClick, { capture: true });
    }
  };
}

/**
 * SINGLE-CLICK ANCHORED VWAP TOOL
 */
export function activateAnchoredVwapTool(
  chart: any,
  mainSeries: ISeriesApi<any>,
  container: HTMLElement,
  onComplete: (drawing: Omit<DrawingInstance, 'selected'>) => void,
  deactivate: () => void
) {
  const onClick = (e: PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = coordinateToTimeEx(chart, x);
    const price = mainSeries.coordinateToPrice(y);
    
    if (time !== null && price !== null) {
      onComplete({ 
        id: `avwap_${Date.now()}`, 
        type: 'anchored_vwap', 
        points: [{ time, price }]
      });
    }
  };

  container.addEventListener('pointerdown', onClick, { capture: true });

  return {
    cleanup() {
      container.removeEventListener('pointerdown', onClick, { capture: true });
    }
  };
}

/**
 * MULTI-POINT PATTERN DRAWING SYSTEM (XABCD etc)
 */
export function activatePatternTool(
  type: string,
  numPoints: number,
  chart: any,
  mainSeries: ISeriesApi<any>,
  container: HTMLElement,
  onComplete: (drawing: Omit<DrawingInstance, 'selected'>) => void,
  deactivate: () => void
) {
  let points: DrawingPoint[] = [];
  let previewSeries: ISeriesApi<any> | null = null;

  const getPoint = (e: PointerEvent): DrawingPoint | null => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = coordinateToTimeEx(chart, x);
    const price = mainSeries.coordinateToPrice(y);
    if (time === null || price === null) return null;
    return { time, price };
  };

  const onClick = (e: PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const pt = getPoint(e);
    if (!pt) return;

    points.push(pt);

    if (points.length === 1) {
      previewSeries = chart.addLineSeries({
        color: '#2962ff', lineWidth: 1.5, lineStyle: 2,
        lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false,
        autoscaleInfoProvider: () => null,
      });
    }

    if (points.length === numPoints) {
      onComplete({ id: `${type}_${Date.now()}`, type, points: [...points] });
      cleanupPreview();
      points = [];
    }
  };

  const onMove = (e: PointerEvent) => {
    if (points.length === 0 || !previewSeries) return;
    const pt = getPoint(e);
    if (pt) {
      const displayPoints = [...points, pt].map(p => ({ time: p.time, value: p.price }));
      safeSetSeriesData(previewSeries, displayPoints);
    }
  };

  const cleanupPreview = () => {
    if (previewSeries) {
      try { chart.removeSeries(previewSeries); } catch(e) {}
      previewSeries = null;
    }
  };

  container.addEventListener('pointerdown', onClick, { capture: true });
  window.addEventListener('pointermove', onMove, { capture: true });

  return {
    cleanup() {
      container.removeEventListener('pointerdown', onClick, { capture: true });
      window.removeEventListener('pointermove', onMove, { capture: true });
      cleanupPreview();
      points = [];
    }
  };
}

/**
 * TWO-CLICK DRAWING SYSTEM (Trendlines, Rays)
 */
export function activateDrawingTool(
  type: string,
  chart: any,
  mainSeries: ISeriesApi<any>,
  container: HTMLElement,
  onComplete: (drawing: Omit<DrawingInstance, 'selected'>) => void,
  deactivate: () => void
) {
  let p1: DrawingPoint | null = null;
  let previewSeries: ISeriesApi<any> | null = null;
  let state: 'idle' | 'drawing' = 'idle';

  const getPoint = (e: PointerEvent): DrawingPoint | null => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = coordinateToTimeEx(chart, x);
    const price = mainSeries.coordinateToPrice(y);
    if (time === null || price === null) return null;
    return { time, price };
  };

  const onClick = (e: PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const pt = getPoint(e);
    if (!pt) return;

    if (state === 'idle') {
      p1 = pt;
      if (type === 'horizontal_line' || type === 'vertical_line') {
        onComplete({ id: `${type === 'horizontal_line' ? 'hl' : 'vl'}_${Date.now()}`, type, points: [p1] });
        // Reset state for next line but don't cleanup listeners
        p1 = null; state = 'idle';
        return;
      }
      state = 'drawing';
      previewSeries = chart.addLineSeries({
        color: '#2962ff', lineWidth: 2, lineStyle: 2,
        lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false,
        autoscaleInfoProvider: () => null,
      });
    } else if (state === 'drawing' && p1) {
      onComplete({ id: `${type}_${Date.now()}`, type, points: [p1, pt] });
      // Reset preview and state
      if (previewSeries) { try { chart.removeSeries(previewSeries); } catch(e) {} previewSeries = null; }
      p1 = null; state = 'idle';
    }
  };

  const onMove = (e: PointerEvent) => {
    if (state !== 'drawing' || !p1 || !previewSeries) return;
    e.preventDefault();
    e.stopPropagation();
    const p2 = getPoint(e);
    if (p2) {
      safeSetSeriesData(previewSeries, [
        { time: p1.time, value: p1.price },
        { time: p2.time, value: p2.price }
      ]);
    }
  };

  container.addEventListener('pointerdown', onClick, { capture: true });
  window.addEventListener('pointermove', onMove, { capture: true });

  const hardCleanup = () => {
    state = 'idle'; p1 = null;
    if (previewSeries) { try { chart.removeSeries(previewSeries); } catch(e) {} previewSeries = null; }
  };

  return {
    cleanup() {
      container.removeEventListener('pointerdown', onClick, { capture: true });
      window.removeEventListener('pointermove', onMove, { capture: true });
      hardCleanup();
    }
  };
}

/**
 * BRUSH TOOL SYSTEM (Drag to draw)
 */
export function activateBrushTool(
  chart: any,
  mainSeries: ISeriesApi<any>,
  container: HTMLElement,
  onComplete: (drawing: Omit<DrawingInstance, 'selected'>) => void,
  onUpdate: (points: DrawingPoint[]) => void,
  deactivate: () => void
) {
  let points: DrawingPoint[] = [];
  let isDrawing = false;

  const getPoint = (e: PointerEvent): DrawingPoint | null => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = coordinateToTimeEx(chart, x);
    const price = mainSeries.coordinateToPrice(y);
    if (time === null || price === null) return null;
    return { time, price };
  };

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const pt = getPoint(e);
    if (!pt) return;

    isDrawing = true;
    points = [pt];
    onUpdate(points);
  };

  const onMove = (e: PointerEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    e.stopPropagation();

    const pt = getPoint(e);
    if (!pt) return;
    points.push(pt);
    onUpdate(points);
  };

  const onUp = (e: PointerEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    e.stopPropagation();
    isDrawing = false;
    
    if (points.length > 1) {
      onComplete({ id: `brush_${Date.now()}`, type: 'brush', points: [...points] });
    }
    
    onUpdate([]); // Clear preview
    points = []; // Reset internal state for next stroke
  };

  container.addEventListener('pointerdown', onDown, { capture: true });
  window.addEventListener('pointermove', onMove, { capture: true, passive: false });
  window.addEventListener('pointerup', onUp, { capture: true });

  return {
    cleanup() {
      container.removeEventListener('pointerdown', onDown, { capture: true });
      window.removeEventListener('pointermove', onMove, { capture: true });
      window.removeEventListener('pointerup', onUp, { capture: true });
      isDrawing = false;
      points = [];
    }
  };
}
