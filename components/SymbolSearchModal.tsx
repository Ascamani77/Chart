
import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { PairIcons } from '../utils/symbolIcons';

interface SymbolItem {
  ticker: string;
  name: string;
  exchange: string;
  type: string;
  category: string;
}

const SYMBOLS: SymbolItem[] = [
  // WATCHLIST SECTION
  { ticker: 'SPX', name: 'S&P 500 Index', exchange: 'SPCFD', type: 'index', category: 'Watchlist' },
  { ticker: 'NDQ', name: 'US 100 Index', exchange: 'TVC', type: 'index', category: 'Watchlist' },
  { ticker: 'DJI', name: 'Dow Jones Industrial Average Index', exchange: 'TVC', type: 'index', category: 'Watchlist' },
  { ticker: 'DXY', name: 'U.S. Dollar Index', exchange: 'TVC', type: 'index', category: 'Watchlist' },
  { ticker: 'BTCUSDT', name: 'Bitcoin / TetherUS', exchange: 'BINANCE', type: 'crypto', category: 'Watchlist' },
  { ticker: 'ETHUSDT', name: 'Ethereum / TetherUS', exchange: 'BINANCE', type: 'crypto', category: 'Watchlist' },
  { ticker: 'SOLUSDT', name: 'Solana / TetherUS', exchange: 'BINANCE', type: 'crypto', category: 'Watchlist' },
  
  // FOREX SECTION
  { ticker: 'EURUSD', name: 'Euro / U.S. Dollar', exchange: 'FXCM', type: 'forex', category: 'FOREX' },
  { ticker: 'GBPUSD', name: 'British Pound / U.S. Dollar', exchange: 'FXCM', type: 'forex', category: 'FOREX' },
  { ticker: 'USDJPY', name: 'U.S. Dollar / Japanese Yen', exchange: 'FXCM', type: 'forex', category: 'FOREX' },
  { ticker: 'AUDUSD', name: 'Australian Dollar / U.S. Dollar', exchange: 'FXCM', type: 'forex', category: 'FOREX' },
  { ticker: 'USDCAD', name: 'U.S. Dollar / Canadian Dollar', exchange: 'FXCM', type: 'forex', category: 'FOREX' },
  { ticker: 'USDCHF', name: 'U.S. Dollar / Swiss Franc', exchange: 'FXCM', type: 'forex', category: 'FOREX' },
  { ticker: 'NZDUSD', name: 'New Zealand Dollar / U.S. Dollar', exchange: 'FXCM', type: 'forex', category: 'FOREX' },

  // STOCKS SECTION
  { ticker: 'AAPL', name: 'Apple Inc', exchange: 'NASDAQ', type: 'stock', category: 'STOCKS' },
  { ticker: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', type: 'stock', category: 'STOCKS' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', type: 'stock', category: 'STOCKS' },
  { ticker: 'NFLX', name: 'Netflix, Inc.', exchange: 'NASDAQ', type: 'stock', category: 'STOCKS' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ', type: 'stock', category: 'STOCKS' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'stock', category: 'STOCKS' },
  
  // FUTURES SECTION
  { ticker: 'XAUUSD', name: 'Gold / U.S. Dollar', exchange: 'TVC', type: 'commodity', category: 'FUTURES' },
  { ticker: 'XAGUSD', name: 'Silver / U.S. Dollar', exchange: 'TVC', type: 'commodity', category: 'FUTURES' },
  { ticker: 'USOIL', name: 'CFDs on WTI Crude Oil', exchange: 'TVC', type: 'commodity', category: 'FUTURES' },
];

interface SymbolSearchModalProps {
  onClose: () => void;
  onSelect: (ticker: string) => void;
}

const SymbolSearchModal: React.FC<SymbolSearchModalProps> = ({ onClose, onSelect }) => {
  const [query, setQuery] = useState('');

  const filtered = SYMBOLS.filter(s => 
    s.ticker.toLowerCase().includes(query.toLowerCase()) || 
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  const categories = ['Watchlist', 'FOREX', 'STOCKS', 'FUTURES'];

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[680px] h-[600px] flex flex-col bg-[#1e1e1e] text-[#d1d4dc] rounded-lg shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-[#363a45] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-[#2a2e39] shrink-0">
          <h1 className="text-lg font-bold text-gray-100">Symbol Search</h1>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar Area */}
        <div className="p-4 border-b border-[#2a2e39] bg-[#1e1e1e]">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-500" size={18} />
            <input 
              autoFocus
              type="text"
              placeholder="Symbol, ISIN, or CUSIP"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#2d2d2d] border border-[#2a2e39] focus:border-gray-400 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-200 outline-none transition-all placeholder-gray-500 font-medium"
            />
          </div>
          
          {/* Category Filters */}
          <div className="mt-4 flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
            {['All', 'Stocks', 'Funds', 'Futures', 'Forex', 'Crypto', 'Indices'].map(cat => (
              <button 
                key={cat}
                className={`px-4 py-1 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${cat === 'All' ? 'bg-white/10 text-white border-white/20' : 'text-gray-400 border-[#363a45] hover:bg-white/5 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Symbol List */}
        <div className="flex-1 overflow-y-auto bg-[#1e1e1e] scrollbar-hide">
          {categories.map(cat => {
            const items = filtered.filter(i => i.category === cat);
            if (items.length === 0) return null;
            
            return (
              <div key={cat} className="mb-2">
                <div className="px-4 py-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-wider bg-[#262626] sticky top-0 z-10">
                  {cat}
                </div>
                {items.map((item) => (
                  <div 
                    key={item.ticker}
                    onClick={() => { onSelect(item.ticker); onClose(); }}
                    className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer border-b border-[#2a2e39] transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <PairIcons symbol={item.ticker} size={18} />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-100 leading-tight">{item.ticker}</span>
                        <span className="text-[11px] text-gray-400 font-medium leading-tight truncate max-w-[200px]">{item.name}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-gray-100 uppercase tracking-tighter">{item.exchange}</span>
                      <span className="text-[9px] font-medium text-gray-500 lowercase">{item.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="h-10 border-t border-[#2a2e39] flex items-center justify-center px-4 shrink-0 bg-[#1e1e1e]">
          <div className="flex space-x-8">
              <div className="w-6 h-0.5 bg-[#2962ff] rounded-full"></div>
              <div className="w-6 h-0.5 bg-[#2d2d2d] rounded-full"></div>
              <div className="w-6 h-0.5 bg-[#2d2d2d] rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymbolSearchModal;
