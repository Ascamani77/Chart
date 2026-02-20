import React from 'react';
import { ToolType } from '../../icons/toolTypes';

interface RectangleToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const RectangleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="6" width="12" height="12" />
    <circle cx="6" cy="6" r="1.5" fill="currentColor" />
    <circle cx="18" cy="6" r="1.5" fill="currentColor" />
    <circle cx="6" cy="18" r="1.5" fill="currentColor" />
    <circle cx="18" cy="18" r="1.5" fill="currentColor" />
  </svg>
);

const RectangleTool: React.FC<RectangleToolProps> = ({ activeTool, onActivate }) => {
  return (
    <button 
      onClick={() => onActivate('rectangle' as ToolType)}
      title="Rectangle"
      className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-75 active:scale-95 group relative
        ${activeTool === ('rectangle' as ToolType)
          ? 'text-white bg-[#2962ff] border border-[#2962ff]/20 shadow-sm' 
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      <RectangleIcon />
      <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-t-[3px] border-t-transparent border-r-[3px] border-r-gray-500"></div>
    </button>
  );
};

export default RectangleTool;