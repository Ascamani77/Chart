import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  BarChart3, 
  CandlestickChart, 
  AreaChart, 
  Camera,
  LineChart,
  Undo2,
  Redo2,
  Settings,
  Bell,
  RotateCcw,
  Square,
  Zap,
  Hexagon,
  Scan,
  ChevronsLeft,
  BarChart,
  Activity,
  Check,
  Download,
  Sparkles,
  Info,
  LayoutGrid,
  Star,
  ChevronUp
} from 'lucide-react';
import { PairIcons } from '../utils/symbolIcons';
import { ChartStyle } from '../App';

interface HeaderProps {
  currentTimeframe: string;
  onTimeframeChange: (tf: string) => void;
  currentStyle: ChartStyle;
  onStyleChange: (style: ChartStyle) => void;
  onOpenIndicators: () => void;
  activeSymbol?: string;
  onOpenSymbolSearch: () => void;
  onOpenToolSearch: () => void;
  onOpenSideMenu: () => void;
  onTriggerAI: () => void;
  onDownloadChart: () => void;
  onOpenAlerts?: () => void;
  onOpenSettings?: () => void;
  onToggleReplay?: () => void;
  isReplayActive?: boolean;
  isAnalyzing: boolean;
  onToggleFullscreen?: () => void;
}

const STYLE_OPTIONS: { id: ChartStyle; label: string; icon: any; shortcut?: string }[] = [
  { id: 'bars', label: 'Bars', icon: BarChart3, shortcut: 'Alt+B' },
  { id: 'candles', label: 'Candles', icon: CandlestickChart, shortcut: 'Alt+C' },
  { id: 'hollow_candles', label: 'Hollow candles', icon: CandlestickChart, shortcut: 'Alt+H' },
  { id: 'columns', label: 'Columns', icon: BarChart },
  { id: 'line', label: 'Line', icon: LineChart, shortcut: 'Alt+L' },
  { id: 'area', label: 'Area', icon: AreaChart, shortcut: 'Alt+A' },
  { id: 'baseline', label: 'Baseline', icon: Activity },
];

const TF_CATEGORIES = [
  {
    title: 'TICKS',
    items: [
      { label: '1 tick', value: '1t' },
      { label: '10 ticks', value: '10t' },
      { label: '100 ticks', value: '100t' },
      { label: '1000 ticks', value: '1000t' },
    ]
  },
  {
    title: 'SECONDS',
    items: [
      { label: '1 second', value: '1s' },
      { label: '5 seconds', value: '5s' },
      { label: '10 seconds', value: '10s' },
      { label: '15 seconds', value: '15s' },
      { label: '30 seconds', value: '30s' },
      { label: '45 seconds', value: '45s' },
    ]
  },
  {
    title: 'MINUTES',
    items: [
      { label: '1 minute', value: '1m' },
      { label: '2 minutes', value: '2m' },
      { label: '3 minutes', value: '3m' },
      { label: '5 minutes', value: '5m', favorite: true },
      { label: '10 minutes', value: '10m' },
      { label: '12 minutes', value: '12m' },
      { label: '15 minutes', value: '15m', favorite: true },
      { label: '30 minutes', value: '30m', favorite: true },
      { label: '45 minutes', value: '45m' },
    ]
  },
  {
    title: 'HOURS',
    items: [
      { label: '1 hour', value: '1h', favorite: true },
      { label: '2 hours', value: '2h' },
      { label: '3 hours', value: '3h' },
      { label: '4 hours', value: '4h', favorite: true },
      { label: '12 hours', value: '12h' },
    ]
  },
  {
    title: 'DAYS',
    items: [
      { label: '1 day', value: 'D', favorite: true },
      { label: '1 week', value: 'W', favorite: true },
      { label: '1 month', value: '1M' },
      { label: '3 months', value: '3M' },
      { label: '6 months', value: '6M' },
      { label: '12 months', value: '12M' },
    ]
  },
  {
    title: 'RANGES',
    items: [
      { label: '1 range', value: '1r' },
      { label: '10 ranges', value: '10r' },
      { label: '100 ranges', value: '100r', favorite: false },
      { label: '1000 ranges', value: '1000r' },
    ]
  }
];

