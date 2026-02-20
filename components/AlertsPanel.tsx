
import React from 'react';
import { Bell, Plus, Settings } from 'lucide-react';

const AlertsPanel: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex items-center justify-between p-3 border-b border-[#434651]/30">
        <div className="flex items-center space-x-2">
          <Bell size={14} className="text-orange-400" />
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Alerts</span>
        </div>
        <div className="flex items-center space-x-2">
          <Plus size={14} className="text-gray-400 hover:text-white cursor-pointer" />
          <Settings size={14} className="text-gray-400 hover:text-white cursor-pointer" />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#1e222d] flex items-center justify-center">
          <Bell size={24} className="text-gray-600" />
        </div>
        <p className="text-[12px] text-gray-400 font-medium">No alerts set for this symbol</p>
        <button className="text-[11px] text-[#2962ff] font-bold hover:underline">Create Alert</button>
      </div>
    </div>
  );
};

export default AlertsPanel;
