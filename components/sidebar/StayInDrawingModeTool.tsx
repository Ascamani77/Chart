
import React from 'react';
import { PencilLine } from 'lucide-react';

interface StayInDrawingModeToolProps {
  isActive?: boolean;
  onActivate: () => void;
}

const StayInDrawingModeTool: React.FC<StayInDrawingModeToolProps> = ({ isActive, onActivate }) => {
  return (
    <button 
      onClick={onActivate}
      title="Stay in Drawing Mode"
      className={`w-10 h-10 flex items-center justify-center rounded transition-colors group relative
        ${isActive
          ? 'text-[#2962ff] bg-[#2962ff]/10 border border-[#2962ff]/20' 
          : 'text-gray-300 hover:bg-[#2a2e39] hover:text-white'
        }`}
    >
      <PencilLine size={28} />
    </button>
  );
};

export default StayInDrawingModeTool;