const Header: React.FC<HeaderProps> = ({ 
  currentTimeframe, 
  onTimeframeChange,
  currentStyle,
  onStyleChange,
  onOpenIndicators,
  activeSymbol = 'AAPL',
  onOpenSymbolSearch,
  onOpenToolSearch,
  onOpenSideMenu,
  onTriggerAI,
  onDownloadChart,
  onOpenAlerts,
  onOpenSettings,
  onToggleReplay,
  isReplayActive = false,
  isAnalyzing,
  onToggleFullscreen
}) => {
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [isTfDropdownOpen, setIsTfDropdownOpen] = useState(false);
  const [isCameraDropdownOpen, setIsCameraDropdownOpen] = useState(false);
  const [isLayoutDropdownOpen, setIsLayoutDropdownOpen] = useState(false);
  
  const styleDropdownRef = useRef<HTMLDivElement>(null);
  const tfDropdownRef = useRef<HTMLDivElement>(null);
  const cameraDropdownRef = useRef<HTMLDivElement>(null);
  const layoutDropdownRef = useRef<HTMLDivElement>(null);

  const mainTimeframes = ['5m', '15m', '30m', '1h', '4h', 'D', 'W'];

  // Dynamically compute which timeframes to show in the header
  const visibleTimeframes = mainTimeframes.includes(currentTimeframe) 
    ? mainTimeframes 
    : [...mainTimeframes, currentTimeframe];

  const getActiveStyleIcon = () => {
    const opt = STYLE_OPTIONS.find(o => o.id === currentStyle);
    const Icon = opt?.icon || CandlestickChart;
    return <Icon size={20} className={currentStyle === 'hollow_candles' ? 'opacity-50' : ''} />;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(target)) {
        setIsStyleDropdownOpen(false);
      }
      if (tfDropdownRef.current && !tfDropdownRef.current.contains(target)) {
        setIsTfDropdownOpen(false);
      }
      if (cameraDropdownRef.current && !cameraDropdownRef.current.contains(target)) {
        setIsCameraDropdownOpen(false);
      }
      if (layoutDropdownRef.current && !layoutDropdownRef.current.contains(target)) {
        setIsLayoutDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const LayoutOption = ({ children, active, className = "" }: { children?: React.ReactNode, active?: boolean, className?: string }) => (
    <div className={`p-1 rounded-sm cursor-pointer transition-all ${active ? 'bg-[#2962ff]/20' : 'hover:bg-white/10'}`}>
      <div className={`w-[24px] h-[18px] border border-[#50535e] rounded-[1px] flex overflow-hidden relative ${active ? 'border-white' : ''} ${className}`}>
        {children}
      </div>
    </div>
  );

  const Toggle = ({ active }: { active: boolean }) => (
    <div className={`w-8 h-4.5 rounded-full relative transition-colors cursor-pointer ${active ? 'bg-[#2962ff]' : 'bg-[#434651]'}`}>
      <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm ${active ? 'right-0.5' : 'left-0.5'}`}></div>
    </div>
  );

  const SyncRow = ({ label, active = false }: { label: string, active?: boolean }) => (
    <div className="flex items-center justify-between py-2 px-4 group cursor-pointer hover:bg-white/5 transition-colors">
      <div className="flex items-center space-x-1.5">
        <span className="text-[13px] text-[#d1d4dc] font-medium">{label}</span>
        <Info size={13} className="text-[#787b86] cursor-help opacity-60 group-hover:opacity-100" />
      </div>
      <Toggle active={active} />
    </div>
  );

  return (
    <div className="h-12 border-b-[4px] border-[#333333] bg-[#0c0c0d] flex items-center px-1 select-none shrink-0 z-[1000] relative shadow-md">
      <div className="flex items-center w-full h-full">
        
        {/* User Icon */}
        <div className="flex items-center shrink-0 pr-1">
          <button onClick={onOpenSideMenu} className="w-8 h-8 flex items-center justify-center bg-[#c62828] rounded-full text-white font-bold text-xs ml-1 hover:opacity-90 transition-opacity shadow-lg">
            N
          </button>
        </div>

        <div className="h-6 w-px bg-[#2a2e39] mx-1 shrink-0"></div>

        {/* Symbol Search */}
        <div className="flex items-center shrink-0 space-x-1">
          <div 
            onClick={onOpenSymbolSearch} 
            className="flex items-center h-8 px-2 bg-[#1c1c1c] hover:bg-white/5 rounded cursor-pointer transition-colors border border-[#333333] group"
          >
            <Search size={14} className="text-gray-300 mr-2 group-hover:text-white" />
            <PairIcons symbol={activeSymbol} size={16} />
            <span className="text-[13px] font-bold text-white ml-2 mr-1 truncate max-w-[100px]">{activeSymbol}</span>
            <ChevronDown size={12} className="text-gray-400" />
          </div>
        </div>

        <div className="h-6 w-px bg-[#2a2e39] mx-1 shrink-0"></div>

        {/* Timeframes */}
        <div className="flex items-center shrink-0 space-x-0.5 h-full relative" ref={tfDropdownRef}>
          {visibleTimeframes.map(tf => (
            <button 
              key={tf} 
              onClick={() => onTimeframeChange(tf)} 
              className={`text-[13px] px-2 py-1 rounded transition-colors whitespace-nowrap ${currentTimeframe === tf ? 'bg-white/10 text-white font-bold border border-white/5 shadow-sm' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
            >
              {tf}
            </button>
          ))}
          <button 
            onClick={() => setIsTfDropdownOpen(!isTfDropdownOpen)}
            className={`p-1 hover:text-white transition-colors h-8 flex items-center ${isTfDropdownOpen ? 'text-white bg-white/5 rounded' : 'text-gray-400'}`}
          >
            <ChevronDown size={14} className={`transform transition-transform ${isTfDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isTfDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-[#1c1c1c] border border-[#363a45] rounded-md shadow-[0_12px_48px_rgba(0,0,0,0.8)] py-1 min-w-[240px] z-[2000] animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
              <div className="max-h-[85vh] overflow-y-auto scrollbar-hide">
                {TF_CATEGORIES.map((cat, idx) => (
                  <div key={cat.title} className={idx !== 0 ? 'border-t border-[#363a45]/30' : ''}>
                    <div className="px-4 py-2 flex items-center justify-between group cursor-default">
                      <span className="text-[10px] font-bold text-[#787b86] uppercase tracking-widest">{cat.title}</span>
                      <ChevronUp size={12} className="text-[#787b86] group-hover:text-white transition-colors" />
                    </div>
                    {cat.items.map(item => (
                      <div 
                        key={item.value}
                        onClick={() => { onTimeframeChange(item.value); setIsTfDropdownOpen(false); }}
                        className={`flex items-center justify-between px-4 py-[7px] hover:bg-[#2a2e39] cursor-pointer group transition-colors ${currentTimeframe === item.value ? 'bg-[#2a2e39]' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`text-[13px] font-medium transition-colors ${currentTimeframe === item.value ? 'text-white font-bold' : 'text-[#d1d4dc] group-hover:text-white'}`}>
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Star 
                            size={14} 
                            className={`transition-all ${item.favorite || mainTimeframes.includes(item.value) ? 'text-orange-500 fill-orange-500 opacity-100' : 'text-[#787b86] opacity-0 group-hover:opacity-100 hover:text-orange-500'}`} 
                          />
                          {currentTimeframe === item.value && <Check size={14} className="text-[#2962ff]" strokeWidth={3} />}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[#2a2e39] mx-1 shrink-0"></div>

        {/* Chart Style Dropdown */}
        <div className="flex items-center shrink-0 relative" ref={styleDropdownRef}>
          <div 
            className={`flex items-center hover:bg-white/5 rounded transition-colors cursor-pointer h-8 px-1 ${isStyleDropdownOpen ? 'bg-white/5 text-white' : ''}`}
            onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
          >
            <div className={`p-1 ${isStyleDropdownOpen ? 'text-white' : 'text-gray-300'}`}>
              {getActiveStyleIcon()}
            </div>
            <ChevronDown size={12} className={`text-gray-400 ml-1 transform transition-transform ${isStyleDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {isStyleDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-[#1c1c1c] border border-[#363a45] rounded-md shadow-2xl py-1.5 min-w-[200px] z-[2000] animate-in fade-in slide-in-from-top-1 duration-150">
              {STYLE_OPTIONS.map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => { onStyleChange(opt.id); setIsStyleDropdownOpen(false); }}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors hover:bg-[#2962ff] group ${currentStyle === opt.id ? 'bg-[#2962ff]' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${currentStyle === opt.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                      <opt.icon size={18} className={opt.id === 'hollow_candles' ? 'opacity-50' : ''} />
                    </div>
                    <span className={`text-[13px] ${currentStyle === opt.id ? 'text-white font-bold' : 'text-gray-300 group-hover:text-white'}`}>
                      {opt.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {opt.shortcut && <span className={`text-[10px] font-medium ${currentStyle === opt.id ? 'text-white/70' : 'text-gray-500 group-hover:text-white/70'}`}>{opt.shortcut}</span>}
                    {currentStyle === opt.id && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button onClick={onOpenIndicators} className="flex items-center space-x-1 px-2 py-1 hover:bg-white/5 rounded text-white ml-1 transition-colors group">
            <LineChart size={22} className="text-gray-300 group-hover:text-white" />
            <span className="text-[13px] font-medium hidden md:inline group-hover:text-white">Indicators</span>
          </button>
        </div>

        <div className="h-6 w-px bg-[#2a2e39] mx-1 shrink-0"></div>

        {/* Replay Section */}
        <div className="flex items-center shrink-0 px-1">
          <button 
            onClick={onToggleReplay}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded transition-colors group ${
              isReplayActive 
                ? 'bg-[#2962ff] text-white font-bold' 
                : 'hover:bg-white/5 text-gray-300'
            }`}
          >
            <ChevronsLeft size={16} strokeWidth={2.5} className={`${isReplayActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
            <span className={`text-[13px] font-bold ${isReplayActive ? 'text-white' : 'group-hover:text-white'}`}>Replay</span>
          </button>
        </div>

        <div className="h-6 w-px bg-[#2a2e39] mx-1 shrink-0"></div>

        {/* Undo / Redo */}
        <div className="flex items-center shrink-0 space-x-0.5 px-1">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors">
            <Undo2 size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors">
            <Redo2 size={18} />
          </button>
        </div>

        <div className="flex-1 min-w-[10px]"></div>

        {/* Right Section Icons */}
        <div className="flex items-center shrink-0 space-x-0.5 pr-2">
          
          {/* Unnamed / Layout Dropdown */}
          <div className="relative" ref={layoutDropdownRef}>
            <div 
              onClick={() => setIsLayoutDropdownOpen(!isLayoutDropdownOpen)}
              className={`flex items-center px-2 py-1 hover:bg-white/5 rounded cursor-pointer group transition-colors mr-1 ${isLayoutDropdownOpen ? 'bg-white/5' : ''}`}
            >
              <Square size={16} className={`text-gray-400 mr-2 group-hover:text-white ${isLayoutDropdownOpen ? 'text-white' : ''}`} />
              <span className={`text-[13px] font-medium text-gray-200 group-hover:text-white mr-1 ${isLayoutDropdownOpen ? 'text-white' : ''}`}>Unnamed</span>
              <ChevronDown size={14} className={`text-gray-500 transition-transform ${isLayoutDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isLayoutDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-[#1c1c1c] border border-[#363a45] rounded-md shadow-2xl py-0 min-w-[340px] z-[2000] animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
                <div className="max-h-[70vh] overflow-y-auto scrollbar-hide py-2 bg-[#1c1c1c]">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16].map((num) => (
                    <div key={num} className="flex items-start border-b border-[#2a2e39] last:border-0 px-4 py-2.5 hover:bg-white/2 transition-colors">
                      <span className="w-6 text-[12px] font-bold text-[#787b86] pt-1">{num}</span>
                      <div className="flex flex-wrap gap-2.5 ml-1">
                        {num === 1 && (
                          <LayoutOption active>
                            <div className="flex-1 bg-white/30"></div>
                          </LayoutOption>
                        )}
                        {num === 2 && (
                          <>
                            <LayoutOption>
                              <div className="w-1/2 h-full border-r border-[#50535e]"></div>
                            </LayoutOption>
                            <LayoutOption>
                              <div className="w-full h-1/2 border-b border-[#50535e]"></div>
                            </LayoutOption>
                          </>
                        )}
                        {num === 3 && (
                          <>
                            <LayoutOption><div className="w-1/3 border-r border-[#50535e]"></div><div className="w-1/3 border-r border-[#50535e]"></div></LayoutOption>
                            <LayoutOption><div className="w-full h-1/3 border-b border-[#50535e]"></div><div className="w-full h-1/3 border-b border-[#50535e]"></div></LayoutOption>
                            <LayoutOption><div className="w-1/2 border-r border-[#50535e]"></div><div className="flex-1 flex flex-col"><div className="flex-1 border-b border-[#50535e]"></div></div></LayoutOption>
                            <LayoutOption><div className="flex-1 flex flex-col"><div className="flex-1 border-b border-[#50535e]"></div></div><div className="w-1/2 border-l border-[#50535e]"></div></LayoutOption>
                            <LayoutOption className="flex-col"><div className="h-1/2 border-b border-[#50535e]"></div><div className="flex-1 flex"><div className="flex-1 border-r border-[#50535e]"></div></div></LayoutOption>
                            <LayoutOption className="flex-col"><div className="flex-1 flex"><div className="flex-1 border-r border-[#50535e]"></div></div><div className="h-1/2 border-t border-[#50535e]"></div></LayoutOption>
                          </>
                        )}
                        {num === 4 && (
                          <>
                             <LayoutOption><div className="w-1/2 border-r border-[#50535e] flex flex-col"><div className="flex-1 border-b border-[#50535e]"></div></div><div className="w-1/2 flex flex-col"><div className="flex-1 border-b border-[#50535e]"></div></div></LayoutOption>
                             <LayoutOption className="flex-col"><div className="flex-1 border-b border-[#50535e]"></div><div className="flex-1 border-b border-[#50535e]"></div><div className="flex-1"></div></LayoutOption>
                             <LayoutOption><div className="w-1/4 border-r border-[#50535e]"></div><div className="w-1/4 border-r border-[#50535e]"></div><div className="w-1/4 border-r border-[#50535e]"></div></LayoutOption>
                             <LayoutOption><div className="w-1/2 border-r border-[#50535e]"></div><div className="flex-1 flex flex-col"><div className="flex-1 border-b border-[#50535e]"></div><div className="flex-1 border-b border-[#50535e]"></div><div className="flex-1"></div></div></LayoutOption>
                             <LayoutOption><div className="flex-1 flex flex-col"><div className="flex-1 border-b border-[#50535e]"></div><div className="flex-1 border-b border-[#50535e]"></div><div className="flex-1"></div></div><div className="w-1/2 border-l border-[#50535e]"></div></LayoutOption>
                             <LayoutOption className="flex-col"><div className="h-1/2 border-b border-[#50535e]"></div><div className="flex-1 flex"><div className="flex-1 border-r border-[#50535e]"></div><div className="flex-1 border-r border-[#50535e]"></div></div></LayoutOption>
                             <LayoutOption className="flex-col"><div className="flex-1 flex"><div className="flex-1 border-r border-[#50535e]"></div><div className="flex-1 border-r border-[#50535e]"></div></div><div className="h-1/2 border-t border-[#50535e]"></div></LayoutOption>
                             <LayoutOption><div className="w-1/3 border-r border-[#50535e]"></div><div className="w-1/3 border-r border-[#50535e]"></div><div className="flex-1"></div></LayoutOption>
                             <LayoutOption><div className="w-1/2 border-r border-[#50535e] flex flex-col"><div className="flex-1 border-b border-[#50535e]"></div><div className="flex-1"></div></div><div className="flex-1"></div></LayoutOption>
                             <LayoutOption><div className="flex-1"></div><div className="w-1/2 border-l border-[#50535e] flex flex-col"><div className="flex-1 border-b border-[#50535e]"></div><div className="flex-1"></div></div></LayoutOption>
                          </>
                        )}
                        {num > 4 && (
                          <LayoutOption>
                            <div className="w-full h-full flex flex-wrap">
                               {Array.from({ length: num }).map((_, i) => (
                                 <div key={i} className="border-r border-b border-[#50535e]" style={{ width: `${100 / Math.ceil(Math.sqrt(num))}%`, height: `${100 / Math.ceil(num / Math.ceil(Math.sqrt(num)))}%` }}></div>
                               ))}
                            </div>
                          </LayoutOption>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#1c1c1c] py-3 border-t border-[#2a2e39]">
                   <div className="px-4 mb-2">
                      <span className="text-[11px] font-bold text-[#787b86] uppercase tracking-wider">SYNC IN LAYOUT</span>
                   </div>
                   <SyncRow label="Symbol" active />
                   <SyncRow label="Interval" />
                   <SyncRow label="Crosshair" active />
                   <SyncRow label="Time" />
                   <SyncRow label="Date range" />
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-[#2a2e39] mx-1 shrink-0"></div>

          <button 
            onClick={onOpenToolSearch}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded relative transition-colors group"
          >
            <Search size={20} />
            <Zap size={10} className="absolute top-1 right-1 text-gray-400 fill-gray-400 group-hover:text-white group-hover:fill-white" />
          </button>
          
          <button onClick={onOpenSettings} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors">
            <Hexagon size={20} />
          </button>
          
          <button 
            onClick={onToggleFullscreen}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors hidden sm:block"
          >
            <Scan size={18} />
          </button>
          
          <div className="relative" ref={cameraDropdownRef}>
            <button 
              onClick={() => setIsCameraDropdownOpen(!isCameraDropdownOpen)}
              className={`p-2 hover:text-white hover:bg-white/5 rounded transition-colors hidden sm:block ${isCameraDropdownOpen ? 'text-white bg-white/5' : 'text-gray-400'}`}
            >
              <Camera size={20} />
            </button>

            {isCameraDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-[#1c1c1c] border border-[#363a45] rounded-md shadow-2xl py-1.5 min-w-[240px] z-[2000] animate-in fade-in slide-in-from-top-1 duration-150">
                <div 
                  className="flex items-center space-x-3 px-3 py-2 cursor-pointer transition-colors hover:bg-[#2962ff] group text-gray-300 hover:text-white"
                  onClick={() => {
                    onDownloadChart();
                    setIsCameraDropdownOpen(false);
                  }}
                >
                  <Download size={18} className="text-gray-400 group-hover:text-white" />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium">Download chart image</span>
                    <span className="text-[10px] opacity-60">Alt+S</span>
                  </div>
                </div>
                <div 
                  className="flex items-center space-x-3 px-3 py-2 cursor-pointer transition-colors hover:bg-[#2962ff] group text-gray-300 hover:text-white"
                  onClick={() => {
                    onTriggerAI();
                    setIsCameraDropdownOpen(false);
                  }}
                >
                  <Sparkles size={18} className={`${isAnalyzing ? 'animate-pulse' : ''} text-blue-400 group-hover:text-white`} />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium">Send image to AI analyst</span>
                    <span className="text-[10px] opacity-60">Powered by Gemini</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center ml-2">
            <button className="px-5 py-1.5 bg-[#131722] text-white text-[13px] font-bold rounded-full border border-[#363a45] hover:bg-[#1e222d] transition-all shadow-lg active:scale-95">
              Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;