import React from 'react';
import { Lock } from 'lucide-react';
import { ToolType } from '../../icons/toolTypes';

interface LockToolProps {
  isActive?: boolean;
  onActivate: (tool: ToolType) => void;
}

const LockTool: React.FC<LockToolProps> = ({ isActive, onActivate }) => {
  return (
    <button 
      onClick={() => onActivate('lock' as ToolType)}
      title="Lock All Drawing Tools"
      className={`w-10 h-10 flex items-center justify-center rounded transition-colors group relative
        ${isActive
          ? 'text-[#2962ff] bg-[#2962ff]/10 border border-[#2962ff]/20 shadow-sm' 
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      <Lock size={28} />
    </button>
  );
};

export default LockTool;