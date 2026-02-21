import React, { useEffect, useRef, useState, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import {
  createChart,
  ColorType,
  ISeriesApi,
  IChartApi,
  Time,
  SeriesType
} from 'lightweight-charts';
import {
  Scissors,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Settings,
  Eye,
  EyeOff,
  MoreHorizontal,
  Copy,
  PlusCircle,
  RefreshCw,
  Lock,
  Unlock
} from 'lucide-react';
import { OHLCData, VolumeData, ChartSettings, Drawing } from '../types';
import { calculateRSI } from '../indicator/RSI';
import { calculateEMA } from '../indicator/EMA';
import { calculateVWAP } from '../indicator/VWAP';
import { calculateBollingerBands } from '../indicator/BollingerBands';
import { calculateATR } from '../indicator/ATR';
import { calculateSMA } from '../indicator/SMA';
import { calculateVolume } from '../indicator/VOLUME';
import { ToolType } from '../icons/toolTypes';
import { activateTool, deactivateTool } from '../drawing/toolManager';
import { safeSetSeriesData, timeToValue, coordinateToTimeEx, snapPointToOHLC } from '../drawing/trendline';
import { PairIcons } from '../utils/symbolIcons';
import { ChartStyle } from '../App';
import RectangleSettingsModal from './RectangleSettingsModal';

export interface TradingChartHandle {
  takeScreenshot: () => string | undefined;
}

interface TradingChartProps {
  data: OHLCData[];
  volumeData: VolumeData[];
  style?: ChartStyle;
  symbol?: string;
  timeframe?: string;
  activeTool: ToolType;
  drawings: Drawing[];
  onDrawingsChange: (update: Drawing[] | ((prev: Drawing[]) => Drawing[])) => void;
  onToolDeactivate: () => void;
  stayInDrawingMode?: boolean;
  onDrawingSelect: (id: string | null) => void;
  showRsi: boolean; rsiPeriod: number;
  showEma10: boolean; ema10Period: number;
  showEma20: boolean; ema20Period: number;
  showVwap: boolean;
  showBb: boolean; bbPeriod: number; bbMultiplier: number;
  showAtr: boolean; atrPeriod: number;
  showSma1: boolean; sma1Period: number;
  showSma2: boolean; sma2Period: number;
  showVolume: boolean;
  onRemoveIndicator: (id: string) => void;
  onOpenSettings: (id: string) => void;
  chartSettings?: ChartSettings;
  replayCutoffTime?: number | null;
  isReplaySelecting?: boolean;
  onSetReplayCutoff?: (time: number) => void;
  isMagnetEnabled?: boolean;
  isLocked?: boolean;
  isVisible?: boolean;
}

const FIB_LEVELS = [
  { level: 0, color: '#787b86' },
  { level: 0.236, color: '#f23645' },
  { level: 0.382, color: '#ff9800' },
  { level: 0.5, color: '#4caf50' },
  { level: 0.618, color: '#089981' },
  { level: 0.786, color: '#00bcd4' },
  { level: 1, color: '#787b86' },
  { level: 1.618, color: '#2962ff' },
  { level: 2.618, color: '#f23645' },
  { level: 3.618, color: '#9c27b0' },
  { level: 4.236, color: '#e91e63' },
];

const FIB_FAN_LEVELS = [
  { level: 0, color: '#787b86' },
  { level: 0.25, color: '#ff9800' },
  { level: 0.382, color: '#4caf50' },
  { level: 0.5, color: '#089981' },
  { level: 0.618, color: '#00bcd4' },
  { level: 0.75, color: '#2962ff' },
  { level: 1, color: '#9c27b0' },
];

const TradingChart = forwardRef<TradingChartHandle, TradingChartProps>((props, ref) => {
  const {
    data, volumeData, symbol = 'AAPL', timeframe = 'D',
    activeTool, onToolDeactivate, drawings, onDrawingsChange,
    stayInDrawingMode, chartSettings, replayCutoffTime, isReplaySelecting, onSetReplayCutoff,
    style = 'candles', isMagnetEnabled = false, isLocked = false, isVisible = true
  } = props;

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const drawingSurfaceRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const indicatorsRef = useRef<{ [key: string]: ISeriesApi<any> | ISeriesApi<any>[] }>({});

  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const [hoveredDrawingId, setHoveredDrawingId] = useState<string | null>(null);
  const [showDeleteIconId, setShowDeleteIconId] = useState<string | null>(null);
  const [activeBrushPoints, setActiveBrushPoints] = useState<any[]>([]);

  const [draggingHandle, setDraggingHandle] = useState<{ drawingId: string, pointIndex: number } | null>(null);
  const [draggingLine, setDraggingLine] = useState<{ drawingId: string, initialPoints: { time: Time, price: number }[], startX: number, startY: number } | null>(null);
  const [viewportCounter, setViewportCounter] = useState(0);

  const [displayOHLC, setDisplayOHLC] = useState<OHLCData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showIndicatorLegend, setShowIndicatorLegend] = useState(true);
  const [hiddenIndicators, setHiddenIndicators] = useState<Set<string>>(new Set());

  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverFormattedTime, setHoverFormattedTime] = useState<string>('');

  const [textInputState, setTextInputState] = useState<{ id: string, x: number, y: number, value: string } | null>(null);
  const [showRectangleColorsId, setShowRectangleColorsId] = useState<string | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; drawingId: string | null } | null>(null);

  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      if (!chartRef.current) return undefined;
      return chartRef.current.takeScreenshot().toDataURL('image/png');
    }
  }));

  const TV_GREEN = chartSettings?.symbol.upColor || '#089981';
  const TV_RED = chartSettings?.symbol.downColor || '#f23645';
  const TV_ACCENT = '#2962ff';

  const isAnyToolActive = useMemo(() => activeTool && activeTool !== 'cursor', [activeTool]);
  const isCurrentlyDrawing = useMemo(() => activeBrushPoints.length > 0 || draggingHandle || draggingLine, [activeBrushPoints, draggingHandle, draggingLine]);

  // REPLAY DATA LOGIC
  const visibleData = useMemo(() => {
    if (isReplaySelecting || !replayCutoffTime) return data;
    return data.filter(d => timeToValue(d.time) <= (replayCutoffTime as number));
  }, [data, replayCutoffTime, isReplaySelecting]);

  // SYNC LOOP FOR EXTERNAL SVG
  useEffect(() => {
    if (!isReady || !chartRef.current || !mainSeriesRef.current) return;
    let lastRangeJson = "";
    let lastPriceCoord = 0;
    let animationFrameId: number;

    const sync = () => {
      const chart = chartRef.current;
      const series = mainSeriesRef.current;
      if (!chart || !series) return;

      const range = chart.timeScale().getVisibleLogicalRange();
      const rangeJson = JSON.stringify(range);

      const priceCoord = series.priceToCoordinate(visibleData[0]?.close || 0);

      if (rangeJson !== lastRangeJson || priceCoord !== lastPriceCoord) {
        setViewportCounter(v => v + 1);
        lastRangeJson = rangeJson;
        lastPriceCoord = priceCoord;
      }
      animationFrameId = requestAnimationFrame(sync);
    };

    animationFrameId = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isReady, visibleData]);

  // TOGGLE CHART INTERACTIVITY
  useEffect(() => {
    if (!chartRef.current) return;
    const canMove = (!isAnyToolActive && !isCurrentlyDrawing && !isReplaySelecting);

    chartRef.current.applyOptions({
      handleScroll: {
        mouseWheel: canMove,
        pressedMouseMove: canMove,
        horzTouchDrag: canMove,
        vertTouchDrag: canMove,
      },
      handleScale: {
        axisPressedMouseMove: canMove,
        mouseWheel: canMove,
        pinch: canMove,
      },
    });
  }, [isAnyToolActive, isCurrentlyDrawing, isReplaySelecting, isReady]);

  // APPLY MAGNET MODE TO CROSSHAIR
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      crosshair: {
        mode: isMagnetEnabled ? 1 : 0,
      }
    });
  }, [isMagnetEnabled]);

  // APPLY GLOBAL CHART SETTINGS
  useEffect(() => {
    if (!isReady || !chartRef.current || !chartSettings) return;

    const { canvas, scales } = chartSettings;

    chartRef.current.applyOptions({
      layout: {
        background: canvas.backgroundType === 'Solid'
          ? { type: ColorType.Solid, color: canvas.background }
          : { type: ColorType.VerticalGradient, topColor: canvas.background, bottomColor: canvas.backgroundGradientEnd },
        textColor: canvas.scaleTextColor,
        fontSize: canvas.scaleFontSize,
      },
      grid: {
        vertLines: {
          visible: canvas.gridVisible && (canvas.gridType.includes('Vert') || canvas.gridType === 'Vertical' || canvas.gridType === 'Vert and horz'),
          color: canvas.gridColor
        },
        horzLines: {
          visible: canvas.gridVisible && (canvas.gridType.includes('horz') || canvas.gridType === 'Horizontal' || canvas.gridType === 'Vert and horz'),
          color: canvas.horzGridColor
        },
      },
      rightPriceScale: {
        visible: scales.placement === 'Right' || scales.placement === 'Auto',
        borderColor: canvas.scaleLineColor,
        borderVisible: true,
        scaleMargins: {
          top: canvas.marginTop / 100,
          bottom: canvas.marginBottom / 100,
        },
      },
      leftPriceScale: {
        visible: scales.placement === 'Left',
        borderColor: canvas.scaleLineColor,
        borderVisible: true,
        scaleMargins: {
          top: canvas.marginTop / 100,
          bottom: canvas.marginBottom / 100,
        },
      },
      timeScale: {
        borderColor: canvas.scaleLineColor,
        borderVisible: true,
      },
      crosshair: {
        color: canvas.crosshairColor,
        style: canvas.crosshairStyle as any,
      }
    });
  }, [isReady, chartSettings]);

  // DRAWING TOOL ACTIVATION
  useEffect(() => {
    if (!isReady || !chartRef.current || !mainSeriesRef.current) return;

    if (isAnyToolActive && !isReplaySelecting && drawingSurfaceRef.current) {
      activateTool(
        activeTool,
        chartRef.current,
        mainSeriesRef.current,
        drawingSurfaceRef.current,
        (newDrawing) => {
          const drawingToAdd: Drawing = {
            id: newDrawing.id,
            type: newDrawing.type as any,
            points: newDrawing.points.map(p => ({
              time: p.time,
              price: isMagnetEnabled ? snapPointToOHLC(p.time, p.price, data) : p.price
            })),
            color: '#2962ff',
            width: 2,
            widthLeft: 100,
            widthRight: 100,
            text: newDrawing.type === 'text' ? '' : undefined
          };

          onDrawingsChange(prev => [...prev, drawingToAdd]);
          setSelectedDrawingId(newDrawing.id);

          if (newDrawing.type === 'text') {
            const px = chartRef.current!.timeScale().timeToCoordinate(newDrawing.points[0].time);
            const py = mainSeriesRef.current!.priceToCoordinate(newDrawing.points[0].price);
            if (px !== null && py !== null) {
              setTextInputState({ id: newDrawing.id, x: px, y: py - 18, value: '' });
            }
          }

          if (!stayInDrawingMode) {
            onToolDeactivate();
          }
        },
        (points) => setActiveBrushPoints(points),
        onToolDeactivate
      );
    } else {
      deactivateTool();
    }
  }, [activeTool, isReady, isReplaySelecting, onToolDeactivate, stayInDrawingMode, isMagnetEnabled, data]);

  // INITIALIZATION
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#1c1c1c' }, textColor: '#d1d4dc', fontFamily: 'Inter', fontSize: 11 },
      timeScale: { rightOffset: 12, barSpacing: 6, borderColor: '#333333', timeVisible: true, shiftVisibleRangeOnNewBar: false },
      grid: { vertLines: { color: 'rgba(42, 46, 57, 0.4)' }, horzLines: { color: 'rgba(42, 46, 57, 0.4)' } },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });
    chartRef.current = chart;
    chart.timeScale().subscribeVisibleLogicalRangeChange(() => setViewportCounter(v => v + 1));
    chart.subscribeCrosshairMove((param) => {
      if (param.time) {
        const d = data.find(item => item.time === param.time);
        if (d) setDisplayOHLC(d);
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        });
        setViewportCounter(v => v + 1);
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    setIsReady(true);
    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // SYNC DATA & MAIN SERIES SWITCHING
  useEffect(() => {
    if (!isReady || !chartRef.current || !visibleData.length) return;
    const chart = chartRef.current;
    const timeScale = chart.timeScale();
    const rangeBefore = timeScale.getVisibleLogicalRange();

    if (mainSeriesRef.current) {
      chart.removeSeries(mainSeriesRef.current);
      mainSeriesRef.current = null;
    }

    const { symbol: symSettings } = chartSettings || { symbol: { borderVisible: true, wickVisible: true, upColor: '#26a69a', downColor: '#ef5350' } };

    switch (style) {
      case 'bars':
        mainSeriesRef.current = chart.addBarSeries({ upColor: TV_GREEN, downColor: TV_RED });
        break;
      case 'line':
        mainSeriesRef.current = chart.addLineSeries({ color: TV_ACCENT, lineWidth: 2 });
        break;
      case 'area':
        mainSeriesRef.current = chart.addAreaSeries({
          lineColor: TV_ACCENT,
          topColor: TV_ACCENT + '44',
          bottomColor: TV_ACCENT + '00'
        });
        break;
      case 'baseline':
        mainSeriesRef.current = chart.addBaselineSeries({
          baseValue: { type: 'price', price: visibleData[Math.floor(visibleData.length / 2)]?.close || 0 },
          topFillColor1: TV_GREEN + '44',
          topFillColor2: TV_GREEN + '00',
          topLineColor: TV_GREEN,
          bottomFillColor1: TV_RED + '00',
          bottomFillColor2: TV_RED + '44',
          bottomLineColor: TV_RED,
        });
        break;
      case 'columns':
        mainSeriesRef.current = chart.addHistogramSeries({ color: TV_ACCENT });
        break;
      case 'hollow_candles':
        mainSeriesRef.current = chart.addCandlestickSeries({
          upColor: 'transparent',
          downColor: TV_RED,
          borderUpColor: TV_GREEN,
          borderDownColor: TV_RED,
          wickUpColor: symSettings.wickVisible ? TV_GREEN : 'transparent',
          wickDownColor: symSettings.wickVisible ? TV_RED : 'transparent',
          borderVisible: symSettings.borderVisible,
          wickVisible: symSettings.wickVisible,
        });
        break;
      default: // candles
        mainSeriesRef.current = chart.addCandlestickSeries({
          upColor: TV_GREEN,
          downColor: TV_RED,
          borderVisible: symSettings.borderVisible,
          wickVisible: symSettings.wickVisible,
          borderUpColor: symSettings.borderVisible ? TV_GREEN : 'transparent',
          borderDownColor: symSettings.borderVisible ? TV_RED : 'transparent',
          wickUpColor: symSettings.wickVisible ? TV_GREEN : 'transparent',
          wickDownColor: symSettings.wickVisible ? TV_RED : 'transparent',
        });
        break;
    }

    let finalData: any[] = visibleData;
    const singleValueStyles = ['line', 'area', 'baseline', 'columns'];
    if (singleValueStyles.includes(style)) {
      finalData = visibleData.map(d => ({ time: d.time, value: d.close }));
    }

    safeSetSeriesData(mainSeriesRef.current!, finalData);

    if (rangeBefore) timeScale.setVisibleLogicalRange(rangeBefore);
    else if (!replayCutoffTime && !isReplaySelecting) timeScale.scrollToRealTime();
  }, [isReady, visibleData, style, TV_GREEN, TV_RED, chartSettings?.symbol]);

  // SYNC INDICATORS
  useEffect(() => {
    if (!isReady || !chartRef.current || !visibleData.length) return;
    const chart = chartRef.current as any;
    const updateIndicator = (id: string, show: boolean, calculate: () => any, color: string, pane?: string) => {
      if (indicatorsRef.current[id]) {
        const series = indicatorsRef.current[id];
        if (Array.isArray(series)) series.forEach(s => chart.removeSeries(s));
        else chart.removeSeries(series);
        delete indicatorsRef.current[id];
      }
      if (show) {
        const result = calculate();
        const isVisible = !hiddenIndicators.has(id);
        if (id === 'bb') {
          const u = chart.addLineSeries({ color, lineWidth: 1, lastValueVisible: false, priceLineVisible: false, visible: isVisible });
          const m = chart.addLineSeries({ color, lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false, visible: isVisible });
          const l = chart.addLineSeries({ color, lineWidth: 1, lastValueVisible: false, priceLineVisible: false, visible: isVisible });
          safeSetSeriesData(u, result.upper); safeSetSeriesData(m, result.middle); safeSetSeriesData(l, result.lower);
          indicatorsRef.current[id] = [u, m, l];
        } else if (id === 'vol') {
          const s = chart.addHistogramSeries({ color: TV_GREEN + '88', priceScaleId: 'volume', visible: isVisible });
          chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
          safeSetSeriesData(s, result);
          indicatorsRef.current[id] = s;
        } else {
          const s = chart.addLineSeries({
            color,
            lineWidth: 1.5,
            priceScaleId: pane,
            lastValueVisible: !pane,
            priceLineVisible: false,
            visible: isVisible,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 4,
          });
          if (pane) chart.priceScale(pane).applyOptions({ scaleMargins: { top: 0.8, bottom: 0.05 }, borderVisible: false });
          safeSetSeriesData(s, result);
          indicatorsRef.current[id] = s;
        }
      }
    };
    updateIndicator('rsi', props.showRsi, () => calculateRSI(visibleData, props.rsiPeriod), '#9575cd', 'rsi');
    updateIndicator('ema10', props.showEma10, () => calculateEMA(visibleData, props.ema10Period), '#42a5f5');
    updateIndicator('ema20', props.showEma20, () => calculateEMA(visibleData, props.ema20Period), '#ffa726');
    updateIndicator('sma1', props.showSma1, () => calculateSMA(visibleData, props.sma1Period), '#089981');
    updateIndicator('sma2', props.showSma2, () => calculateSMA(visibleData, props.sma2Period), '#2962ff');
    updateIndicator('vwap', props.showVwap, () => calculateVWAP(visibleData, volumeData), '#ffb74d');
    updateIndicator('bb', props.showBb, () => calculateBollingerBands(visibleData, props.bbPeriod, props.bbMultiplier), 'rgba(66, 165, 245, 0.4)');
    updateIndicator('atr', props.showAtr, () => calculateATR(visibleData, props.atrPeriod), TV_RED, 'atr');
    updateIndicator('vol', props.showVolume, () => calculateVolume(visibleData), TV_GREEN);
  }, [isReady, visibleData, props, hiddenIndicators, TV_GREEN, TV_RED]);

  const handleDeleteDrawing = useCallback((id: string) => {
    if (isLocked) return;
    onDrawingsChange(prev => prev.filter(d => d.id !== id));
    if (selectedDrawingId === id) setSelectedDrawingId(null);
    if (showDeleteIconId === id) setShowDeleteIconId(null);
    if (textInputState?.id === id) setTextInputState(null);
    if (showRectangleColorsId === id) setShowRectangleColorsId(null);
  }, [onDrawingsChange, selectedDrawingId, showDeleteIconId, textInputState, showRectangleColorsId, isLocked]);

  const handleUpdateDrawing = useCallback((id: string, updates: Partial<Drawing>) => {
    onDrawingsChange(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, [onDrawingsChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedDrawingId) {
        if (isLocked) return;
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        handleDeleteDrawing(selectedDrawingId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDrawingId, handleDeleteDrawing, isLocked]);

  const onHandlePointerDown = (e: React.PointerEvent, drawingId: string, pointIndex: number) => {
    if (isLocked) return;
    e.stopPropagation(); e.preventDefault();
    setSelectedDrawingId(drawingId); setShowDeleteIconId(null);
    setDraggingHandle({ drawingId, pointIndex });
  };

  const onLinePointerDown = (e: React.PointerEvent, drawingId: string) => {
    e.stopPropagation(); e.preventDefault();
    const isAlreadySelected = selectedDrawingId === drawingId;
    setSelectedDrawingId(drawingId);

    if (isAlreadySelected && !isLocked) {
      setShowDeleteIconId(drawingId);
    } else {
      setShowDeleteIconId(null);
      setShowRectangleColorsId(null);
    }

    if (!isLocked) {
      const drawing = drawings.find(d => d.id === drawingId);
      if (drawing) {
        setDraggingLine({
          drawingId,
          initialPoints: JSON.parse(JSON.stringify(drawing.points)),
          startX: e.clientX,
          startY: e.clientY
        });
      }
    }
  };

  useEffect(() => {
    if ((!draggingHandle && !draggingLine) || !chartRef.current || !mainSeriesRef.current || isLocked) return;
    const onPointerMove = (e: PointerEvent) => {
      const rect = chartContainerRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (draggingHandle) {
        const timeScale = chartRef.current!.timeScale();
        const series = mainSeriesRef.current!;

        onDrawingsChange(prev => prev.map(d => {
          if (d.id === draggingHandle.drawingId) {
            if (draggingHandle.pointIndex === 3) {
              const pEntryX = timeScale.timeToCoordinate(d.points[1].time);
              if (pEntryX !== null) {
                const newWidthLeft = pEntryX - x;
                return { ...d, widthLeft: Math.max(10, newWidthLeft) };
              }
              return d;
            }
            if (draggingHandle.pointIndex === 4) {
              const pEntryX = timeScale.timeToCoordinate(d.points[1].time);
              if (pEntryX !== null) {
                const newWidthRight = x - pEntryX;
                return { ...d, widthRight: Math.max(10, newWidthRight) };
              }
              return d;
            }

            const time = coordinateToTimeEx(chartRef.current, x);
            let price = series.coordinateToPrice(y);
            if (time !== null && price !== null) {
              if (isMagnetEnabled) {
                price = snapPointToOHLC(time, price, data);
              }
              const newPoints = [...d.points];
              newPoints[draggingHandle.pointIndex] = { time, price };
              return { ...d, points: newPoints };
            }
          }
          return d;
        }));
      } else if (draggingLine) {
        const dx = e.clientX - draggingLine.startX;
        const dy = e.clientY - draggingLine.startY;
        const timeScale = chartRef.current!.timeScale();
        const series = mainSeriesRef.current!;
        onDrawingsChange(prev => prev.map(d => {
          if (d.id === draggingLine.drawingId) {
            const newPoints = draggingLine.initialPoints.map(p => {
              const px = timeScale.timeToCoordinate(p.time);
              const py = series.priceToCoordinate(p.price);
              if (px === null || py === null) return p;
              const newTime = coordinateToTimeEx(chartRef.current!, px + dx);
              let newPrice = series.coordinateToPrice(py + dy);
              if (newPrice !== null && isMagnetEnabled && newTime !== null) {
                newPrice = snapPointToOHLC(newTime, newPrice, data);
              }
              return { time: newTime !== null ? newTime : p.time, price: newPrice !== null ? newPrice : p.price };
            });
            return { ...d, points: newPoints };
          }
          return d;
        }));
      }
    };
    const onPointerUp = () => { setDraggingHandle(null); setDraggingLine(null); };
    window.addEventListener('pointermove', onPointerMove, { capture: true });
    window.addEventListener('pointerup', onPointerUp, { capture: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove, { capture: true });
      window.removeEventListener('pointerup', onPointerUp, { capture: true });
    };
  }, [draggingHandle, draggingLine, onDrawingsChange, isMagnetEnabled, data, isLocked]);

  const handleContainerPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 0) {
      setContextMenu(null);
    }
    if (!isReplaySelecting && (!activeTool || activeTool === 'cursor')) {
      setSelectedDrawingId(null);
      setShowDeleteIconId(null);
      setShowRectangleColorsId(null);
    }
    if (isReplaySelecting && onSetReplayCutoff && chartRef.current && mainSeriesRef.current) {
      const rect = chartContainerRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const timeScale = chartRef.current.timeScale();
      const logical = timeScale.coordinateToLogical(x);
      if (logical !== null) {
        const barData = (mainSeriesRef.current as any).dataByIndex(Math.floor(logical));
        if (barData && barData.time) onSetReplayCutoff(timeToValue(barData.time));
      }
    }
  }, [isReplaySelecting, onSetReplayCutoff, activeTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isReplaySelecting || !chartRef.current || !mainSeriesRef.current) {
      if (hoverX !== null) setHoverX(null);
      return;
    }
    const rect = chartContainerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setHoverX(x);
    const timeScale = chartRef.current.timeScale();
    const logical = timeScale.coordinateToLogical(x);
    if (logical !== null) {
      const barData = (mainSeriesRef.current as any).dataByIndex(Math.floor(logical));
      if (barData && barData.time) {
        const date = new Date(timeToValue(barData.time) * 1000);
        setHoverFormattedTime(date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }
  }, [isReplaySelecting, hoverX]);

  // Handle Context Menu (Right Click)
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = chartContainerRef.current!.getBoundingClientRect();
    setContextMenu({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      drawingId: hoveredDrawingId
    });
  }, [hoveredDrawingId]);

  const handleContextAction = (action: string) => {
    if (!contextMenu) return;
    const drawingId = contextMenu.drawingId;

    switch (action) {
      case 'remove':
        if (drawingId) handleDeleteDrawing(drawingId);
        break;
      case 'clone':
        if (drawingId) {
          const original = drawings.find(d => d.id === drawingId);
          if (original) {
            const clone = { ...original, id: `${original.type}_${Date.now()}` };
            onDrawingsChange(prev => [...prev, clone]);
          }
        }
        break;
      case 'settings':
        if (drawingId) {
          setSelectedDrawingId(drawingId);
          setShowDeleteIconId(drawingId);
        }
        break;
      case 'reset':
        chartRef.current?.timeScale().scrollToRealTime();
        break;
    }
    setContextMenu(null);
  };

  const projectedDrawings = useMemo(() => {
    if (!isReady || !chartRef.current || !mainSeriesRef.current) return [];
    const timeScale = chartRef.current.timeScale();
    const series = mainSeriesRef.current;

    return drawings.map(d => {
      return {
        ...d,
        pixels: d.points.map(p => {
          let x = timeScale.timeToCoordinate(p.time);
          if (x === null) {
            const targetVal = timeToValue(p.time);
            let closestIdx = 0;
            let minDiff = Infinity;
            for (let i = 0; i < data.length; i++) {
              const diff = Math.abs(timeToValue(data[i].time) - targetVal);
              if (diff < minDiff) {
                minDiff = diff;
                closestIdx = i;
              }
            }
            x = timeScale.logicalToCoordinate(closestIdx as any);
          }
          return { x, y: series.priceToCoordinate(p.price) };
        })
      };
    });
  }, [drawings, viewportCounter, isReady, data]);

  const projectedBrush = useMemo(() => {
    if (!isReady || !chartRef.current || !mainSeriesRef.current || activeBrushPoints.length === 0) return null;
    const timeScale = chartRef.current.timeScale();
    const series = mainSeriesRef.current;
    return activeBrushPoints
      .map(p => {
        const x = timeScale.timeToCoordinate(p.time);
        const y = series.priceToCoordinate(p.price);
        return (x !== null && y !== null) ? `${x},${y}` : '';
      })
      .filter(s => s !== '')
      .join(' ');
  }, [activeBrushPoints, viewportCounter, isReady]);

  const toggleIndicatorHidden = (id: string) => {
    setHiddenIndicators(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleTextSubmit = (id: string, val: string) => {
    onDrawingsChange(prev => prev.map(d => d.id === id ? { ...d, text: val } : d));
    setTextInputState(null);
  };

  const handleTextDoubleClick = (e: React.MouseEvent, d: any) => {
    if (isLocked) return;
    e.stopPropagation();
    e.preventDefault();
    const px = d.pixels[0].x;
    const py = d.pixels[0].y;
    if (px !== null && py !== null) {
      setTextInputState({ id: d.id, x: px, y: py - 18, value: d.text || '' });
    }
  };

  const IndicatorRow = ({ id, label, value, color, settingsId }: { id: string, label: string, value: string, color: string, settingsId: string }) => {
    const isHidden = hiddenIndicators.has(id);
    const showValues = chartSettings?.statusLine.indicatorValues ?? true;
    return (
      <div className="flex items-center group relative cursor-default h-6 transition-all duration-200">
        <div className="flex items-center">
          <span className={`text-[10px] font-medium transition-colors ${isHidden ? 'text-gray-600' : 'text-gray-400 group-hover:text-white'}`}>
            {label}
          </span>
          <div className="flex items-center ml-2 bg-[#1c1c1c]/95 border border-[#363a45] rounded-full px-1.5 py-0.5 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
            <button
              onClick={(e) => { e.stopPropagation(); toggleIndicatorHidden(id); }}
              className={`p-0.5 hover:text-white transition-colors ${isHidden ? 'text-blue-500' : 'text-gray-500'}`}
              title={isHidden ? "Show" : "Hide"}
            >
              {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); props.onOpenSettings(settingsId); }}
              className="p-0.5 text-gray-500 hover:text-white transition-colors"
              title="Settings"
            >
              <Settings size={11} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); props.onRemoveIndicator(id); }}
              className="p-0.5 text-gray-500 hover:text-[#f23645] transition-colors"
              title="Remove"
            >
              <Trash2 size={11} />
            </button>
            <button
              className="p-0.5 text-gray-500 hover:text-white transition-colors"
              title="More"
            >
              <MoreHorizontal size={11} />
            </button>
          </div>
          {showValues && (
            <span className={`text-[10px] font-bold tabular-nums ml-2 ${isHidden ? 'text-gray-600' : ''}`} style={{ color: isHidden ? undefined : color }}>
              {value}
            </span>
          )}
        </div>
      </div>
    );
  };

  const statusLine = chartSettings?.statusLine || { logo: true, symbol: true, titleMode: 'Description', openMarketStatus: true, ohlc: true, indicatorTitles: true, volume: true };

  return (
    <div
      className={`w-full h-full relative overflow-hidden bg-[#1c1c1c] ${isAnyToolActive ? 'cursor-crosshair' : ''}`}
      onPointerDown={handleContainerPointerDown}
      onMouseMove={handleMouseMove}
      onContextMenu={handleContextMenu}
    >
      <div ref={chartContainerRef} className="w-full h-full" />

      {isAnyToolActive && (
        <div ref={drawingSurfaceRef} className="absolute inset-0 z-[60] bg-transparent cursor-crosshair" />
      )}

      {/* Context Menu Rendering */}
      {contextMenu && (
        <div
          className="fixed z-[1000] bg-[#1e222d] border border-[#363a45] rounded-sm shadow-2xl py-1 min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
          style={{ left: contextMenu.x + 10, top: contextMenu.y + 10 }}
        >
          {contextMenu.drawingId ? (
            <>
              <button onClick={() => handleContextAction('settings')} className="w-full px-4 py-2 text-left text-[13px] text-gray-200 hover:bg-[#2a2e39] flex items-center justify-between">
                <div className="flex items-center space-x-3"><Settings size={14} /><span>Settings...</span></div>
              </button>
              <button onClick={() => handleContextAction('clone')} className="w-full px-4 py-2 text-left text-[13px] text-gray-200 hover:bg-[#2a2e39] flex items-center justify-between">
                <div className="flex items-center space-x-3"><Copy size={14} /><span>Clone</span></div>
                <span className="text-[10px] text-gray-500">Ctrl + Drag</span>
              </button>
              <div className="h-px bg-[#363a45] mx-2 my-1"></div>
              <button onClick={() => handleContextAction('remove')} className="w-full px-4 py-2 text-left text-[13px] text-[#f23645] hover:bg-[#2a2e39] flex items-center justify-between">
                <div className="flex items-center space-x-3"><Trash2 size={14} /><span>Remove</span></div>
                <span className="text-[10px] text-gray-500">Del</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleContextAction('reset')} className="w-full px-4 py-2 text-left text-[13px] text-gray-200 hover:bg-[#2a2e39] flex items-center justify-between">
                <div className="flex items-center space-x-3"><RefreshCw size={14} /><span>Reset Chart View</span></div>
                <span className="text-[10px] text-gray-500">Alt + R</span>
              </button>
              <button className="w-full px-4 py-2 text-left text-[13px] text-gray-200 hover:bg-[#2a2e39] flex items-center justify-between">
                <div className="flex items-center space-x-3"><PlusCircle size={14} /><span>Add Alert on {symbol}...</span></div>
                <span className="text-[10px] text-gray-500">Alt + A</span>
              </button>
              <div className="h-px bg-[#363a45] mx-2 my-1"></div>
              <button className="w-full px-4 py-2 text-left text-[13px] text-gray-200 hover:bg-[#2a2e39] flex items-center justify-between">
                <div className="flex items-center space-x-3"><EyeOff size={14} /><span>Hide All Drawings</span></div>
              </button>
              <button className="w-full px-4 py-2 text-left text-[13px] text-gray-200 hover:bg-[#2a2e39] flex items-center justify-between">
                <div className="flex items-center space-x-3"><Lock size={14} /><span>Lock All Drawings</span></div>
              </button>
              <div className="h-px bg-[#363a45] mx-2 my-1"></div>
              <button className="w-full px-4 py-2 text-left text-[13px] text-gray-200 hover:bg-[#2a2e39] flex items-center justify-between">
                <div className="flex items-center space-x-3"><Settings size={14} /><span>Chart Settings...</span></div>
              </button>
            </>
          )}
        </div>
      )}

      {textInputState && isVisible && (
        <div
          className="absolute z-[1000] pointer-events-auto"
          style={{
            left: textInputState.x - 4,
            top: textInputState.y,
          }}
        >
          <div className="relative group/input">
            <div className="absolute -inset-[1px] border border-[#2962ff] pointer-events-none rounded-[1px] shadow-[0_0_8px_rgba(41,98,255,0.4)]"></div>
            <textarea
              autoFocus
              className="bg-[#1e1e1e] text-white text-[13px] font-medium border-none outline-none resize-none px-2 py-1 min-w-[120px] min-h-[30px] rounded-[1px] shadow-2xl block overflow-hidden whitespace-nowrap"
              value={textInputState.value}
              onChange={(e) => setTextInputState({ ...textInputState, value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTextSubmit(textInputState.id, textInputState.value);
                }
                if (e.key === 'Escape') {
                  setTextInputState(null);
                }
              }}
              onBlur={() => handleTextSubmit(textInputState.id, textInputState.value)}
            />
            <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-[#2962ff] rounded-[1px]"></div>
          </div>
        </div>
      )}

      <svg className={`absolute inset-0 pointer-events-none z-[50] w-full h-full overflow-visible ${!isVisible ? 'hidden' : ''}`}>
        {projectedBrush && <polyline points={projectedBrush} fill="none" stroke="#2962ff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
        {projectedDrawings.map((d) => {
          if (textInputState?.id === d.id) return null;
          const isSelected = d.id === selectedDrawingId;
          const isHovered = d.id === hoveredDrawingId;
          if (d.type !== 'anchored_vwap' && d.pixels.some(p => p.x === null || p.y === null)) return null;
          const onLineDoubleClick = (e: any, id: string) => {
            if (isLocked) return;
            e.stopPropagation(); e.preventDefault(); setShowDeleteIconId(id); setSelectedDrawingId(id);
          };

          if (d.type === 'anchored_vwap') {
            const startTimeVal = timeToValue(d.points[0].time);
            const startIndex = data.findIndex(item => timeToValue(item.time) >= startTimeVal);
            if (startIndex === -1) return null;
            const timeScale = chartRef.current!.timeScale();
            const series = mainSeriesRef.current!;
            let cumulativePV = 0;
            let cumulativeV = 0;
            const pointsVWAP: string[] = [];
            const pointsUpper: string[] = [];
            const pointsLower: string[] = [];
            let anchorX = timeScale.timeToCoordinate(d.points[0].time);
            let anchorY = series.priceToCoordinate(d.points[0].price);
            if (anchorX === null) anchorX = timeScale.logicalToCoordinate(startIndex as any);

            for (let i = startIndex; i < data.length; i++) {
              const item = data[i];
              const typicalPrice = (item.high + item.low + item.close) / 3;
              const vol = 100;
              cumulativePV += typicalPrice * vol;
              cumulativeV += vol;
              const avwap = cumulativePV / cumulativeV;
              const distance = i - startIndex;
              const spread = avwap * (Math.sqrt(distance) * 0.002);
              const upper = avwap + spread;
              const lower = avwap - spread;
              const x = timeScale.timeToCoordinate(item.time);
              if (x !== null) {
                const yVWAP = series.priceToCoordinate(avwap);
                const yUpper = series.priceToCoordinate(upper);
                const yLower = series.priceToCoordinate(lower);
                if (yVWAP !== null) pointsVWAP.push(`${x},${yVWAP}`);
                if (yUpper !== null) pointsUpper.push(`${x},${yUpper}`);
                if (yLower !== null) pointsLower.push(`${x},${yLower}`);
              }
            }
            if (pointsVWAP.length < 2) return null;
            const upperRev = [...pointsUpper].reverse();
            const fillPoints = [...pointsLower, ...upperRev].join(' ');
            return (
              <g key={d.id} className="pointer-events-auto cursor-pointer"
                onPointerEnter={() => setHoveredDrawingId(d.id)}
                onPointerLeave={() => setHoveredDrawingId(null)}
                onPointerDown={(e) => onLinePointerDown(e, d.id)}
                onDoubleClick={(e) => onLineDoubleClick(e, d.id)}>
                <polygon points={fillPoints} fill="rgba(8, 153, 129, 0.08)" stroke="none" />
                <polyline points={pointsUpper.join(' ')} fill="none" stroke="#089981" strokeWidth={1} opacity="0.6" />
                <polyline points={pointsLower.join(' ')} fill="none" stroke="#089981" strokeWidth={1} opacity="0.6" />
                <polyline points={pointsVWAP.join(' ')} fill="none" stroke={isSelected || isHovered ? '#fff' : '#2962ff'} strokeWidth={isSelected ? 3 : 2} strokeLinecap="round" />
                {anchorX !== null && anchorY !== null && isSelected && (
                  <circle cx={anchorX} cy={anchorY} r={6} fill="white" stroke="#2962ff" strokeWidth={1.5} onPointerDown={(e) => onHandlePointerDown(e, d.id, 0)} className="cursor-move" />
                )}
              </g>
            );
          }

          if (d.type === 'projection' && d.pixels.length >= 3) {
            const [p0, p1, p2] = d.pixels;
            const r1 = Math.sqrt(Math.pow(p1.x! - p0.x!, 2) + Math.pow(p1.y! - p0.y!, 2));
            const r2 = Math.sqrt(Math.pow(p2.x! - p0.x!, 2) + Math.pow(p2.y! - p0.y!, 2));
            const r = (r1 + r2) / 2;
            const angle1 = Math.atan2(p1.y! - p0.y!, p1.x! - p0.x!);
            const angle2 = Math.atan2(p2.y! - p0.y!, p2.x! - p0.x!);
            let diff = angle2 - angle1;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            const sweepFlag = diff > 0 ? 1 : 0;
            const largeArcFlag = Math.abs(diff) > Math.PI ? 1 : 0;
            return (
              <g key={d.id} className="pointer-events-auto cursor-pointer"
                onPointerEnter={() => setHoveredDrawingId(d.id)}
                onPointerLeave={() => setHoveredDrawingId(null)}
                onPointerDown={(e) => onLinePointerDown(e, d.id)}
                onDoubleClick={(e) => onLineDoubleClick(e, d.id)}>
                <line x1={p0.x!} y1={p0.y!} x2={p1.x!} y2={p1.y!} stroke={isSelected || isHovered ? '#fff' : d.color} strokeWidth={1.5} opacity="0.8" />
                <line x1={p0.x!} y1={p0.y!} x2={p2.x!} y2={p2.y!} stroke={isSelected || isHovered ? '#fff' : d.color} strokeWidth={1.5} opacity="0.8" />
                <path d={`M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${p2.x} ${p2.y} Z`} fill="rgba(41, 98, 255, 0.25)" stroke={isSelected || isHovered ? '#fff' : d.color} strokeWidth={isSelected ? 2.5 : 1.5} />
                {isSelected && (
                  <>
                    <circle cx={p0.x!} cy={p0.y!} r={5} fill="white" stroke="#2962ff" strokeWidth={1.5} onPointerDown={(e) => onHandlePointerDown(e, d.id, 0)} className="cursor-move" />
                    <circle cx={p1.x!} cy={p1.y!} r={5} fill="white" stroke="#2962ff" strokeWidth={1.5} onPointerDown={(e) => onHandlePointerDown(e, d.id, 1)} className="cursor-move" />
                    <circle cx={p2.x!} cy={p2.y!} r={5} fill="white" stroke="#2962ff" strokeWidth={1.5} onPointerDown={(e) => onHandlePointerDown(e, d.id, 2)} className="cursor-move" />
                  </>
                )}
              </g>
            );
          }

          if (d.type === 'fib_fan' && d.pixels.length >= 2) {
            const [p0, p1] = d.pixels;
            const originX = p0.x!;
            const originY = p0.y!;
            const targetX = p1.x!;
            const targetY = p1.y!;
            const dx = targetX - originX;
            const dy = targetY - originY;
            const extendRay = (tx: number, ty: number) => {
              const rdx = tx - originX;
              const rdy = ty - originY;
              const dist = Math.sqrt(rdx * rdx + rdy * rdy);
              if (dist < 1) return { x: tx, y: ty };
              const factor = 4000 / dist;
              return { x: originX + rdx * factor, y: originY + rdy * factor };
            };
            const levels = FIB_FAN_LEVELS;
            return (
              <g key={d.id} className="pointer-events-auto cursor-pointer"
                onPointerEnter={() => setHoveredDrawingId(d.id)}
                onPointerLeave={() => setHoveredDrawingId(null)}
                onPointerDown={(e) => onLinePointerDown(e, d.id)}
                onDoubleClick={(e) => onLineDoubleClick(e, d.id)}>
                <line x1={originX} y1={targetY} x2={targetX} y2={targetY} stroke="#787b86" strokeWidth={1} strokeDasharray="3 3" opacity="0.4" />
                <line x1={targetX} y1={originY} x2={targetX} y2={targetY} stroke="#787b86" strokeWidth={1} strokeDasharray="3 3" opacity="0.4" />
                <line x1={originX} y1={originY} x2={targetX} y2={targetY} stroke={d.color} strokeWidth={isSelected ? 2 : 1} />
                {levels.map((lvl, idx) => {
                  const levelVal = lvl.level;
                  const ptV = { x: targetX, y: originY + dy * levelVal };
                  const rayV = extendRay(ptV.x, ptV.y);
                  const ptH = { x: originX + dx * levelVal, y: targetY };
                  const rayH = extendRay(ptH.x, ptH.y);
                  const nextLvl = levels[idx + 1];
                  let fillV = null, fillH = null;
                  if (nextLvl) {
                    const nPtV = { x: targetX, y: originY + dy * nextLvl.level };
                    const nRayV = extendRay(nPtV.x, nPtV.y);
                    const nPtH = { x: originX + dx * nextLvl.level, y: targetY };
                    const nRayH = extendRay(nPtH.x, nPtH.y);
                    fillV = (<polygon points={`${originX},${originY} ${rayV.x},${rayV.y} ${nRayV.x},${nRayV.y}`} fill={lvl.color} opacity="0.15" />);
                    fillH = (<polygon points={`${originX},${originY} ${rayH.x},${rayH.y} ${nRayH.x},${nRayH.y}`} fill={lvl.color} opacity="0.15" />);
                  }
                  return (
                    <g key={lvl.level}>
                      {fillV} {fillH}
                      <line x1={originX} y1={originY} x2={rayV.x} y2={rayV.y} stroke={lvl.color} strokeWidth={1} />
                      <line x1={originX} y1={originY} x2={rayH.x} y2={rayH.y} stroke={lvl.color} strokeWidth={1} />
                      <text x={ptV.x + 5} y={ptV.y} fill={lvl.color} fontSize="10" fontWeight="bold" dominantBaseline="middle">{levelVal}</text>
                      <text x={ptH.x} y={ptH.y + 12} fill={lvl.color} fontSize="10" fontWeight="bold" textAnchor="middle">{levelVal}</text>
                    </g>
                  );
                })}
                {isSelected && (
                  <>
                    <circle cx={originX} cy={originY} r={5} fill="white" stroke="#2962ff" strokeWidth={1.5} onPointerDown={(e) => onHandlePointerDown(e, d.id, 0)} className="cursor-move" />
                    <circle cx={targetX} cy={targetY} r={5} fill="white" stroke="#2962ff" strokeWidth={1.5} onPointerDown={(e) => onHandlePointerDown(e, d.id, 1)} className="cursor-move" />
                  </>
                )}
              </g>
            );
          }

          if (d.type === 'rectangle' && d.pixels.length >= 2) {
            const [p1, p2] = d.pixels;
            const minX = Math.min(p1.x!, p2.x!);
            const minY = Math.min(p1.y!, p2.y!);
            const w = Math.abs(p1.x! - p2.x!);
            const h = Math.abs(p1.y! - p2.y!);
            return (
              <g key={d.id} className="pointer-events-auto cursor-pointer"
                onPointerEnter={() => setHoveredDrawingId(d.id)}
                onPointerLeave={() => setHoveredDrawingId(null)}
                onPointerDown={(e) => onLinePointerDown(e, d.id)}
                onDoubleClick={(e) => onLineDoubleClick(e, d.id)}>
                <rect x={minX} y={minY} width={w} height={h} fill={`${d.color}15`} stroke={isSelected || isHovered ? '#fff' : d.color} strokeWidth={isSelected ? 2.5 : 1.5} />
                {d.text && (<text x={minX + w / 2} y={minY + h / 2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="13" fontWeight="bold" style={{ pointerEvents: 'none' }}>{d.text}</text>)}
                {isSelected && (
                  <>
                    <circle cx={p1.x!} cy={p1.y!} r={5} fill="white" stroke="#2962ff" strokeWidth={1.5} onPointerDown={(e) => onHandlePointerDown(e, d.id, 0)} className="cursor-move" />
                    <circle cx={p2.x!} cy={p2.y!} r={5} fill="white" stroke="#2962ff" strokeWidth={1.5} onPointerDown={(e) => onHandlePointerDown(e, d.id, 1)} className="cursor-move" />
                  </>
                )}
              </g>
            );
          }

          if (d.type === 'measure' && d.pixels.length >= 2) {
            const [p1, p2] = d.pixels, [pr1, pr2] = d.points.map(p => p.price);
            const minX = Math.min(p1.x!, p2.x!), minY = Math.min(p1.y!, p2.y!), maxX = Math.max(p1.x!, p2.x!), maxY = Math.max(p1.y!, p2.y!), w = maxX - minX, h = maxY - minY;
            const priceDiff = pr2 - pr1, pricePct = (priceDiff / pr1) * 100, pips = Math.round(priceDiff * 100);
            const midX = minX + w / 2, arrowSize = 10, arrowDir = p2.y! > p1.y! ? 1 : -1;
            return (
              <g key={d.id} className="pointer-events-auto cursor-pointer"
                onPointerEnter={() => setHoveredDrawingId(d.id)}
                onPointerLeave={() => setHoveredDrawingId(null)}
                onPointerDown={(e) => onLinePointerDown(e, d.id)}
                onDoubleClick={(e) => onLineDoubleClick(e, d.id)}>
                <rect x={minX} y={minY} width={w} height={h} fill="rgba(41, 98, 255, 0.15)" stroke="#2962ff" strokeWidth={1.5} />
                <line x1={midX} y1={p1.y!} x2={midX} y2={p2.y!} stroke="#2962ff" strokeWidth={1.5} />
                <path d={`M ${midX - 7} ${p2.y! - arrowSize * arrowDir} L ${midX} ${p2.y!} L ${midX + 7} ${p2.y! - arrowSize * arrowDir}`} fill="none" stroke="#2962ff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                <g transform={`translate(${midX}, ${maxY + 14})`}>
                  <rect x="-65" y="-11" width="130" height="22" rx="4" fill="#1e222d" stroke="#363a45" strokeWidth="1" />
                  <text y="4" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Inter, sans-serif">{priceDiff.toFixed(2)} ({pricePct.toFixed(2)}%) {pips}</text>
                </g>
                {isSelected && (
                  <>
                    <circle cx={p1.x!} cy={p1.y!} r={5} fill="#1c1c1c" stroke="#2962ff" strokeWidth={2} onPointerDown={(e) => onHandlePointerDown(e, d.id, 0)} className="cursor-move" />
                    <circle cx={p2.x!} cy={p2.y!} r={5} fill="#1c1c1c" stroke="#2962ff" strokeWidth={2} onPointerDown={(e) => onHandlePointerDown(e, d.id, 1)} className="cursor-move" />
                  </>
                )}
              </g>
            );
          }

          if (d.type === 'fib' && d.pixels.length >= 2) {
            const [p1, p2] = d.pixels, pr1 = d.points[0].price, pr2 = d.points[1].price;
            const levels = FIB_LEVELS.map(({ level, color }) => ({ level, color, y: p2.y! + (p1.y! - p2.y!) * level, price: pr2 + (pr1 - pr2) * level }));
            const leftX = Math.min(p1.x!, p2.x!), rightX = Math.max(p1.x!, p2.x!), width = Math.abs(p1.x! - p2.x!);
            return (
              <g key={d.id} className="pointer-events-auto cursor-pointer"
                onPointerEnter={() => setHoveredDrawingId(d.id)}
                onPointerLeave={() => setHoveredDrawingId(null)}
                onPointerDown={(e) => onLinePointerDown(e, d.id)}
                onDoubleClick={(e) => onLineDoubleClick(e, d.id)}>
                <line x1={p1.x!} y1={p1.y!} x2={p2.x!} y2={p2.y!} stroke="#787b86" strokeWidth={1} strokeDasharray="4" opacity="0.6" />
                {levels.map((lvl, idx) => {
                  const nextLvl = levels[idx + 1];
                  return (
                    <g key={lvl.level}>
                      {nextLvl && (<rect x={leftX} y={Math.min(lvl.y, nextLvl.y)} width={width} height={Math.abs(lvl.y - nextLvl.y)} fill={lvl.color} opacity="0.15" />)}
                      <line x1={leftX} y1={lvl.y} x2={rightX} y2={lvl.y} stroke={lvl.color} strokeWidth={1} />
                      <text x={leftX - 4} y={lvl.y} textAnchor="end" dominantBaseline="middle" fill={lvl.color} fontSize="10" fontWeight="500">{lvl.level} ({lvl.price.toFixed(2)})</text>
                    </g>
                  );
                })}
                {isSelected && (
                  <>
                    <circle cx={p1.x!} cy={p1.y!} r={6} fill="white" stroke="#2962ff" strokeWidth={2} onPointerDown={(e) => onHandlePointerDown(e, d.id, 0)} className="cursor-grab active:cursor-grabbing" />
                    <circle cx={p2.x!} cy={p2.y!} r={6} fill="white" stroke="#2962ff" strokeWidth={2} onPointerDown={(e) => onHandlePointerDown(e, d.id, 1)} className="cursor-grab active:cursor-grabbing" />
                  </>
                )}
              </g>
            );
          }

          if (d.type === 'long_position' || d.type === 'short_position') {
            const [pTarget, pEntry, pStop] = d.pixels, [priceTarget, priceEntry, priceStop] = d.points.map(p => p.price);
            const isLong = d.type === 'long_position', widthL = d.widthLeft || 100, widthR = d.widthRight || 100, left = pEntry.x! - widthL, boxWidth = widthL + widthR;
            const profitColor = 'rgba(8, 153, 129, 0.25)', lossColor = 'rgba(242, 54, 69, 0.25)', profitStroke = '#089981', lossStroke = '#f23645';
            const profitY = Math.min(pTarget.y!, pEntry.y!), profitH = Math.abs(pTarget.y! - pEntry.y!), lossY = Math.min(pEntry.y!, pStop.y!), lossH = Math.abs(pStop.y! - pEntry.y!);
            const targetDiff = Math.abs(priceTarget - priceEntry), stopDiff = Math.abs(priceEntry - priceStop), targetPct = (targetDiff / priceEntry) * 100, stopPct = (stopDiff / priceEntry) * 100, rr = (targetDiff / stopDiff).toFixed(2);
            return (
              <g key={d.id} className="pointer-events-auto cursor-pointer"
                onPointerEnter={() => setHoveredDrawingId(d.id)} onPointerLeave={() => setHoveredDrawingId(null)} onPointerDown={(e) => onLinePointerDown(e, d.id)} onDoubleClick={(e) => onLineDoubleClick(e, d.id)}>
                <rect x={left} y={profitY} width={boxWidth} height={profitH} fill={profitColor} />
                <rect x={left} y={lossY} width={boxWidth} height={lossH} fill={lossColor} />
                <line x1={left} y1={pEntry.y!} x2={left + boxWidth} y2={pEntry.y!} stroke="white" strokeWidth={1} strokeDasharray="4" opacity="0.6" />
                {isSelected && (
                  <>
                    <rect x={left} y={Math.min(profitY, lossY)} width={boxWidth} height={profitH + lossH} fill="none" stroke="#2962ff" strokeWidth={1} />
                    <g transform={`translate(${pEntry.x}, ${isLong ? lossY + lossH + 12 : profitY - 12})`}><rect x="-85" y="-10" width="170" height="20" rx="4" fill={lossStroke} /><text y="4" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Stop: {stopDiff.toFixed(2)} ({stopPct.toFixed(3)}%)</text></g>
                    <g transform={`translate(${pEntry.x}, ${isLong ? profitY - 12 : lossY + lossH + 12})`}><rect x="-85" y="-10" width="170" height="20" rx="4" fill={profitStroke} /><text y="4" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Target: {targetDiff.toFixed(2)} ({targetPct.toFixed(3)}%)</text></g>
                    <rect x={pEntry.x! - 4} y={pTarget.y! - 4} width={8} height={8} rx="1" fill="white" stroke="#2962ff" strokeWidth={1.5} onPointerDown={(e) => onHandlePointerDown(e, d.id, 0)} className="cursor-ns-resize" />
                    <rect x={pEntry.x! - 4} y={pEntry.y! - 4} width={8} height={8} rx="1" fill="white" stroke="#2962ff" strokeWidth={1.5} onPointerDown={(e) => onHandlePointerDown(e, d.id, 1)} className="cursor-move" />
                    <rect x={pEntry.x! - 4} y={pStop.y! - 4} width={8} height={8} rx="1" fill="white" stroke="#2962ff" strokeWidth={1.5} onPointerDown={(e) => onHandlePointerDown(e, d.id, 2)} className="cursor-ns-resize" />
                    <rect x={left - 4} y={pEntry.y! - 4} width={8} height={8} rx="1" fill="white" stroke="#2962ff" strokeWidth={1.5} onPointerDown={(e) => onHandlePointerDown(e, d.id, 3)} className="cursor-ew-resize" />
                    <rect x={left + boxWidth - 4} y={pEntry.y! - 4} width={8} height={8} rx="1" fill="white" stroke="#2962ff" strokeWidth={1.5} onPointerDown={(e) => onHandlePointerDown(e, d.id, 4)} className="cursor-ew-resize" />
                  </>
                )}
              </g>
            );
          }

          if (d.type === 'text') {
            const pt = d.pixels[0];
            return (
              <g key={d.id} className="pointer-events-auto cursor-text"
                onPointerEnter={() => setHoveredDrawingId(d.id)} onPointerLeave={() => setHoveredDrawingId(null)} onPointerDown={(e) => onLinePointerDown(e, d.id)} onDoubleClick={(e) => handleTextDoubleClick(e, d)}>
                <rect x={pt.x! - 4} y={pt.y! - 18} width={(d.text?.length || 8) * 8} height={24} fill="transparent" stroke={isSelected ? '#2962ff' : 'transparent'} strokeWidth={1} />
                <text x={pt.x} y={pt.y} fill={isHovered || isSelected ? '#fff' : '#d1d4dc'} fontSize="13" fontFamily="Inter, sans-serif" fontWeight="500">{d.text || ''}</text>
              </g>
            );
          }

          if (d.type === 'brush') {
            const pointsStr = d.pixels.map(p => `${p.x},${p.y}`).join(' ');
            return (
              <g key={d.id} className="pointer-events-auto cursor-pointer" onPointerEnter={() => setHoveredDrawingId(d.id)} onPointerLeave={() => setHoveredDrawingId(null)} onPointerDown={(e) => onLinePointerDown(e, d.id)} onDoubleClick={(e) => onLineDoubleClick(e, d.id)}>
                <polyline points={pointsStr} fill="none" stroke="transparent" strokeWidth={15} />
                <polyline points={pointsStr} fill="none" stroke={isSelected || isHovered ? '#2962ff' : d.color} strokeWidth={isSelected ? 3 : 2} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          }

          if (d.type === 'icons' && d.pixels.length === 5) {
            const [pX, pA, pB, pC, pD] = d.pixels, labels = ['X', 'A', 'B', 'C', 'D'];
            return (
              <g key={d.id} className="pointer-events-auto cursor-pointer" onPointerEnter={() => setHoveredDrawingId(d.id)} onPointerLeave={() => setHoveredDrawingId(null)} onPointerDown={(e) => onLinePointerDown(e, d.id)} onDoubleClick={(e) => onLineDoubleClick(e, d.id)}>
                <polygon points={`${pX.x},${pX.y} ${pA.x},${pA.y} ${pB.x},${pB.y}`} fill={isSelected || isHovered ? 'rgba(41, 98, 255, 0.25)' : 'rgba(41, 98, 255, 0.15)'} stroke="none" />
                <polygon points={`${pB.x},${pB.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`} fill={isSelected || isHovered ? 'rgba(41, 98, 255, 0.25)' : 'rgba(41, 98, 255, 0.15)'} stroke="none" />
                <polyline points={`${pX.x},${pX.y} ${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`} fill="none" stroke={isSelected || isHovered ? '#2962ff' : d.color} strokeWidth={isSelected ? 2.5 : 1.5} />
                {d.pixels.map((p, idx) => (
                  <g key={idx}>
                    {isSelected && (<circle cx={p.x!} cy={p.y!} r={5} fill="white" stroke="#2962ff" strokeWidth={1.5} onPointerDown={(e) => onHandlePointerDown(e, d.id, idx)} />)}
                    <text x={p.x!} y={p.y! - 12} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>{labels[idx]}</text>
                  </g>
                ))}
              </g>
            );
          }

          if ((d.type === 'trendline' || d.type === 'ray') && d.pixels.length >= 2) {
            return (
              <g key={d.id} className="pointer-events-auto cursor-pointer" onPointerEnter={() => setHoveredDrawingId(d.id)} onPointerLeave={() => setHoveredDrawingId(null)} onPointerDown={(e) => onLinePointerDown(e, d.id)} onDoubleClick={(e) => onLineDoubleClick(e, d.id)}>
                <line x1={d.pixels[0].x!} y1={d.pixels[0].y!} x2={d.pixels[1].x!} y2={d.pixels[1].y!} stroke="transparent" strokeWidth={15} />
                <line x1={d.pixels[0].x!} y1={d.pixels[0].y!} x2={d.pixels[1].x!} y2={d.pixels[1].y!} stroke={isSelected || isHovered ? '#2962ff' : d.color} strokeWidth={isSelected ? 3 : 2} />
                {d.pixels.map((p, idx) => isSelected && <circle key={idx} cx={p.x!} cy={p.y!} r={6} fill="white" stroke="#2962ff" strokeWidth={2} onPointerDown={(e) => onHandlePointerDown(e, d.id, idx)} />)}
              </g>
            );
          }

          if (d.type === 'horizontal_line') {
            return (
              <g key={d.id} className="pointer-events-auto cursor-pointer" onPointerEnter={() => setHoveredDrawingId(d.id)} onPointerLeave={() => setHoveredDrawingId(null)} onPointerDown={(e) => onLinePointerDown(e, d.id)} onDoubleClick={(e) => onLineDoubleClick(e, d.id)}>
                <line x1={0} y1={d.pixels[0].y!} x2="100%" y2={d.pixels[0].y!} stroke="transparent" strokeWidth={15} />
                <line x1={0} y1={d.pixels[0].y!} x2="100%" y2={d.pixels[0].y!} stroke={isSelected || isHovered ? '#2962ff' : d.color} strokeWidth={isSelected ? 3 : 2} />
                {isSelected && (<circle cx={d.pixels[0].x!} cy={d.pixels[0].y!} r={6} fill="white" stroke="#2962ff" strokeWidth={2} onPointerDown={(e) => onHandlePointerDown(e, d.id, 0)} />)}
              </g>
            );
          }

          if (d.type === 'vertical_line') {
            return (
              <g key={d.id} className="pointer-events-auto cursor-pointer" onPointerEnter={() => setHoveredDrawingId(d.id)} onPointerLeave={() => setHoveredDrawingId(null)} onPointerDown={(e) => onLinePointerDown(e, d.id)} onDoubleClick={(e) => onLineDoubleClick(e, d.id)}>
                <line x1={d.pixels[0].x!} y1={0} x2={d.pixels[0].x!} y2="100%" stroke="transparent" strokeWidth={15} />
                <line x1={d.pixels[0].x!} y1={0} x2={d.pixels[0].x!} y2="100%" stroke={isSelected || isHovered ? '#2962ff' : d.color} strokeWidth={isSelected ? 3 : 2} />
                {isSelected && (<circle cx={d.pixels[0].x!} cy={d.pixels[0].y!} r={6} fill="white" stroke="#2962ff" strokeWidth={2} onPointerDown={(e) => onHandlePointerDown(e, d.id, 0)} />)}
              </g>
            );
          }
          return null;
        })}
      </svg>

      {showDeleteIconId && projectedDrawings.find(d => d.id === showDeleteIconId) && !isLocked && isVisible && (() => {
        const d = projectedDrawings.find(d => d.id === showDeleteIconId)!;
        let x = 0; let y = 0;
        if (d.type === 'horizontal_line') { x = (chartContainerRef.current?.clientWidth || 0) / 2; y = d.pixels[0].y!; }
        else if (d.type === 'vertical_line') { x = d.pixels[0].x!; y = (chartContainerRef.current?.clientHeight || 0) / 2; }
        else if (d.type === 'brush') { const m = Math.floor(d.pixels.length / 2); x = d.pixels[m].x!; y = d.pixels[m].y!; }
        else if (d.type === 'text') { x = d.pixels[0].x!; y = d.pixels[0].y!; }
        else if (d.type === 'long_position' || d.type === 'short_position') { x = d.pixels[1].x!; y = d.pixels[1].y!; }
        else if (d.type === 'fib' || d.type === 'measure' || d.type === 'rectangle' || d.type === 'fib_fan' || d.type === 'projection' || d.type === 'anchored_vwap') { x = (d.pixels[0].x! + (d.pixels[1]?.x! || d.pixels[0].x!)) / 2; y = (d.pixels[0].y! + (d.pixels[1]?.y! || d.pixels[0].y!)) / 2; }
        else if (d.pixels.length >= 2) { x = (d.pixels[0].x! + d.pixels[1].x!) / 2; y = (d.pixels[0].y! + d.pixels[1].y!) / 2; }
        return (
          <div className="absolute z-[300] -translate-x-1/2 -translate-y-[45px] pointer-events-auto flex flex-col items-center" style={{ left: x, top: y }}>
            <div className="bg-[#1e222d] border border-[#363a45] rounded-lg shadow-2xl flex items-center p-1.5 space-x-1.5">
              {d.type === 'rectangle' && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowRectangleColorsId(showRectangleColorsId === d.id ? null : d.id); }}
                    className={`p-1.5 rounded transition-colors ${showRectangleColorsId === d.id ? 'bg-[#2962ff] text-white' : 'text-gray-400 hover:text-white'}`}
                    title="Settings"
                  >
                    <Settings size={16} />
                  </button>
                  {showRectangleColorsId === d.id && (
                    <RectangleSettingsModal
                      drawing={d}
                      onClose={() => setShowRectangleColorsId(null)}
                      onUpdate={(updates) => handleUpdateDrawing(d.id, updates)}
                    />
                  )}
                </>
              )}
              <button
                onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); handleDeleteDrawing(d.id); }}
                className="bg-[#f23645]/10 hover:bg-[#f23645] text-[#f23645] hover:text-white p-1.5 rounded transition-all active:scale-90 flex items-center justify-center border border-[#f23645]/20"
                title="Delete"
              >
                <Trash2 size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#363a45]"></div>
          </div>
        );
      })()}

      {(isReplaySelecting && hoverX !== null) && (
        <div className="absolute inset-0 z-[120] pointer-events-none">
          <div className="absolute top-0 bottom-0 right-0 bg-black/60 backdrop-blur-[1px]" style={{ left: hoverX }} />
          <div className="absolute top-0 bottom-0 w-px bg-[#2962ff] shadow-[0_0_12px_rgba(41,98,255,0.7)]" style={{ left: hoverX }}>
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#0c0c0d] border border-[#2962ff] p-2.5 rounded shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-[#2962ff] animate-pulse"><Scissors size={20} /></div>
          </div>
          <div className="absolute bottom-[60px] px-3 py-1.5 bg-[#2962ff] text-white text-[11px] font-bold rounded shadow-xl whitespace-nowrap" style={{ left: hoverX + 15 }}>{hoverFormattedTime}</div>
        </div>
      )}
      {replayCutoffTime && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.03]"><span className="text-[120px] font-black text-white uppercase tracking-tighter whitespace-nowrap">Bar Replay</span></div>}

      <div className="absolute top-2 left-2 z-[500] pointer-events-none select-none flex flex-col space-y-2">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            {statusLine.logo && <PairIcons symbol={symbol} size={14} />}
            {statusLine.symbol && (
              <div className="flex items-center space-x-1.5">
                <span className="text-[13px] font-bold text-gray-100 uppercase tracking-tight">
                  {statusLine.titleMode === 'Ticker' ? symbol : symbol}
                </span>
                <span className="text-[11px] text-gray-500 font-medium">· {timeframe}</span>
              </div>
            )}
          </div>
          {displayOHLC && statusLine.ohlc && (
            <div className="flex space-x-2 text-[10px] font-mono mt-0.5 ml-0">
              <span className="text-gray-400">O<span className="text-[#089981] ml-0.5">{displayOHLC.open}</span></span>
              <span className="text-gray-400">H<span className="text-[#089981] ml-0.5">{displayOHLC.high}</span></span>
              <span className="text-gray-400">L<span className="text-[#f23645] ml-0.5">{displayOHLC.low}</span></span>
              <span className="text-gray-400">C<span className="text-white ml-0.5 font-bold">{displayOHLC.close}</span></span>
            </div>
          )}
        </div>

        {chartSettings?.trading.buySellButtons && (
          <div className="flex items-center space-x-0.5 pointer-events-auto">
            <button className="flex flex-col items-center bg-[#f23645] hover:bg-[#d32f2f] px-2 py-[3px] rounded-l-md transition-colors shadow-lg active:scale-95 group">
              <span className="text-[8.5px] font-bold text-white uppercase tracking-tighter">Sell</span>
              <span className="text-[10.5px] font-bold text-white tabular-nums">{displayOHLC?.close.toFixed(2) || '0.00'}</span>
            </button>
            <div className="w-[19px] h-[26px] flex items-center justify-center bg-black/40 text-[8.5px] font-bold text-gray-400 border-x border-[#363a45]">
              40
            </div>
            <button className="flex flex-col items-center bg-[#2962ff] hover:bg-[#1e4bd8] px-2 py-[3px] rounded-r-md transition-colors shadow-lg active:scale-95 group">
              <span className="text-[8.5px] font-bold text-white uppercase tracking-tighter">Buy</span>
              <span className="text-[10.5px] font-bold text-white tabular-nums">{(displayOHLC?.close || 0 + 0.05).toFixed(2)}</span>
            </button>
          </div>
        )}

        <div className="flex flex-col ml-1 pointer-events-auto">
          {showIndicatorLegend && (
            <div className="flex flex-col space-y-0.5 mb-1">
              {props.showVolume && statusLine.volume && (<IndicatorRow id="vol" label="Volume" value="40" color="#089981" settingsId="vol" />)}
              {statusLine.indicatorTitles && (
                <>
                  {props.showSma1 && (<IndicatorRow id="sma1" label={`SMA ${props.sma1Period} close`} value="59.375" color="#089981" settingsId="sma1" />)}
                  {props.showSma2 && (<IndicatorRow id="sma2" label={`SMA ${props.sma2Period} close`} value="59.390" color="#2962ff" settingsId="sma2" />)}
                  {props.showEma10 && (<IndicatorRow id="ema10" label={`EMA ${props.ema10Period} close`} value="0.00" color="#42a5f5" settingsId="ema10" />)}
                  {props.showEma20 && (<IndicatorRow id="ema20" label={`EMA ${props.ema20Period} close`} value="0.00" color="#ffa726" settingsId="ema20" />)}
                  {props.showRsi && (<IndicatorRow id="rsi" label={`RSI ${props.rsiPeriod} close`} value="50.00" color="#9575cd" settingsId="rsi" />)}
                  {props.showVwap && (<IndicatorRow id="vwap" label="VWAP" value="0.00" color="#ffb74d" settingsId="vwap" />)}
                  {props.showBb && (<IndicatorRow id="bb" label={`BB ${props.bbPeriod}`} value="0.00" color="rgba(66, 165, 245, 0.4)" settingsId="bb" />)}
                  {props.showAtr && (<IndicatorRow id="atr" label={`ATR ${props.atrPeriod}`} value="0.00" color={TV_RED} settingsId="atr" />)}
                </>
              )}
            </div>
          )}
          <button onClick={() => setShowIndicatorLegend(!showIndicatorLegend)} className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            {showIndicatorLegend ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
});

export default TradingChart;