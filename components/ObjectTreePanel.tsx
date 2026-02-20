
import React from 'react';
import { LayoutGrid, Eye, Lock, Trash2 } from 'lucide-react';

const ObjectTreePanel: React.FC = () => {
  const objects = [
    { name: 'Trend Line', type: 'Drawing', visible: true, locked: false },
    { name: 'Horizontal Line', type: 'Drawing', visible: true, locked: true },
    { name: 'RSI', type: 'Indicator', visible: true, locked: false },
    { name: 'Volume', type: 'Indicator', visible: false, locked: false },
  ];

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="p-3 border-b border-[#434651]/30">
        <div className="flex items-center space-x-2">
          <LayoutGrid size={14} className="text-gray-400" />
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Object Tree</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {objects.map((obj, i) => (
          <div key={i} className="flex items-center justify-between p-3 hover:bg-[#1e222d] border-b border-[#434651]/10">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-200">{obj.name}</span>
              <span className="text-[9px] text-gray-500 uppercase">{obj.type}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <Eye size={12} className={obj.visible ? 'text-gray-200' : 'text-gray-700'} />
              <Lock size={12} className={obj.locked ? 'text-blue-500' : 'text-gray-700'} />
              <Trash2 size={12} className="hover:text-red-500 cursor-pointer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ObjectTreePanel;
