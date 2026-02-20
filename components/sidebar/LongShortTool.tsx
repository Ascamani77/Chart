import React from 'react';
import { LayoutTemplate } from 'lucide-react';
import { ToolType } from '../../icons/toolTypes';

interface ToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const LongShortTool: React.FC<ToolProps> = ({ activeTool, onActivate }) => (
  <div className="flex flex-col space-y-1">
    <button 
      onClick={() => onActivate('long_position')}
      title="Long Position"
      className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-75 active:scale-95 group relative
        ${activeTool === 'long_position' ? 'text-white bg-white/10 border border-white/10 shadow-sm' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
    >
      <div className="relative">
        <LayoutTemplate size={28} className="text-[#089981]" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#089981] rounded-full"></div>
      </div>
      <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-t-[3px] border-t-transparent border-r-[3px] border-r-gray-500"></div>
    </button>
    <button 
      onClick={() => onActivate('short_position')}
      title="Short Position"
      className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-75 active:scale-95 group relative
        ${activeTool === 'short_position' ? 'text-white bg-white/10 border border-white/10 shadow-sm' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
    >
      <div className="relative">
        <LayoutTemplate size={28} className="text-[#f23645]" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#f23645] rounded-full"></div>
      </div>
      <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-t-[3px] border-t-transparent border-r-[3px] border-r-gray-500"></div>
    </button>
  </div>
);

export default LongShortTool;