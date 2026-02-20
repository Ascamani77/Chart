
import React from 'react';
import { Database } from 'lucide-react';

const DataWindowPanel: React.FC = () => {
  const data = [
    { label: 'Open', value: '64,231.22' },
    { label: 'High', value: '64,500.00' },
    { label: 'Low', value: '63,800.00' },
    { label: 'Close', value: '64,231.22' },
    { label: 'Change', value: '+124.50' },
    { label: 'Volume', value: '1.245K' },
  ];

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="p-3 border-b border-[#434651]/30">
        <div className="flex items-center space-x-2">
          <Database size={14} className="text-blue-400" />
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Data Window</span>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-1">
        {data.map((item) => (
          <div key={item.label} className="flex justify-between py-1.5 border-b border-[#1e222d]">
            <span className="text-[11px] text-gray-500 font-medium">{item.label}</span>
            <span className="text-[11px] text-gray-200 font-mono">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataWindowPanel;
