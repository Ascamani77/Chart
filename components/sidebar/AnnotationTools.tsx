
import React from 'react';
import { Type } from 'lucide-react';
import { ToolType } from '../../icons/toolTypes';

interface AnnotationToolsProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const AnnotationTools: React.FC<AnnotationToolsProps> = ({ activeTool, onActivate }) => {
  return (
    <button 
      onClick={() => onActivate('text' as ToolType)}
      className={`w-10 h-10 flex items-center justify-center rounded transition-colors group relative
        ${activeTool === ('text' as ToolType)
          ? 'text-white bg-[#2962ff] shadow-[0_0_10px_rgba(41,98,255,0.4)]' 
          : 'text-gray-300 hover:bg-[#2a2e39] hover:text-white'
        }`}
    >
      <Type size={24} />
      <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-t-[3px] border-t-transparent border-r-[3px] border-r-gray-500"></div>
    </button>
  );
};

export default AnnotationTools;
