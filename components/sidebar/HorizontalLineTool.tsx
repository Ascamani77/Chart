
import React from 'react';
import { HorizontalLineIcon } from '../charticons/TradingIcons';
import { ToolType } from '../../icons/toolTypes';

interface ToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const HorizontalLineTool: React.FC<ToolProps> = ({ activeTool, onActivate }) => (
  <button 
    onClick={() => onActivate('horizontal_line')}
    title="Horizontal Line"
    className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-75 active:scale-95 group relative
      ${activeTool === 'horizontal_line' ? 'text-white bg-white/10 border border-white/10 shadow-sm' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
  >
    <HorizontalLineIcon />
  </button>
);

export default HorizontalLineTool;
