import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TradingChart, { TradingChartHandle } from './components/TradingChart';
import RightPanel from './components/RightPanel';
import BottomBar from './components/BottomBar';
import IndicatorsModal from './components/IndicatorsModal';
import SymbolSearchModal from './components/SymbolSearchModal';
import ToolSearchModal from './components/ToolSearchModal';
import SideMenu from './components/SideMenu';
import IndicatorSettingsModal from './components/IndicatorSettingsModal';
import GoToDateModal from './components/GoToDateModal';
import AlertModal from './components/AlertModal';
import PineEditor from './components/PineEditor';
import StrategyTester from './components/StrategyTester';
import TradingPanel from './components/TradingPanel';
import SettingsModal from './components/SettingsModal';
import ReplayToolbar from './components/ReplayToolbar';
import { generateMockOHLC, generateVolumeData } from './utils/mockData';
import mt5Service from './mt5Service';
import { getMarketAnalysis } from './services/geminiService';
import { ToolType } from './icons/toolTypes';
import { ChartSettings, Drawing } from './types';
import { ReplayManager, ReplayState } from './services/replayService';
import { Info, X, Maximize2 } from 'lucide-react';

export interface TimeZone {
  label: string;
  value: string;
  offsetLabel: string;
}

export interface UserAlert {
  id: string;
  price: number;
  name: string;
  message: string;
  symbol: string;
  active: boolean;
}

export type ChartStyle = 'bars' | 'candles' | 'hollow_candles' | 'columns' | 'line' | 'area' | 'baseline';

export const TIME_ZONES: TimeZone[] = [
  { label: 'UTC', value: 'UTC', offsetLabel: '' },
  { label: 'Exchange', value: 'America/New_York', offsetLabel: '' },
  { label: 'Honolulu', value: 'Pacific/Honolulu', offsetLabel: '(UTC-10)' },
  { label: 'Anchorage', value: 'America/Anchorage', offsetLabel: '(UTC-9)' },
  { label: 'Los Angeles', value: 'America/Los_Angeles', offsetLabel: '(UTC-8)' },
  { label: 'Denver', value: 'America/Denver', offsetLabel: '(UTC-7)' },
  { label: 'Chicago', value: 'Asia/Chicago', offsetLabel: '(UTC-6)' },
  { label: 'New York', value: 'America/New_York', offsetLabel: '(UTC-5)' },
  { label: 'London', value: 'Europe/London', offsetLabel: '(UTC+0)' },
  { label: 'Berlin', value: 'Europe/Berlin', offsetLabel: '(UTC+1)' },
  { label: 'Moscow', value: 'Europe/Moscow', offsetLabel: '(UTC+3)' },
  { label: 'Dubai', value: 'Asia/Dubai', offsetLabel: '(UTC+4)' },
  { label: 'Kolkata', value: 'Asia/Kolkata', offsetLabel: '(UTC+5:30)' },
  { label: 'Hong Kong', value: 'Asia/Hong_Kong', offsetLabel: '(UTC+8)' },
  { label: 'Tokyo', value: 'Asia/Tokyo', offsetLabel: '(UTC+9)' },
  { label: 'Sydney', value: 'Australia/Sydney', offsetLabel: '(UTC+11)' },
];

