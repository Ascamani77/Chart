import React from 'react';
import { Trash2 } from 'lucide-react';
import { ToolType } from '../../icons/toolTypes';

interface RemoveToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const RemoveTool: React.FC<RemoveToolProps> = ({ activeTool, onActivate }) => {
  return (
    <button 
      onClick={() => onActivate('clear_drawings' as ToolType)}
      title="Remove Drawings"
      className={`w-10 h-10 flex items-center justify-center rounded transition-colors group relative text-gray-300 hover:bg-[#2a2e39] hover:text-white`}
    >
      <Trash2 size={28} />
      <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-t-[3px] border-t-transparent border-r-[3px] border-r-gray-500"></div>
    </button>
  );
};

export default RemoveTool;