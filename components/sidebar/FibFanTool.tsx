import React from 'react';
import { ToolType } from '../../icons/toolTypes';

interface FibFanToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const FibFanIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5 19L5 5" />
    <path d="M5 19L19 19" />
    <path d="M5 19L19 5" />
    <path d="M5 19L19 12" />
    <path d="M5 19L12 5" />
    <circle cx="5" cy="19" r="1.5" fill="currentColor" />
    <circle cx="19" cy="5" r="1.5" fill="currentColor" />
  </svg>
);

const FibFanTool: React.FC<FibFanToolProps> = ({ activeTool, onActivate }) => {
  return (
    <button 
      onClick={() => onActivate('fib_fan' as ToolType)}
      title="Fib Speed Resistance Fan"
      className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-75 active:scale-95 group relative
        ${activeTool === ('fib_fan' as ToolType)
          ? 'text-white bg-[#2962ff] border border-[#2962ff]/20 shadow-sm' 
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      <FibFanIcon />
      <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-t-[3px] border-t-transparent border-r-[3px] border-r-gray-500"></div>
    </button>
  );
};

export default FibFanTool;