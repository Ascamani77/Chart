import React from 'react';
import { ToolType } from '../../icons/toolTypes';

interface AnchoredVwapToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const AnchoredVwapIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Candlestick 1 */}
    <rect x="8" y="7" width="3" height="10" rx="0.5" strokeOpacity="0.8" />
    <path d="M9.5 4V7M9.5 17V20" strokeOpacity="0.8" />
    
    {/* Candlestick 2 */}
    <rect x="13" y="10" width="3" height="7" rx="0.5" strokeOpacity="0.8" />
    <path d="M14.5 7V10M14.5 17V20" strokeOpacity="0.8" />

    {/* VWAP Line starting from anchor */}
    <path d="M6 15C10 15 12 12 20 10" stroke="#2962ff" strokeWidth="2" strokeLinecap="round" />
    <circle cx="6" cy="15" r="1.5" fill="#2962ff" stroke="none" />
  </svg>
);

const AnchoredVwapTool: React.FC<AnchoredVwapToolProps> = ({ activeTool, onActivate }) => {
  return (
    <button 
      onClick={() => onActivate('anchored_vwap' as ToolType)}
      title="Anchored VWAP"
      className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-75 active:scale-95 group relative
        ${activeTool === ('anchored_vwap' as ToolType)
          ? 'text-white bg-[#2962ff] border border-[#2962ff]/20 shadow-sm' 
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      <AnchoredVwapIcon />
      <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-t-[3px] border-t-transparent border-r-[3px] border-r-gray-500"></div>
    </button>
  );
};

export default AnchoredVwapTool;