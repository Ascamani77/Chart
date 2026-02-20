import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Maximize2, MoveVertical, ChevronUp, Radio, Check } from 'lucide-react';
import { TimeZone } from '../App';

interface BottomBarProps {
  activeRange: string;
  onRangeChange: (range: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenGoToDate: () => void;
  selectedTz: TimeZone;
  onSelectTz: (tz: TimeZone) => void;
  timeZones: TimeZone[];
}

const BottomBar: React.FC<BottomBarProps> = ({ 
  activeRange, 
  onRangeChange,
  activeTab,
  onTabChange,
  onOpenGoToDate,
  selectedTz,
  onSelectTz,
  timeZones
}) => {
  const [time, setTime] = useState(new Date());
  const [isTzOpen, setIsTzOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tzMenuRef = useRef<HTMLDivElement>(null);
  const tzTriggerRef = useRef<HTMLButtonElement>(null);

  // Drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  const timeRanges = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'];
  const tabs = ['Pine Editor', 'Strategy Tester', 'Trading Panel'];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Timezone Dropup Click Outside Logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (tzTriggerRef.current?.contains(target)) return;
      if (isTzOpen && tzMenuRef.current && !tzMenuRef.current.contains(target)) {
        setIsTzOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTzOpen]);

  // Robust Drag-to-Scroll Window Listeners
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!scrollContainerRef.current) return;
      const x = e.clientX;
      const walk = x - startX;
      setDragDistance(Math.abs(walk));
      scrollContainerRef.current.scrollLeft = scrollLeftPos - walk;
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, startX, scrollLeftPos]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setDragDistance(0);
    setScrollLeftPos(scrollContainerRef.current.scrollLeft);
  };

  const handleAction = (callback: () => void) => {
    // Only execute if it wasn't a significant drag (threshold: 10px)
    if (dragDistance < 10) {
      callback();
    }
  };

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: selectedTz.value
  });

  const isMarketOpen = (() => {
    try {
      const tzDate = new Date(time.toLocaleString('en-US', { timeZone: selectedTz.value }));
      const day = tzDate.getDay(); 
      const hour = tzDate.getHours();
      return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
    } catch (e) {
      return false;
    }
  })();

  return (
    <div className="h-10 border-t-[4px] border-[#333333] bg-[#1e1e1e] flex items-center select-none shrink-0 relative overflow-visible z-[100]">
      
      {/* Scrollable Section (Ranges + Tabs) */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={onMouseDown}
        style={{ touchAction: 'pan-x' }}
        className={`flex-1 min-w-0 h-full flex items-center overflow-x-auto scrollbar-hide px-2 transition-colors ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {/* Time Ranges */}
        <div className="flex items-center space-x-1 pr-3 border-r border-[#434651] mr-3 shrink-0 h-full">
          {timeRanges.map(range => (
            <button 
              key={range} 
              onClick={() => handleAction(() => onRangeChange(range))}
              className={`text-[11px] px-2 py-1 rounded transition-all shrink-0 ${activeRange === range ? 'text-white bg-white/10 font-bold border border-white/5 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {range}
            </button>
          ))}
          <div className="h-4 w-px bg-[#434651] mx-1 shrink-0"></div>
          <button 
            onClick={() => handleAction(onOpenGoToDate)}
            className="p-1 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded shrink-0" 
            title="Go to date..."
          >
            <Calendar size={14} />
          </button>
        </div>

        {/* Feature Tabs */}
        <div className="flex items-center space-x-1 h-full shrink-0">
          {tabs.map((tab) => (
            <button 
              key={tab} 
              onClick={() => handleAction(() => onTabChange(tab))}
              className={`px-3 py-1.5 text-[11px] whitespace-nowrap rounded transition-all shrink-0 ${activeTab === tab ? 'text-white font-bold bg-white/10 border border-white/10 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Fixed Right Section (Timezone + Market Status + Icons) */}
      <div className="flex items-center h-full bg-[#1e1e1e] border-l border-[#434651] z-[110] relative overflow-visible shrink-0">
        
        {/* Market Status */}
        <div className="flex items-center space-x-1.5 px-3 shrink-0 border-r border-[#434651] h-full">
          <Radio size={12} className={isMarketOpen ? 'text-[#00e676]' : 'text-[#787b86]'} />
          <span className={`text-[10px] font-bold whitespace-nowrap uppercase tracking-tight ${isMarketOpen ? 'text-[#00e676]' : 'text-[#787b86]'}`}>
            {isMarketOpen ? 'Open' : 'Closed'}
          </span>
        </div>

        {/* Timezone Trigger */}
        <div className="relative h-full flex items-center">
          <button 
            ref={tzTriggerRef}
            onClick={() => setIsTzOpen(!isTzOpen)}
            className={`flex items-center space-x-2 px-3 h-full hover:bg-white/5 transition-colors cursor-pointer group ${isTzOpen ? 'bg-white/10 text-white' : 'text-gray-300'}`}
          >
            <span className="font-mono text-[11px] tabular-nums whitespace-nowrap pointer-events-none">
              {formattedTime} <span className="text-gray-500 font-normal">{selectedTz.offsetLabel || selectedTz.label}</span>
            </span>
            <ChevronUp size={12} className={`transition-transform duration-200 pointer-events-none ${isTzOpen ? 'rotate-180' : 'rotate-0'}`} />
          </button>

          {/* Timezone Dropup Menu */}
          {isTzOpen && (
            <div 
              ref={tzMenuRef}
              className="absolute bottom-full mb-1 right-0 bg-[#1c1c1c] border border-[#363a45] rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-1 min-w-[220px] z-[500] animate-in slide-in-from-bottom-2 duration-150"
            >
              <div className="px-4 py-2 border-b border-[#2a2e39] mb-1">
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Timezone</span>
              </div>
              <div className="max-h-64 overflow-y-auto scrollbar-hide">
                {timeZones.map((tz) => (
                  <button
                    key={tz.value}
                    onClick={() => {
                      onSelectTz(tz);
                      setIsTzOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-2.5 text-[12px] hover:bg-white/5 transition-colors group ${selectedTz.value === tz.value ? 'text-white font-bold' : 'text-gray-300'}`}
                  >
                    <div className="w-5 flex items-center shrink-0">
                      {selectedTz.value === tz.value && <Check size={14} className="text-[#2962ff]" />}
                    </div>
                    <span className="flex-1 text-left truncate group-hover:text-white">
                      {tz.label} <span className="text-gray-500 font-normal ml-1">{tz.offsetLabel}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Control Icons */}
        <div className="flex items-center space-x-0.5 px-1 border-l border-[#434651] h-full">
          <button className="hover:text-white hover:bg-white/5 p-1.5 rounded transition-colors text-gray-400" title="Settings">
            <MoveVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomBar;