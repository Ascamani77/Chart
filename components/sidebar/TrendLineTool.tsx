import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Star } from 'lucide-react';
import { 
  TrendLineIcon, 
  RayIcon, 
  InfoLineIcon,
  ExtendedLineIcon,
  TrendAngleIcon,
  HorizontalLineIcon, 
  HorizontalRayIcon,
  VerticalLineIcon, 
  CrossLineIcon 
} from '../charticons/TradingIcons';
import { ToolType } from '../../icons/toolTypes';

interface ToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const TrendLineTool: React.FC<ToolProps> = ({ activeTool, onActivate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  
  const lineTools = [
    'trendline', 'ray', 'info_line', 'extended_line', 'trend_angle', 
    'horizontal_line', 'horizontal_ray', 'vertical_line', 'cross_line'
  ];
  
  const isTrendToolActive = lineTools.includes(activeTool as string);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonContainerRef.current) {
      const rect = buttonContainerRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.top - 10,
        left: rect.right + 6
      });
    }
  }, [isOpen]);

  const getActiveIcon = () => {
    switch (activeTool) {
      case 'ray': return <RayIcon />;
      case 'info_line': return <InfoLineIcon />;
      case 'extended_line': return <ExtendedLineIcon />;
      case 'trend_angle': return <TrendAngleIcon />;
      case 'horizontal_line': return <HorizontalLineIcon />;
      case 'horizontal_ray': return <HorizontalRayIcon />;
      case 'vertical_line': return <VerticalLineIcon />;
      case 'cross_line': return <CrossLineIcon />;
      default: return <TrendLineIcon />;
    }
  };

  const ToolOption = ({ id, label, icon: Icon, shortcut, isStarred }: { id: ToolType, label: string, icon: any, shortcut?: string, isStarred?: boolean }) => (
    <div 
      onClick={() => { onActivate(id); setIsOpen(false); }}
      className={`flex items-center justify-between px-3 py-[7px] hover:bg-[#2a2e39] cursor-pointer group/item transition-colors ${activeTool === id ? 'bg-[#2a2e39]' : ''}`}
    >
      <div className="flex items-center space-x-3">
        <div className={`text-[#d1d4dc] group-hover/item:text-white transition-colors w-6 flex justify-center shrink-0`}>
          {Icon}
        </div>
        <span className={`text-[13px] font-medium text-[#d1d4dc] group-hover/item:text-white whitespace-nowrap`}>{label}</span>
      </div>
      <div className="flex items-center space-x-4 ml-8">
        {shortcut && <span className="text-[11px] text-[#787b86] group-hover/item:text-white/70 font-medium whitespace-nowrap">{shortcut}</span>}
        <Star 
          size={14} 
          className={`transition-all ${isStarred ? 'text-orange-500 fill-orange-500 opacity-100' : 'text-[#787b86] opacity-0 group-hover/item:opacity-100 hover:text-orange-500'}`} 
        />
      </div>
    </div>
  );

  return (
    <div className="relative group/tool" ref={buttonContainerRef}>
      <div className="flex items-center justify-center w-[40px] h-[40px] relative">
        {/* Main Tool Button */}
        <button 
          onClick={() => onActivate(activeTool || 'trendline')}
          title="Trend Line Tools"
          className={`w-full h-full flex items-center justify-center rounded transition-all duration-75 active:scale-95
            ${isTrendToolActive ? 'text-white bg-[#2962ff]' : 'text-gray-300 hover:bg-[#2a2e39] hover:text-white'}`}
        >
          {getActiveIcon()}
        </button>
        
        {/* The dedicated sub-menu arrow icon on the right as seen in TradingView */}
        <button 
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className={`absolute right-[-10px] top-[10px] bottom-[10px] w-[12px] flex items-center justify-center rounded-r bg-[#1e222d] border-l border-black/20 transition-all opacity-0 group-hover/tool:opacity-100 z-10
            ${isOpen ? 'opacity-100 bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'}`}
        >
          <ChevronRight size={10} strokeWidth={3} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu - Use fixed positioning to avoid being clipped by scrollable sidebar */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          style={{ top: menuPos.top, left: menuPos.left }}
          className="fixed bg-[#1e1e1e] border border-[#363a45] rounded-sm shadow-[0_12px_48px_rgba(0,0,0,0.8)] py-1 min-w-[280px] z-[2000] animate-in slide-in-from-left-1 duration-100 max-h-[85vh] overflow-y-auto scrollbar-hide"
        >
          <div className="px-4 py-1.5 text-[10px] font-bold text-[#787b86] uppercase tracking-wider select-none sticky top-0 bg-[#1e1e1e] z-10">Lines</div>
          
          <ToolOption id="trendline" label="Trend Line" icon={<TrendLineIcon />} shortcut="Alt + T" />
          <ToolOption id="ray" label="Ray" icon={<RayIcon />} />
          <ToolOption id="info_line" label="Info Line" icon={<InfoLineIcon />} />
          <ToolOption id="extended_line" label="Extended Line" icon={<ExtendedLineIcon />} />
          <ToolOption id="trend_angle" label="Trend Angle" icon={<TrendAngleIcon />} />
          
          <div className="h-px bg-[#363a45] mx-3 my-1 opacity-40"></div>
          
          <ToolOption id="horizontal_line" label="Horizontal Line" icon={<HorizontalLineIcon />} shortcut="Alt + H" isStarred={true} />
          <ToolOption id="horizontal_ray" label="Horizontal Ray" icon={<HorizontalRayIcon />} shortcut="Alt + J" />
          <ToolOption id="vertical_line" label="Vertical Line" icon={<VerticalLineIcon />} shortcut="Alt + V" />
          <ToolOption id="cross_line" label="Cross Line" icon={<CrossLineIcon />} shortcut="Alt + C" />
        </div>
      )}
    </div>
  );
};

export default TrendLineTool;