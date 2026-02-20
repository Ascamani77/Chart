
import React from 'react';

interface StrategyTesterProps {
  activeSymbol: string;
}

const StrategyTester: React.FC<StrategyTesterProps> = ({ activeSymbol }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#1e1e1e] border-t border-[#434651] text-[#787b86]">
      <span className="text-[14px] font-bold uppercase tracking-widest opacity-50 mb-2">Strategy Tester</span>
      <span className="text-[12px] italic">No strategy running for {activeSymbol}</span>
      <button className="mt-4 px-4 py-1.5 bg-[#2962ff] text-white text-[11px] font-bold rounded hover:bg-[#1e4bd8] transition-colors">
        Select Strategy
      </button>
    </div>
  );
};

export default StrategyTester;
