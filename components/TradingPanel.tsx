
import React from 'react';

const TradingPanel: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#1e1e1e] border-t border-[#434651] text-[#787b86]">
      <span className="text-[14px] font-bold uppercase tracking-widest opacity-50 mb-2">Trading Panel</span>
      <span className="text-[12px] italic">Connect your broker to start trading</span>
      <button className="mt-4 px-4 py-1.5 bg-white text-black text-[11px] font-bold rounded hover:bg-gray-200 transition-colors">
        See all brokers
      </button>
    </div>
  );
};

export default TradingPanel;
