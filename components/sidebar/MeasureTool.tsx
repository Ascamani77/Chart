import React from 'react';
import { ToolType } from '../../icons/toolTypes';

interface MeasureToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const RectMeasureIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="5" y="7" width="14" height="10" rx="0.5" strokeDasharray="2 2" />
    <path d="M12 5V19" strokeOpacity="0.5" />
    <path d="M19 12L21 12" />
    <path d="M3 12L5 12" />
    <circle cx="5" cy="12" r="1.5" fill="currentColor" />
    <circle cx="19" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

const MeasureTool: React.FC<MeasureToolProps> = ({ activeTool, onActivate }) => {
  return (
    <button 
      onClick={() => onActivate('measure' as ToolType)}
      title="Price Range"
      className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-75 active:scale-95 group relative
        ${activeTool === ('measure' as ToolType)
          ? 'text-white bg-[#2962ff] border border-[#2962ff]/20 shadow-sm' 
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      <RectMeasureIcon />
      <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-t-[3px] border-t-transparent border-r-[3px] border-r-gray-500"></div>
    </button>
  );
};

export default MeasureTool;