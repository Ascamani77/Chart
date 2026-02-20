import React from 'react';
import { ToolType } from '../../icons/toolTypes';

interface ProjectionToolProps {
  activeTool: ToolType;
  onActivate: (tool: ToolType) => void;
}

const ProjectionIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M7 17V7" />
    <path d="M7 17H17" />
    <path d="M7 7C12.523 7 17 11.477 17 17" />
    <circle cx="7" cy="7" r="1.5" fill="currentColor" />
    <circle cx="7" cy="17" r="1.5" fill="currentColor" />
    <circle cx="17" cy="17" r="1.5" fill="currentColor" />
  </svg>
);

const ProjectionTool: React.FC<ProjectionToolProps> = ({ activeTool, onActivate }) => {
  return (
    <button 
      onClick={() => onActivate('projection' as ToolType)}
      title="Projection"
      className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-75 active:scale-95 group relative
        ${activeTool === ('projection' as ToolType)
          ? 'text-white bg-[#2962ff] border border-[#2962ff]/20 shadow-sm' 
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      <ProjectionIcon />
      <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-t-[3px] border-t-transparent border-r-[3px] border-r-gray-500"></div>
    </button>
  );
};

export default ProjectionTool;