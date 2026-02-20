
import React from 'react';
import { Search } from 'lucide-react';
import { ToolType } from '../../icons/toolTypes';

interface ZoomToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const ZoomTool: React.FC<ZoomToolProps> = ({ activeTool, onActivate }) => {
  return (
    <button 
      onClick={() => onActivate('zoom' as ToolType)}
      title="Zoom"
      className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-75 active:scale-95 group relative
        ${activeTool === ('zoom' as ToolType)
          ? 'text-white bg-white/10 border border-white/10 shadow-sm' 
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      <Search size={28} />
    </button>
  );
};

export default ZoomTool;
