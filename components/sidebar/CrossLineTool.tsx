
import React from 'react';
import { CrossLineIcon } from '../charticons/TradingIcons';
import { ToolType } from '../../icons/toolTypes';

interface ToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const CrossLineTool: React.FC<ToolProps> = ({ activeTool, onActivate }) => (
  <button 
    onClick={() => onActivate('cross_line')}
    title="Cross Line"
    className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-75 active:scale-95 group relative
      ${activeTool === 'cross_line' ? 'text-white bg-white/10 border border-white/10 shadow-sm' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
  >
    <CrossLineIcon />
  </button>
);

export default CrossLineTool;
