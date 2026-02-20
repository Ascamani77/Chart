
import React from 'react';
import { Layers } from 'lucide-react';

const DOMPanel: React.FC = () => {
  const rows = Array.from({ length: 15 }, (_, i) => ({
    price: 64230 + (7 - i) * 0.5,
    size: Math.floor(Math.random() * 50) + 1,
    type: i < 7 ? 'ask' : i > 7 ? 'bid' : 'mid'
  }));

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="p-3 border-b border-[#434651]/30">
        <div className="flex items-center space-x-2">
          <Layers size={14} className="text-cyan-400" />
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">DOM</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex text-[9px] text-gray-500 border-b border-[#1e222d] px-2 py-1 uppercase font-bold">
          <div className="w-1/2">Price</div>
          <div className="w-1/2 text-right">Size</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rows.map((row, i) => (
            <div key={i} className={`flex px-2 py-0.5 text-[10px] font-mono transition-colors hover:bg-white/5 ${row.type === 'ask' ? 'text-[#ff5252]' : row.type === 'bid' ? 'text-[#00e676]' : 'text-white bg-[#2962ff22]'}`}>
              <div className="w-1/2">{row.price.toFixed(1)}</div>
              <div className="w-1/2 text-right">{row.size}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DOMPanel;
