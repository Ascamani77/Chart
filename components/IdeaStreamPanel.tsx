
import React from 'react';
import { Newspaper, ArrowUpRight } from 'lucide-react';

const IdeaStreamPanel: React.FC = () => {
  const news = [
    { title: 'BTC breaks $64k resistance', author: 'TradeMaster', time: '2m' },
    { title: 'ETH volume surging', author: 'CryptoAnalyst', time: '15m' },
    { title: 'Why Solana is the next big thing', author: 'Visionary', time: '1h' },
  ];

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="p-3 border-b border-[#434651]/30">
        <div className="flex items-center space-x-2">
          <Newspaper size={14} className="text-indigo-400" />
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Idea Stream</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {news.map((item, i) => (
          <div key={i} className="p-3 border-b border-[#434651]/10 hover:bg-[#1e222d] group cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase">{item.author}</span>
              <span className="text-[10px] text-gray-600">{item.time}</span>
            </div>
            <p className="text-[11px] text-gray-200 font-medium group-hover:text-blue-400 transition-colors line-clamp-2">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IdeaStreamPanel;