const DEFAULT_SETTINGS: ChartSettings = {
  symbol: {
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderVisible: true,
    wickVisible: true,
    barColorer: true,
    precision: 'Default',
    timezone: '(UTC-8) Los Angeles'
  },
  statusLine: {
    logo: true,
    symbol: true,
    titleMode: 'Description',
    openMarketStatus: true,
    ohlc: true,
    barChangeValues: true,
    volume: true,
    lastDayChange: false,
    indicatorTitles: true,
    indicatorInputs: true,
    indicatorValues: true,
    indicatorBackground: true,
    indicatorBackgroundOpacity: 50
  },
  scales: {
    plusButton: true,
    countdown: true,
    noOverlappingLabels: true,
    lockRatio: false,
    lockRatioValue: '0.0530608',
    placement: 'Auto',
    currencyAndUnit: 'Always visible',
    scaleModes: 'Visible on mouse over',
    symbolLabel: 'Name, value, line',
    prevDayClose: false,
    highLow: false,
    bidAsk: false,
  },
  canvas: {
    backgroundType: 'Solid',
    background: '#1c1c1c',
    backgroundGradientEnd: '#0c0c0d',
    gridVisible: true,
    gridType: 'Vert and horz',
    gridColor: 'rgba(42, 46, 57, 0.4)',
    horzGridColor: 'rgba(42, 46, 57, 0.4)',
    crosshairColor: '#758696',
    crosshairStyle: 1,
    watermarkVisible: false,
    watermarkType: 'Replay mode',
    watermarkColor: 'rgba(42, 46, 57, 0.4)',
    scaleTextColor: '#d1d4dc',
    scaleFontSize: 11,
    scaleLineColor: 'rgba(42, 46, 57, 0.4)',
    navigationButtons: 'Visible on mouse over',
    paneButtons: 'Visible on mouse over',
    marginTop: 10,
    marginBottom: 8,
    marginRight: 10
  },
  trading: {
    buySellButtons: true,
    oneClickTrading: false,
    executionSound: false,
    executionSoundVolume: 50,
    executionSoundType: 'Alarm Clock',
    rejectionNotifications: false,
    positionsAndOrders: true,
    reversePositionButton: true,
    projectOrder: false,
    profitLossValue: true,
    positionsMode: 'Money',
    bracketsMode: 'Money',
    executionMarks: true,
    executionLabels: false,
    extendedPriceLines: true,
    alignment: 'Right',
    screenshotVisibility: false,
  },
  alerts: {
    alertLines: true,
    alertLinesColor: '#26a69a',
    onlyActiveAlerts: true,
    alertVolume: true,
    volumeLevel: 80,
    hideToasts: true,
  },
  events: {
    ideas: false,
    ideasMode: 'All ideas',
    sessionBreaks: false,
    sessionBreaksColor: '#42a5f5',
    economicEvents: true,
    onlyFutureEvents: true,
    eventsBreaks: false,
    eventsBreaksColor: '#363a45',
    latestNews: true,
    newsNotification: false,
  }
};

