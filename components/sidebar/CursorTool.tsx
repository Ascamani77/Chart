import React from 'react';
import { MousePointer2 } from 'lucide-react';
import { ToolType } from '../../icons/toolTypes';

interface CursorToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const CursorTool: React.FC<CursorToolProps> = ({ activeTool, onActivate }) => {
  return (
    <button 
      onClick={() => onActivate('cursor')}
      title="Cursor"
      className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-75 active:scale-95 group relative
        ${activeTool === 'cursor' 
          ? 'text-white bg-white/10 border border-white/10 shadow-sm' 
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      <MousePointer2 size={28} />
    </button>
  );
};

export default CursorTool;