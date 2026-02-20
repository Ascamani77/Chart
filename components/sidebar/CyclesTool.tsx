
import React from 'react';
import { Waves } from 'lucide-react';
import { ToolType } from '../../icons/toolTypes';

interface ToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const CyclesTool: React.FC<ToolProps> = ({ activeTool, onActivate }) => (
  <button 
    onClick={() => onActivate('cycles' as ToolType)}
    title="Cycles"
    className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-75 active:scale-95 group relative
      ${activeTool === ('cycles' as ToolType) ? 'text-white bg-white/10 border border-white/10 shadow-sm' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
  >
    <Waves size={24} />
  </button>
);

export default CyclesTool;