const App: React.FC = () => {
  // Persistence Loading
  const loadState = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  const [activeSymbol, setActiveSymbol] = useState(() => localStorage.getItem('activeSymbol') || 'BTCUSDT');
  const [timeframe, setTimeframe] = useState(() => localStorage.getItem('timeframe') || 'D');
  const [activeRange, setActiveRange] = useState(() => localStorage.getItem('activeRange') || '1Y');
  const [activeTab, setActiveTab] = useState('Trading Panel');
  const [chartStyle, setChartStyle] = useState<ChartStyle>(() => (localStorage.getItem('chartStyle') as ChartStyle) || 'candles');
  const [activeTool, setActiveTool] = useState<ToolType>('cursor');
  const [stayInDrawingMode, setStayInDrawingMode] = useState(false);
  const [isMagnetEnabled, setIsMagnetEnabled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [areDrawingsVisible, setAreDrawingsVisible] = useState(true);
  const [showMagnetPopup, setShowMagnetPopup] = useState(false);
  const [isIndicatorsOpen, setIsIndicatorsOpen] = useState(false);
  const [isSymbolSearchOpen, setIsSymbolSearchOpen] = useState(false);
  const [isToolSearchOpen, setIsToolSearchOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isGoToDateOpen, setIsGoToDateOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chartSettings, setChartSettings] = useState<ChartSettings>(() => loadState('chartSettings', DEFAULT_SETTINGS));
  const [analysisContent, setAnalysisContent] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(false);
  const [userAlerts, setUserAlerts] = useState<UserAlert[]>([]);
  const [drawings, setDrawings] = useState<Drawing[]>(() => loadState('drawings', []));
  const [selectedTz, setSelectedTz] = useState<TimeZone>(() => loadState('selectedTz', TIME_ZONES.find(tz => tz.label === 'Los Angeles') || TIME_ZONES[0]));
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Indicator Period & Visibility Persistence
  const [showRsi, setShowRsi] = useState(() => localStorage.getItem('showRsi') === 'true');
  const [rsiPeriod, setRsiPeriod] = useState(() => Number(localStorage.getItem('rsiPeriod')) || 14);

  const [showEma10, setShowEma10] = useState(() => localStorage.getItem('showEma10') === 'true');
  const [ema10Period, setEma10Period] = useState(() => Number(localStorage.getItem('ema10Period')) || 10);

  const [showEma20, setShowEma20] = useState(() => localStorage.getItem('showEma20') === 'true');
  const [ema20Period, setEma20Period] = useState(() => Number(localStorage.getItem('ema20Period')) || 20);

  const [showSma1, setShowSma1] = useState(() => localStorage.getItem('showSma1') === 'true');
  const [sma1Period, setSma1Period] = useState(() => Number(localStorage.getItem('sma1Period')) || 21);

  const [showSma2, setShowSma2] = useState(() => localStorage.getItem('showSma2') === 'true');
  const [sma2Period, setSma2Period] = useState(() => Number(localStorage.getItem('sma2Period')) || 10);

  const [showVwap, setShowVwap] = useState(() => localStorage.getItem('showVwap') === 'true');

  const [showBb, setShowBb] = useState(() => localStorage.getItem('showBb') === 'true');
  const [bbPeriod, setBbPeriod] = useState(() => Number(localStorage.getItem('bbPeriod')) || 20);

  const [showAtr, setShowAtr] = useState(() => localStorage.getItem('showAtr') === 'true');
  const [atrPeriod, setAtrPeriod] = useState(() => Number(localStorage.getItem('atrPeriod')) || 14);

  const [showVolume, setShowVolume] = useState(() => {
    const saved = localStorage.getItem('showVolume');
    return saved === null ? true : saved === 'true';
  });

  // Persistence Sync Effects
  useEffect(() => { localStorage.setItem('activeSymbol', activeSymbol); }, [activeSymbol]);
  useEffect(() => { localStorage.setItem('timeframe', timeframe); }, [timeframe]);
  useEffect(() => { localStorage.setItem('activeRange', activeRange); }, [activeRange]);
  useEffect(() => { localStorage.setItem('chartStyle', chartStyle); }, [chartStyle]);
  useEffect(() => { localStorage.setItem('chartSettings', JSON.stringify(chartSettings)); }, [chartSettings]);
  useEffect(() => { localStorage.setItem('drawings', JSON.stringify(drawings)); }, [drawings]);
  useEffect(() => { localStorage.setItem('selectedTz', JSON.stringify(selectedTz)); }, [selectedTz]);

  // Indicator Visibility Persistence Sync
  useEffect(() => { localStorage.setItem('showRsi', showRsi.toString()); }, [showRsi]);
  useEffect(() => { localStorage.setItem('showEma10', showEma10.toString()); }, [showEma10]);
  useEffect(() => { localStorage.setItem('showEma20', showEma20.toString()); }, [showEma20]);
  useEffect(() => { localStorage.setItem('showSma1', showSma1.toString()); }, [showSma1]);
  useEffect(() => { localStorage.setItem('showSma2', showSma2.toString()); }, [showSma2]);
  useEffect(() => { localStorage.setItem('showVwap', showVwap.toString()); }, [showVwap]);
  useEffect(() => { localStorage.setItem('showBb', showBb.toString()); }, [showBb]);
  useEffect(() => { localStorage.setItem('showAtr', showAtr.toString()); }, [showAtr]);
  useEffect(() => { localStorage.setItem('showVolume', showVolume.toString()); }, [showVolume]);

  // Indicator Period Persistence Sync
  useEffect(() => { localStorage.setItem('rsiPeriod', rsiPeriod.toString()); }, [rsiPeriod]);
  useEffect(() => { localStorage.setItem('ema10Period', ema10Period.toString()); }, [ema10Period]);
  useEffect(() => { localStorage.setItem('ema20Period', ema20Period.toString()); }, [ema20Period]);
  useEffect(() => { localStorage.setItem('sma1Period', sma1Period.toString()); }, [sma1Period]);
  useEffect(() => { localStorage.setItem('sma2Period', sma2Period.toString()); }, [sma2Period]);
  useEffect(() => { localStorage.setItem('bbPeriod', bbPeriod.toString()); }, [bbPeriod]);
  useEffect(() => { localStorage.setItem('atrPeriod', atrPeriod.toString()); }, [atrPeriod]);

  const chartRef = useRef<TradingChartHandle>(null);

  const [replayState, setReplayState] = useState<ReplayState>({
    isActive: false,
    isSelecting: false,
    isPlaying: false,
    cutoffTime: null,
    speed: 500,
  });

  const replayManager = useRef<ReplayManager>(new ReplayManager(setReplayState));

  const chartDataConfig = useMemo(() => {
    const tf = timeframe.toLowerCase();
    if (tf.includes('m')) return { count: 300, interval: 'm' as const };
    if (tf.includes('h')) return { count: 200, interval: 'h' as const };
    if (tf.includes('w')) return { count: 260, interval: 'w' as const };
    return { count: 365, interval: 'd' as const };
  }, [timeframe]);

  // fullChartData is populated from MT5 bridge — fall back to deterministic mock while loading
  const [fullChartData, setFullChartData] = useState<ReturnType<typeof generateMockOHLC>>(() =>
    generateMockOHLC(chartDataConfig.count, chartDataConfig.interval, activeSymbol)
  );

  useEffect(() => {
    // update replay data whenever fullChartData changes
    replayManager.current.setData(fullChartData);
  }, [fullChartData]);

  // Fetch historical bars and subscribe to live ticks
  useEffect(() => {
    let mounted = true;
    const cfgCount = chartDataConfig.count;
    let unsub: (() => void) | null = null;

    (async () => {
      try {
        // probe for a broker symbol variant that actually has historical data
        const brokerSymbol = await mt5Service.findWorkingSymbol(activeSymbol, timeframe);
        console.log(`MT5: using broker symbol '${brokerSymbol}' for UI symbol '${activeSymbol}'`);

        const hist = await mt5Service.getHistoricalData(brokerSymbol, timeframe, cfgCount);
        console.log(`MT5: historical bars for ${brokerSymbol} (UI ${activeSymbol}) count=`, (hist && hist.length) ? hist.length : 0);
        if (hist && hist.length > 0) {
          if (!mounted) return;
          setFullChartData(hist.slice(-cfgCount));
        } else {
          console.log('MT5: no historical bars found for any candidate, keeping mock data');
        }

        // subscribe to ticks using the discovered broker symbol
        unsub = mt5Service.subscribeToTicks(brokerSymbol, (tick: any) => {
          setFullChartData(prev => {
            const tickTime = Math.floor((tick.time || Date.now() / 1000));
            const price = tick.bid; // use bid to match MT5 chart price
            const last = prev[prev.length - 1];

            // compute exact interval seconds from timeframe (supports '5m','30m','1h','4h','D','W')
            const tf = (timeframe || '1m').toString();
            let intervalSec = 60;
            const m = tf.match(/^(\d+)([mhdw])$/i);
            if (m) {
              const n = Number(m[1]);
              const unit = m[2].toLowerCase();
              if (unit === 'm') intervalSec = n * 60;
              else if (unit === 'h') intervalSec = n * 3600;
              else if (unit === 'd') intervalSec = n * 86400;
              else if (unit === 'w') intervalSec = n * 604800;
            } else {
              if (/^d$/i.test(tf)) intervalSec = 86400;
              else if (/^w$/i.test(tf)) intervalSec = 604800;
              else intervalSec = 60;
            }

            if (!last) {
              // no historical bars — align to standard bucket
              const barTime = Math.floor(tickTime / intervalSec) * intervalSec;
              const newBar = { time: barTime, open: price, high: price, low: price, close: price } as any;
              return prev.concat(newBar).slice(-chartDataConfig.count);
            }

            const elapsed = tickTime - last.time;
            if (elapsed < intervalSec) {
              // same bar — update
              const updated = { ...last } as any;
              updated.close = price;
              updated.high = Math.max(updated.high, price);
              updated.low = Math.min(updated.low, price);
              const copy = prev.slice();
              copy[copy.length - 1] = updated;
              return copy;
            } else {
              // one or more bars elapsed since last — create the next bar aligned to last
              const index = Math.floor(elapsed / intervalSec);
              const newBarTime = last.time + index * intervalSec;
              const openPrice = last.close;
              const newBar = { time: newBarTime, open: openPrice, high: Math.max(openPrice, price), low: Math.min(openPrice, price), close: price } as any;
              const next = prev.concat(newBar).slice(-chartDataConfig.count);
              return next;
            }
          });
        });
      } catch (e) {
        console.error('MT5 historical fetch failed', e);
      }
    })();

    return () => { mounted = false; if (unsub) unsub(); };
  }, [activeSymbol, timeframe, chartDataConfig.count, chartDataConfig.interval]);

  const fullVolumeData = useMemo(() => generateVolumeData(fullChartData), [fullChartData]);

  const [settingsIndicator, setSettingsIndicator] = useState<{ id: string, value: number } | null>(null);

  const handleRangeChange = useCallback((range: string) => {
    setActiveRange(range);
    if (range === '1D') setTimeframe('5m');
    else if (range === '5D') setTimeframe('15m');
    else if (range === '1M') setTimeframe('1h');
    else if (range === '3M') setTimeframe('4h');
    else if (range === '5Y' || range === 'All') setTimeframe('W');
    else setTimeframe('D');
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    if (tab === activeTab && isBottomPanelVisible) {
      setIsBottomPanelVisible(false);
    } else {
      setActiveTab(tab);
      setIsBottomPanelVisible(true);
    }
  }, [activeTab, isBottomPanelVisible]);

  const handleTriggerAI = useCallback(async (withVisual = false) => {
    setIsAnalyzing(true);
    try {
      let imageData: string | undefined = undefined;
      if (withVisual && chartRef.current) {
        imageData = chartRef.current.takeScreenshot();
      }

      const visibleData = replayState.cutoffTime
        ? fullChartData.filter(d => (d.time as number) <= replayState.cutoffTime!)
        : fullChartData;
      const result = await getMarketAnalysis(visibleData, activeSymbol, imageData);
      setAnalysisContent(result);
    } catch (err) {
      console.error("AI Analysis failed:", err);
      setAnalysisContent("Error generating analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [fullChartData, activeSymbol, replayState.cutoffTime]);

  const handleDownloadChart = useCallback(() => {
    if (chartRef.current) {
      const dataUrl = chartRef.current.takeScreenshot();
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `${activeSymbol}_${timeframe}_chart.png`;
        link.href = dataUrl;
        link.click();
      }
    }
  }, [activeSymbol, timeframe]);

  const handleToolSelect = useCallback((tool: ToolType) => {
    if (tool === 'clear_drawings') {
      if (!isLocked) {
        setDrawings([]);
        setActiveTool('cursor');
      }
    } else if (tool === ('stay_in_mode' as ToolType)) {
      setStayInDrawingMode(prev => !prev);
    } else if (tool === ('magnet' as ToolType)) {
      setIsMagnetEnabled(prev => {
        const next = !prev;
        if (next) {
          setShowMagnetPopup(true);
          setShowSma1(true);
          setShowSma2(true);
        } else {
          setShowSma1(false);
          setShowSma2(false);
        }
        return next;
      });
    } else if (tool === ('lock' as ToolType)) {
      setIsLocked(prev => !prev);
    } else if (tool === ('hide' as ToolType)) {
      setAreDrawingsVisible(prev => !prev);
    } else {
      setActiveTool(tool);
    }
  }, [isLocked]);

  const handleIndicatorSelect = useCallback((id: string, config?: { val1: number, val2: number }) => {
    if (id === 'rsi') setShowRsi(prev => !prev);
    if (id === 'ema') {
      if (config) { setEma10Period(config.val1); setEma20Period(config.val2); setShowEma10(true); setShowEma20(true); }
      else { if (!showEma10) setShowEma10(true); else if (!showEma20) setShowEma20(true); else { setShowEma10(false); setShowEma20(false); } }
    }
    if (id === 'sma') {
      if (config) { setSma1Period(config.val1); setSma2Period(config.val2); setShowSma1(true); setShowSma2(true); }
      else { if (!showSma1) setShowSma1(true); else if (!showSma2) setShowSma2(true); else { setShowSma1(false); setShowSma2(false); } }
    }
    if (id === 'vwap') setShowVwap(prev => !prev);
    if (id === 'bb') setShowBb(prev => !prev);
    if (id === 'vol') setShowVolume(prev => !prev);
    if (id === 'atr') setShowAtr(prev => !prev);
  }, [showEma10, showEma20, showSma1, showSma2]);

  const handleRemoveIndicator = useCallback((id: string) => {
    if (id === 'sma1') setShowSma1(false);
    if (id === 'sma2') setShowSma2(false);
    if (id === 'ema10') setShowEma10(false);
    if (id === 'ema20') setShowEma20(false);
    if (id === 'rsi') setShowRsi(false);
    if (id === 'vwap') setShowVwap(false);
    if (id === 'atr') setShowAtr(false);
    if (id === 'bb') setShowBb(false);
    if (id === 'vol') setShowVolume(false);
  }, []);

  const handleOpenSettings = useCallback((id: string) => {
    let val = 0;
    if (id === 'sma1') val = sma1Period;
    if (id === 'sma2') val = sma2Period;
    if (id === 'ema10') val = ema10Period;
    if (id === 'ema20') val = ema20Period;
    if (id === 'rsi') val = rsiPeriod;
    if (id === 'atr') val = atrPeriod;
    if (id === 'bb') val = bbPeriod;
    setSettingsIndicator({ id, value: val });
  }, [sma1Period, sma2Period, ema10Period, ema20Period, rsiPeriod, atrPeriod, bbPeriod]);

  const handleSaveSettings = useCallback((newValue: number) => {
    if (!settingsIndicator) return;
    const { id } = settingsIndicator;
    if (id === 'sma1') setSma1Period(newValue);
    if (id === 'sma2') setSma2Period(newValue);
    if (id === 'ema10') setEma10Period(newValue);
    if (id === 'ema20') setEma20Period(newValue);
    if (id === 'rsi') setRsiPeriod(newValue);
    if (id === 'atr') setAtrPeriod(newValue);
    if (id === 'bb') setBbPeriod(newValue);
    setSettingsIndicator(null);
  }, [settingsIndicator]);

  const handleCreateAlert = useCallback((alertData: Omit<UserAlert, 'id' | 'active'>) => {
    const newAlert: UserAlert = { ...alertData, id: `alert_${Date.now()}`, active: true };
    setUserAlerts(prev => [...prev, newAlert]);
    setIsAlertModalOpen(false);
  }, []);

  const handleToolDeactivate = useCallback(() => { setActiveTool('cursor'); }, []);

  const handleToggleReplay = useCallback(() => {
    if (replayState.isActive) replayManager.current.deactivate();
    else replayManager.current.activate();
  }, [replayState.isActive]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Sync Global selectedTz with Settings symbol timezone
  const handleSettingsSave = useCallback((newSettings: ChartSettings) => {
    setChartSettings(newSettings);
    const settingsTzString = newSettings.symbol.timezone;
    const matchedTz = TIME_ZONES.find(tz => {
      const combined = `${tz.offsetLabel} ${tz.label}`.trim();
      return combined === settingsTzString || tz.label === settingsTzString;
    });
    if (matchedTz && matchedTz.value !== selectedTz.value) {
      setSelectedTz(matchedTz);
    }
  }, [selectedTz.value]);

  // Sync BottomBar selectedTz with Settings modal state
  const handleTzSelect = useCallback((tz: TimeZone) => {
    setSelectedTz(tz);
    const combined = `${tz.offsetLabel} ${tz.label}`.trim();
    if (chartSettings.symbol.timezone !== combined) {
      setChartSettings(prev => ({
        ...prev,
        symbol: { ...prev.symbol, timezone: combined }
      }));
    }
  }, [chartSettings.symbol.timezone]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const renderBottomPanelContent = () => {
    switch (activeTab) {
      case 'Pine Editor': return <PineEditor />;
      case 'Strategy Tester': return <StrategyTester activeSymbol={activeSymbol} />;
      case 'Trading Panel': return <TradingPanel />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#1e1e1e] text-[#d1d4dc]">
      {!isFullscreen && (
        <Header
          currentTimeframe={timeframe} onTimeframeChange={setTimeframe}
          currentStyle={chartStyle} onStyleChange={setChartStyle}
          onOpenIndicators={() => setIsIndicatorsOpen(true)}
          activeSymbol={activeSymbol}
          onOpenSymbolSearch={() => setIsSymbolSearchOpen(true)}
          onOpenToolSearch={() => setIsToolSearchOpen(true)}
          onOpenSideMenu={() => setIsSideMenuOpen(true)}
          onTriggerAI={() => handleTriggerAI(true)}
          onDownloadChart={handleDownloadChart}
          onOpenAlerts={() => setIsAlertModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleReplay={handleToggleReplay}
          isReplayActive={replayState.isActive}
          isAnalyzing={isAnalyzing}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {!isFullscreen && (
          <Sidebar
            activeTool={activeTool}
            onActivateTool={handleToolSelect}
            stayInDrawingMode={stayInDrawingMode}
            isMagnetEnabled={isMagnetEnabled}
            areDrawingsLocked={isLocked}
            areDrawingsVisible={areDrawingsVisible}
          />
        )}

        <main className={`flex-1 relative flex flex-col bg-[#1c1c1c] overflow-hidden ${isFullscreen ? 'z-[200]' : ''}`}>
          <div className="flex-1 relative min-0 overflow-hidden">
            <TradingChart
              ref={chartRef}
              data={fullChartData} volumeData={fullVolumeData}
              symbol={activeSymbol} timeframe={timeframe} style={chartStyle}
              activeTool={activeTool} drawings={drawings} onDrawingsChange={setDrawings}
              onToolDeactivate={handleToolDeactivate} stayInDrawingMode={stayInDrawingMode}
              onDrawingSelect={() => { }}
              showRsi={showRsi} rsiPeriod={rsiPeriod}
              showEma10={showEma10} ema10Period={ema10Period}
              showEma20={showEma20} ema20Period={ema20Period}
              showSma1={showSma1} sma1Period={sma1Period}
              showSma2={showSma2} sma2Period={sma2Period}
              showVwap={showVwap} showBb={showBb} bbPeriod={bbPeriod} bbMultiplier={2}
              showAtr={showAtr} atrPeriod={atrPeriod} showVolume={showVolume}
              onRemoveIndicator={handleRemoveIndicator} onOpenSettings={handleOpenSettings}
              chartSettings={chartSettings}
              replayCutoffTime={replayState.cutoffTime} isReplaySelecting={replayState.isSelecting}
              onSetReplayCutoff={(t) => replayManager.current.setCutoff(t)}
              isMagnetEnabled={isMagnetEnabled}
              isLocked={isLocked}
              isVisible={areDrawingsVisible}
            />

            {showMagnetPopup && (
              <div className="absolute bottom-6 left-6 z-[350] w-[260px] bg-[#2962ff] text-white p-4 rounded-md shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-[#2962ff]/50 animate-in slide-in-from-bottom-4 duration-300">
                <p className="text-[13px] font-medium leading-relaxed mb-4">
                  Magnet mode is On. Drawing anchors will be snapped to the closest OHLC or indicators values of nearby bars or plots.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowMagnetPopup(false)}
                    className="bg-white text-[#2962ff] px-4 py-1.5 rounded text-[12px] font-bold hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            )}

            {isFullscreen && (
              <>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-[#1c1c1c]/90 border border-[#363a45] rounded-lg px-4 py-2.5 flex items-center space-x-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                    <Info size={14} className="text-gray-300" />
                  </div>
                  <span className="text-[13px] font-medium text-gray-200">Panels hidden. Press <span className="font-bold">ESC</span> to show panels.</span>
                </div>

                <button
                  onClick={() => setIsFullscreen(false)}
                  className="absolute bottom-4 right-4 z-[300] w-10 h-10 bg-[#1c1c1c] hover:bg-[#2a2e39] border border-[#363a45] rounded-md shadow-xl flex items-center justify-center text-gray-400 hover:text-white transition-all group"
                  title="Exit Fullscreen"
                >
                  <Maximize2 size={20} className="group-hover:scale-110 transition-transform" />
                </button>
              </>
            )}
          </div>

          {replayState.isActive && !isFullscreen && (
            <ReplayToolbar
              state={replayState}
              onSelectBar={() => replayManager.current.setSelecting(true)}
              onPlayPause={() => replayManager.current.togglePlayback()}
              onStep={() => replayManager.current.stepForward()}
              onSpeedChange={(ms) => replayManager.current.setSpeed(ms)}
              onClose={() => replayManager.current.deactivate()}
              timeframeLabel={timeframe}
            />
          )}

          {isBottomPanelVisible && !isFullscreen && (
            <div className="relative shrink-0 flex flex-col z-40 h-[300px]">
              <div className="h-0.5 w-full bg-[#434651] cursor-ns-resize hover:bg-[#2962ff] transition-colors"></div>
              {renderBottomPanelContent()}
            </div>
          )}
        </main>

        {!isFullscreen && (
          <RightPanel analysisContent={analysisContent} isAnalyzing={isAnalyzing} onRefreshAnalysis={() => handleTriggerAI(true)} />
        )}
      </div>

      {!isFullscreen && (
        <BottomBar
          activeRange={activeRange} onRangeChange={handleRangeChange}
          activeTab={activeTab} onTabChange={handleTabChange}
          onOpenGoToDate={() => setIsGoToDateOpen(true)}
          selectedTz={selectedTz} onSelectTz={handleTzSelect}
          timeZones={TIME_ZONES}
        />
      )}

      {isIndicatorsOpen && <IndicatorsModal onClose={() => setIsIndicatorsOpen(false)} onSelectIndicator={handleIndicatorSelect} />}
      {isSymbolSearchOpen && <SymbolSearchModal onClose={() => setIsSymbolSearchOpen(false)} onSelect={setActiveSymbol} />}
      {isToolSearchOpen && <ToolSearchModal onClose={() => setIsToolSearchOpen(false)} onSelectTool={(tool) => { handleToolSelect(tool); setIsToolSearchOpen(false); }} />}
      {isSideMenuOpen && <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />}
      {isGoToDateOpen && <GoToDateModal onClose={() => setIsGoToDateOpen(false)} onGoTo={(d) => console.log(d)} />}
      {isAlertModalOpen && <AlertModal symbol={activeSymbol} onClose={() => setIsAlertModalOpen(false)} onCreate={handleCreateAlert} lastPrice={fullChartData[fullChartData.length - 1]?.close || 0} />}
      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} settings={chartSettings} onSave={handleSettingsSave} onClose={() => setIsSettingsOpen(false)} />}
      {settingsIndicator && <IndicatorSettingsModal indicatorId={settingsIndicator.id} currentValue={settingsIndicator.value} onClose={() => setSettingsIndicator(null)} onSave={handleSaveSettings} />}
    </div>
  );
};

export default App;