
import React from 'react';
import { Lightbulb, Plus } from 'lucide-react';

const MyIdeasPanel: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex items-center justify-between p-3 border-b border-[#434651]/30">
        <div className="flex items-center space-x-2">
          <Lightbulb size={14} className="text-yellow-300" />
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">My Ideas</span>
        </div>
        <Plus size={14} className="text-gray-400 hover:text-white cursor-pointer" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <Lightbulb size={32} className="text-gray-700 opacity-30" />
        <p className="text-[11px] text-gray-500">You haven't published any ideas yet.</p>
        <button className="px-4 py-1.5 bg-[#2962ff] text-white text-[11px] font-bold rounded">Create New Idea</button>
      </div>
    </div>
  );
};

export default MyIdeasPanel;
