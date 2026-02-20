import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Star, Info } from 'lucide-react';

interface Indicator {
  id: string;
  name: string;
  description: string;
}

const INDICATORS_LIST: Indicator[] = [
  { id: 'rsi', name: 'Relative Strength Index (RSI)', description: 'Momentum oscillator' },
  { id: 'ema', name: 'Moving Average Exponential (Double)', description: 'Fast and slow trend direction' },
  { id: 'sma', name: 'Moving Average Simple (Double)', description: 'Long-term trend indicators' },
  { id: 'vol', name: 'Volume', description: 'Confirms breakouts and liquidity' },
  { id: 'vwap', name: 'VWAP', description: 'Intraday institutional reference' },
  { id: 'atr', name: 'ATR (Average True Range)', description: 'Volatility sizing' },
  { id: 'bb', name: 'Bollinger Bands', description: 'Volatility expansion/contraction' },
  { id: 'ma', name: 'Moving Average', description: 'Simple moving average' },
];

interface IndicatorsModalProps {
  onClose: () => void;
  onSelectIndicator?: (id: string, config?: { val1: number, val2: number }) => void;
}

const IndicatorsModal: React.FC<IndicatorsModalProps> = ({ onClose, onSelectIndicator }) => {
  const [configuringId, setConfiguringId] = useState<string | null>(null);
  const [val1, setVal1] = useState<number>(10);
  const [val2, setVal2] = useState<number>(20);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleApplyConfig = () => {
    if (configuringId && onSelectIndicator) {
      onSelectIndicator(configuringId, { val1, val2 });
    }
    onClose();
  };

  const handleIndicatorClick = (ind: Indicator) => {
    if (ind.id === 'ema' || ind.id === 'sma') {
      if (ind.id === 'ema') { setVal1(10); setVal2(20); }
      if (ind.id === 'sma') { setVal1(50); setVal2(200); }
      setConfiguringId(ind.id);
    } else {
      if (onSelectIndicator) {
        onSelectIndicator(ind.id);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div 
        ref={dropdownRef}
        className="absolute top-[52px] left-[320px] bg-[#1c1c1c] w-full max-w-[320px] rounded shadow-2xl border border-[#363a45] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-auto"
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2e39] bg-[#1c1c1c]">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Indicators</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {configuringId ? (
            <div className="p-5 flex flex-col items-center justify-center space-y-5 animate-in slide-in-from-right-2 duration-200">
              <div className="text-center">
                <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">Set {configuringId.toUpperCase()}</h3>
                <p className="text-gray-500 text-[10px]">Adjust periods for both inputs</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Fast</label>
                  <input 
                    autoFocus
                    type="number"
                    value={val1}
                    onChange={(e) => setVal1(parseInt(e.target.value) || 0)}
                    className="w-24 bg-[#2a2e39] border border-[#434651] focus:border-[#2962ff] rounded py-1.5 px-3 text-sm text-white outline-none font-bold tabular-nums transition-all"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Slow</label>
                  <input 
                    type="number"
                    value={val2}
                    onChange={(e) => setVal2(parseInt(e.target.value) || 0)}
                    className="w-24 bg-[#2a2e39] border border-[#434651] focus:border-[#2962ff] rounded py-1.5 px-3 text-sm text-white outline-none font-bold tabular-nums transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2 w-full">
                <button 
                  onClick={handleApplyConfig}
                  className="w-full py-2 bg-[#2962ff] text-white text-[11px] font-bold rounded hover:bg-[#1e4bd8] transition-all flex items-center justify-center space-x-2"
                >
                  <Check size={14} />
                  <span>Apply to Chart</span>
                </button>
                <button 
                  onClick={() => setConfiguringId(null)}
                  className="w-full py-1.5 text-gray-400 text-[10px] font-bold rounded hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="py-1">
              {INDICATORS_LIST.map(ind => (
                <div 
                  key={ind.id}
                  className="group flex items-center justify-between px-4 py-2 hover:bg-[#2a2e39] cursor-pointer transition-colors"
                  onClick={() => handleIndicatorClick(ind)}
                >
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-gray-200 group-hover:text-white transition-colors">
                      {ind.name}
                    </span>
                    <span className="text-[10px] text-gray-500 line-clamp-1">
                      {ind.description}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Star size={12} className="text-gray-500 hover:text-yellow-500" />
                    <Info size={12} className="text-gray-500 hover:text-blue-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndicatorsModal;