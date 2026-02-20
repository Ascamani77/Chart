
import React from 'react';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

const HotlistPanel: React.FC = () => {
  const items = [
    { symbol: 'NVDA', change: '+4.2%', trend: 'up' },
    { symbol: 'TSLA', change: '-2.1%', trend: 'down' },
    { symbol: 'AMD', change: '+1.5%', trend: 'up' },
    { symbol: 'BTC', change: '+0.8%', trend: 'up' },
  ];

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="p-3 border-b border-[#434651]/30">
        <div className="flex items-center space-x-2">
          <Sparkles size={14} className="text-yellow-400" />
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Hotlists</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => (
          <div key={item.symbol} className="flex items-center justify-between p-3 hover:bg-[#1e222d] border-b border-[#434651]/10">
            <span className="text-[11px] font-bold text-white">{item.symbol}</span>
            <div className={`flex items-center space-x-1 ${item.trend === 'up' ? 'text-[#00e676]' : 'text-[#ff5252]'}`}>
              {item.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span className="text-[11px] font-bold">{item.change}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotlistPanel;
