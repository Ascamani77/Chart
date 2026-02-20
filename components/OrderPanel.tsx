
import React from 'react';
import { LayoutGrid, ArrowDown, ArrowUp } from 'lucide-react';

const OrderPanel: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-black">
      <div className="p-3 border-b border-[#434651]/30">
        <div className="flex items-center space-x-2">
          <LayoutGrid size={14} className="text-emerald-400" />
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Order Panel</span>
        </div>
      </div>
      <div className="p-4 flex flex-col space-y-4">
        <div className="flex space-x-2">
          <button className="flex-1 bg-[#ef5350] hover:bg-[#d32f2f] text-white py-2 rounded font-bold text-[11px] flex flex-col items-center">
            <span>SELL</span>
            <span className="font-mono">64,231.0</span>
          </button>
          <button className="flex-1 bg-[#26a69a] hover:bg-[#00897b] text-white py-2 rounded font-bold text-[11px] flex flex-col items-center">
            <span>BUY</span>
            <span className="font-mono">64,231.5</span>
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">Quantity</label>
            <input type="text" defaultValue="1" className="bg-[#1e222d] border border-[#434651] text-white text-[12px] px-2 py-1.5 rounded outline-none focus:border-[#2962ff]" />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">Take Profit</label>
            <input type="text" placeholder="Price" className="bg-[#1e222d] border border-[#434651] text-white text-[12px] px-2 py-1.5 rounded outline-none focus:border-[#2962ff]" />
          </div>
        </div>
        
        <button className="w-full bg-[#2962ff] text-white py-2 rounded font-bold text-[11px] uppercase tracking-wider mt-2">Place Market Order</button>
      </div>
    </div>
  );
};

export default OrderPanel;
