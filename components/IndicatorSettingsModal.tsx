
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface IndicatorSettingsModalProps {
  indicatorId: string;
  currentValue: number;
  onClose: () => void;
  onSave: (newValue: number) => void;
}

const IndicatorSettingsModal: React.FC<IndicatorSettingsModalProps> = ({ 
  indicatorId, 
  currentValue, 
  onClose, 
  onSave 
}) => {
  const [value, setValue] = useState(currentValue);

  const getLabel = () => {
    if (indicatorId.startsWith('sma')) return 'SMA Period';
    if (indicatorId.startsWith('ema')) return 'EMA Period';
    if (indicatorId === 'rsi') return 'RSI Period';
    if (indicatorId === 'atr') return 'ATR Period';
    if (indicatorId === 'bb') return 'Bollinger Period';
    return 'Period';
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e222d] w-full max-w-md rounded-lg shadow-2xl border border-[#363a45] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#363a45]">
          <h2 className="text-lg font-bold text-gray-100 uppercase tracking-tight">Settings: {indicatorId.toUpperCase()}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">{getLabel()}</label>
              <input 
                type="number"
                value={value}
                onChange={(e) => setValue(parseInt(e.target.value) || 1)}
                className="w-24 bg-[#2a2e39] border border-[#363a45] rounded px-3 py-1.5 text-sm text-gray-200 outline-none focus:border-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#131722]/50 border-t border-[#363a45] flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(value)}
            className="px-6 py-2 bg-white/10 text-white text-sm font-bold rounded border border-white/5 hover:bg-white/20 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndicatorSettingsModal;
