
import React from 'react';
import { WATCHLIST_DATA } from '../utils/mockData';

const WatchlistTable: React.FC = () => {
  return (
    <table className="w-full text-left border-collapse table-fixed">
      <thead>
        <tr className="text-[9px] text-gray-400 uppercase border-b border-[#434651] sticky top-0 bg-black z-10">
          <th className="font-normal py-2 px-2 w-1/2">Symbol</th>
          <th className="font-normal py-2 px-0.5 text-right">Last</th>
          <th className="font-normal py-2 px-1 text-right">Chg%</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#434651]/20">
        {WATCHLIST_DATA.map((item) => (
          <tr key={item.ticker} className="hover:bg-[#1a1a1a] cursor-pointer group transition-colors">
            <td className="py-2 px-2 overflow-hidden">
              <div className="flex flex-col truncate">
                <span className="font-bold text-white text-[11px] tracking-tight">{item.ticker}</span>
                <span className="text-[9px] text-gray-500 truncate">{item.name}</span>
              </div>
            </td>
            <td className="text-right py-2 px-0.5">
              <span className="text-[11px] font-bold text-white tabular-nums">
                {item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </td>
            <td className="text-right py-2 px-1">
              <div className={`text-[10px] font-bold px-1 py-0.5 rounded text-right tabular-nums ${item.changePercent >= 0 ? 'text-[#00e676]' : 'text-[#ff5252]'}`}>
                {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default WatchlistTable;
