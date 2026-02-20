import React from 'react';
import { PenTool } from 'lucide-react';
import { ToolType } from '../../icons/toolTypes';

interface ToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const BrushTool: React.FC<ToolProps> = ({ activeTool, onActivate }) => (
  <button 
    onClick={() => onActivate('brush')}
    title="Brush"
    className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-75 active:scale-95 group relative
      ${activeTool === 'brush' ? 'text-white bg-white/10 border border-white/10 shadow-sm' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
  >
    <PenTool size={28} />
    <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-t-[3px] border-t-transparent border-r-[3px] border-r-gray-500"></div>
  </button>
);

export default BrushTool;