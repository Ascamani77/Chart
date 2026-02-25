
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  CandlestickChart,
  Type,
  MoveDiagonal,
  Monitor,
  LayoutGrid,
  Bell,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ChartSettings } from '../types';
import SymbolTab from './settings/SymbolTab';
import StatusLineTab from './settings/StatusLineTab';
import ScalesTab from './settings/ScalesTab';
import CanvasTab from './settings/CanvasTab';
import TradingTab from './settings/TradingTab';
import AlertsTab from './settings/AlertsTab';
import EventsTab from './settings/EventsTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChartSettings;
  onSave: (newSettings: ChartSettings) => void;
  initialTab?: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, initialTab = 'Symbol' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [localSettings, setLocalSettings] = useState<ChartSettings>({ ...settings });
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const templateMenuRef = useRef<HTMLDivElement>(null);
  const templateTriggerRef = useRef<HTMLButtonElement>(null);

  // Sync with prop if it changes externally
  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (templateTriggerRef.current?.contains(target)) return;
      if (templateMenuRef.current && !templateMenuRef.current.contains(target)) {
        setIsTemplateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApplyDefaults = useCallback(() => {
    const defaults: ChartSettings = {
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
        showLastPrice: true,
        showAskPrice: false,
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
    setLocalSettings(defaults);
    setIsTemplateMenuOpen(false);
  }, []);

  if (!isOpen) return null;

  const tabs = [
    { id: 'Symbol', icon: CandlestickChart, label: 'Symbol' },
    { id: 'Status line', icon: Type, label: 'Status line' },
    { id: 'Scales and lines', icon: MoveDiagonal, label: 'Scales and lines' },
    { id: 'Canvas', icon: Monitor, label: 'Canvas' },
    { id: 'Trading', icon: LayoutGrid, label: 'Trading' },
    { id: 'Alerts', icon: Bell, label: 'Alerts' },
    { id: 'Events', icon: Calendar, label: 'Events' },
  ];

  const handleToggle = (category: keyof ChartSettings, key: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: {
        //@ts-ignore
        ...prev[category],
        //@ts-ignore
        [key]: !prev[category][key]
      }
    }));
  };

  const handleChange = (category: keyof ChartSettings, key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: {
        //@ts-ignore
        ...prev[category],
        [key]: value
      }
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Symbol':
        return <SymbolTab settings={localSettings.symbol} onToggle={(key) => handleToggle('symbol', key)} onChange={(key, val) => handleChange('symbol', key, val)} />;
      case 'Status line':
        return <StatusLineTab settings={localSettings.statusLine} onToggle={(key) => handleToggle('statusLine', key)} onChange={(key, val) => handleChange('statusLine', key, val)} />;
      case 'Scales and lines':
        return <ScalesTab settings={localSettings.scales} onToggle={(key) => handleToggle('scales', key)} onChange={(key, val) => handleChange('scales', key, val)} />;
      case 'Canvas':
        return <CanvasTab settings={localSettings.canvas} onToggle={(key) => handleToggle('canvas', key)} onChange={(key, val) => handleChange('canvas', key, val)} />;
      case 'Trading':
        return <TradingTab settings={localSettings.trading} onToggle={(key) => handleToggle('trading', key)} onChange={(key, val) => handleChange('trading', key, val)} />;
      case 'Alerts':
        return <AlertsTab settings={localSettings.alerts} onToggle={(key) => handleToggle('alerts', key)} onChange={(key, val) => handleChange('alerts', key, val)} />;
      case 'Events':
        return <EventsTab settings={localSettings.events} onToggle={(key) => handleToggle('events', key)} onChange={(key, val) => handleChange('events', key, val)} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1c1c1c] w-full max-w-[475px] h-[490px] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-[#363a45] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-[#363a45]">
          <h2 className="text-[15px] font-bold text-gray-100 tracking-tight">Settings</h2>
          <button onClick={onClose} className="text-[#787b86] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-[155px] bg-[#0c0c0d] border-r border-[#363a45] py-2 shrink-0 overflow-y-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 space-x-3 transition-colors ${activeTab === tab.id
                    ? 'bg-[#2d2d2d] text-white font-bold border-r-[2.5px] border-white'
                    : 'text-[#787b86] hover:bg-[#2d2d2d] hover:text-gray-200'
                  }`}
              >
                <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                <span className="text-[11px] whitespace-nowrap truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-black p-5 scrollbar-hide">
            {renderContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#363a45] flex items-center justify-between bg-[#131722] shrink-0">
          <div className="relative">
            <button
              ref={templateTriggerRef}
              onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
              className={`flex items-center space-x-2 px-3 py-1.5 border border-[#363a45] rounded text-[11px] text-gray-200 hover:bg-white/5 transition-colors focus:ring-1 focus:ring-[#2962ff] ${isTemplateMenuOpen ? 'border-[#2962ff]' : ''}`}
            >
              <span>Template</span>
              {isTemplateMenuOpen ? <ChevronUp size={12} className="text-gray-500" /> : <ChevronDown size={12} className="text-gray-500" />}
            </button>

            {isTemplateMenuOpen && (
              <div
                ref={templateMenuRef}
                className="absolute bottom-full mb-1 left-0 bg-[#1e222d] border border-[#363a45] rounded-md shadow-2xl py-1 min-w-[150px] animate-in slide-in-from-bottom-2 duration-150 z-[700]"
              >
                <button
                  onClick={handleApplyDefaults}
                  className="w-full px-4 py-2 text-left text-[11px] text-gray-200 hover:bg-[#2a2e39] transition-colors"
                >
                  Apply defaults
                </button>
                <button className="w-full px-4 py-2 text-left text-[11px] text-gray-200 hover:bg-[#2a2e39] transition-colors">Save as...</button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-1 text-[11px] font-bold text-gray-300 bg-transparent border border-[#434651] rounded hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { onSave(localSettings); onClose(); }}
              className="px-5 py-1 text-[11px] font-bold text-black bg-white rounded hover:bg-gray-200 transition-colors shadow-lg"
            >
              Ok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
