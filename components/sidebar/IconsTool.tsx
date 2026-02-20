import React from 'react';
import { ToolType } from '../../icons/toolTypes';

interface IconsToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const XABCDIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 18L8 8L12 18L16 8L20 18" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="4" cy="18" r="1" fill="currentColor"/>
    <circle cx="8" cy="8" r="1" fill="currentColor"/>
    <circle cx="12" cy="18" r="1" fill="currentColor"/>
    <circle cx="16" cy="8" r="1" fill="currentColor"/>
    <circle cx="20" cy="18" r="1" fill="currentColor"/>
  </svg>
);

const IconsTool: React.FC<IconsToolProps> = ({ activeTool, onActivate }) => {
  return (
    <button 
      onClick={() => onActivate('icons' as ToolType)}
      title="Patterns"
      className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-75 active:scale-95 group relative
        ${activeTool === ('icons' as ToolType)
          ? 'text-white bg-white/10 border border-white/10 shadow-sm' 
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      <XABCDIcon />
      <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-t-[3px] border-t-transparent border-r-[3px] border-r-gray-500"></div>
    </button>
  );
};

export default IconsTool;