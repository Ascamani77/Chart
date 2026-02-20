import React from 'react';
import { Magnet } from 'lucide-react';
import { ToolType } from '../../icons/toolTypes';

interface MagnetToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
  isActive?: boolean;
}

const MagnetTool: React.FC<MagnetToolProps> = ({ isActive, onActivate }) => {
  return (
    <button 
      onClick={() => onActivate('magnet' as ToolType)}
      title="Magnet Mode"
      className={`w-10 h-10 flex items-center justify-center rounded transition-colors group relative
        ${isActive
          ? 'text-[#2962ff] bg-[#2962ff]/10 border border-[#2962ff]/20 shadow-sm' 
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      <Magnet size={28} />
      <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-t-[3px] border-t-transparent border-r-[3px] border-r-gray-500"></div>
    </button>
  );
};

export default MagnetTool;