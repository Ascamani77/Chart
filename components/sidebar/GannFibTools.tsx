
import React from 'react';
import { ToolType } from '../../icons/toolTypes';

interface GannFibToolsProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const FibRetracementIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 7H18" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="20" cy="7" r="1.5" fill="currentColor" />
    <path d="M4 11H20" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 15H20" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="4" cy="19" r="1.5" fill="currentColor" />
    <path d="M6 19H20" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const GannFibTools: React.FC<GannFibToolsProps> = ({ activeTool, onActivate }) => {
  return (
    <button 
      onClick={() => onActivate('fib' as ToolType)}
      className={`w-10 h-10 flex items-center justify-center rounded transition-colors group relative
        ${activeTool === ('fib' as ToolType)
          ? 'text-white bg-[#2962ff] shadow-[0_0_10px_rgba(41,98,255,0.4)]' 
          : 'text-gray-300 hover:bg-[#2a2e39] hover:text-white'
        }`}
    >
      <FibRetracementIcon />
      <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-t-[3px] border-t-transparent border-r-[3px] border-r-gray-500"></div>
    </button>
  );
};

export default GannFibTools;
