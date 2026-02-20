
import React from 'react';
import { 
  TrendLineIcon, 
  RayIcon, 
  HorizontalLineIcon, 
  VerticalLineIcon, 
  CrossLineIcon 
} from '../charticons/TradingIcons';
import { ToolType } from '../../icons/toolTypes';

interface TrendLineToolsProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const TrendLineTools: React.FC<TrendLineToolsProps> = ({ activeTool, onActivate }) => {
  const tools: { icon: React.ReactNode, id: ToolType }[] = [
    { icon: <TrendLineIcon />, id: 'trendline' },
    { icon: <RayIcon />, id: 'ray' },
    { icon: <HorizontalLineIcon />, id: 'horizontal_line' },
    { icon: <VerticalLineIcon />, id: 'vertical_line' },
    { icon: <CrossLineIcon />, id: 'cross_line' },
  ];

  return (
    <div className="flex flex-col space-y-1">
      {tools.map((tool) => (
        <button 
          key={tool.id} 
          onClick={() => onActivate(tool.id)}
          className={`w-10 h-10 flex items-center justify-center rounded transition-colors group relative
            ${activeTool === tool.id
              ? 'text-white bg-[#2962ff] shadow-[0_0_10px_rgba(41,98,255,0.4)]' 
              : 'text-gray-300 hover:bg-[#2a2e39] hover:text-white'
            }`}
        >
          {tool.icon}
          <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-t-[3px] border-t-transparent border-r-[3px] border-r-gray-500"></div>
        </button>
      ))}
    </div>
  );
};

export default TrendLineTools;
