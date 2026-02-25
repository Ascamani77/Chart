
import { Time } from 'lightweight-charts';

export interface OHLCData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface VolumeData {
  time: Time;
  value: number;
  color?: string;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | 'D' | 'W';

export interface Drawing {
  id: string;
  type: 'trendline' | 'horizontal_line' | 'vertical_line' | 'ray' | 'brush' | 'text' | 'icons' | 'long_position' | 'short_position' | 'fib' | 'measure' | 'rectangle' | 'fib_fan' | 'projection' | 'anchored_vwap';
  points: { time: Time; price: number }[];
  color: string;
  width: number;
  widthLeft?: number;
  widthRight?: number;
  text?: string;
}

export interface SymbolInfo {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChartSettings {
  symbol: {
    upColor: string;
    downColor: string;
    borderVisible: boolean;
    wickVisible: boolean;
    barColorer: boolean;
    precision: string;
    timezone: string;
  };
  statusLine: {
    logo: boolean;
    symbol: boolean;
    titleMode: string;
    openMarketStatus: boolean;
    ohlc: boolean;
    barChangeValues: boolean;
    volume: boolean;
    lastDayChange: boolean;
    indicatorTitles: boolean;
    indicatorInputs: boolean;
    indicatorValues: boolean;
    indicatorBackground: boolean;
    indicatorBackgroundOpacity: number;
  };
  scales: {
    plusButton: boolean;
    countdown: boolean;
    noOverlappingLabels: boolean;
    lockRatio: boolean;
    lockRatioValue: string;
    placement: 'Auto' | 'Left' | 'Right';
    currencyAndUnit: 'Always visible' | 'Hidden' | 'Visible on mouse over';
    scaleModes: 'Always visible' | 'Hidden' | 'Visible on mouse over';
    symbolLabel: 'Name, value, line' | 'Ticker' | 'None';
    prevDayClose: boolean;
    highLow: boolean;
    bidAsk: boolean;
  };
  canvas: {
    backgroundType: 'Gradient' | 'Solid';
    background: string;
    backgroundGradientEnd: string;
    gridVisible: boolean;
    gridType: string;
    gridColor: string;
    horzGridColor: string;
    crosshairColor: string;
    crosshairStyle: number;
    watermarkVisible: boolean;
    watermarkType: string;
    watermarkColor: string;
    scaleTextColor: string;
    scaleFontSize: number;
    scaleLineColor: string;
    navigationButtons: string;
    paneButtons: string;
    marginTop: number;
    marginBottom: number;
    marginRight: number;
  };
  trading: {
    buySellButtons: boolean;
    oneClickTrading: boolean;
    executionSound: boolean;
    executionSoundVolume: number;
    executionSoundType: string;
    rejectionNotifications: boolean;
    positionsAndOrders: boolean;
    reversePositionButton: boolean;
    projectOrder: boolean;
    profitLossValue: boolean;
    positionsMode: string;
    bracketsMode: string;
    executionMarks: boolean;
    executionLabels: boolean;
    extendedPriceLines: boolean;
    alignment: 'Left' | 'Center' | 'Right';
    screenshotVisibility: boolean;
  };
  alerts: {
    alertLines: boolean;
    alertLinesColor: string;
    onlyActiveAlerts: boolean;
    alertVolume: boolean;
    volumeLevel: number;
    hideToasts: boolean;
  };
  events: {
    ideas: boolean;
    ideasMode: string;
    sessionBreaks: boolean;
    sessionBreaksColor: string;
    economicEvents: boolean;
    onlyFutureEvents: boolean;
    eventsBreaks: boolean;
    eventsBreaksColor: string;
    latestNews: boolean;
    newsNotification: boolean;
  };
}
