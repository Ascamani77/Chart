
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, X, ChevronDown, Check, ArrowLeftToLine } from 'lucide-react';
import { ReplayState } from '../services/replayService';

interface ReplayToolbarProps {
  state: ReplayState;
  onSelectBar: () => void;
  onPlayPause: () => void;
  onStep: () => void;
  onSpeedChange: (ms: number) => void;
  onClose: () => void;
  timeframeLabel: string;
}

const SPEED_OPTIONS = [
  { label: '0.1x', value: 100 },
  { label: '0.5x', value: 500 },
  { label: '1x', value: 1000 },
  { label: '2x', value: 2000 },
  { label: '3x', value: 3000 },
];

const ReplayToolbar: React.FC<ReplayToolbarProps> = ({ 
  state, 
  onSelectBar, 
  onPlayPause, 
  onStep, 
  onSpeedChange,
  onClose,
  timeframeLabel
}) => {
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setIsSpeedMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative h-[38px] bg-[#1c1c1c] border-t border-[#2a2e39] flex items-center px-4 shrink-0 z-[100] select-none">
      <div className="flex items-center h-full w-full max-w-screen-2xl mx-auto space-x-0">
        
        {/* Left Side: Centering offset */}
        <div className="flex-1 lg:flex-[0.6]"></div>

        {/* Action Group: Select bar */}
        <div className="flex items-center">
          <button 
            onClick={onSelectBar}
            title="Select bar"
            className={`flex items-center space-x-2 px-3 h-7 rounded-l-md transition-all border border-r-0 ${
              state.isSelecting 
                ? 'bg-[#2962ff] border-[#2962ff] text-white' 
                : 'bg-[#2a2e39] border-[#363a45] text-gray-200 hover:bg-[#363c4e]'
            }`}
          >
            <ArrowLeftToLine size={13} strokeWidth={2.5} className={state.isSelecting ? 'text-white' : 'text-gray-400'} />
            <span className="text-[12px] font-bold">Select bar</span>
          </button>
          <button className={`h-7 px-1.5 rounded-r-md border transition-all ${
              state.isSelecting 
                ? 'bg-[#2962ff] border-[#2962ff] text-white' 
                : 'bg-[#2a2e39] border-[#363a45] text-gray-400 hover:bg-[#363c4e]'
            }`}>
            <ChevronDown size={12} />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-[#2a2e39] mx-4"></div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-5">
          <button 
            disabled={!state.cutoffTime}
            onClick={onPlayPause}
            className={`transition-all ${
              !state.cutoffTime ? 'opacity-20 cursor-not-allowed text-gray-600' : 'text-gray-300 hover:text-white'
            }`}
          >
            {state.isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>

          <button 
            disabled={!state.cutoffTime}
            onClick={onStep}
            className={`transition-all ${
              !state.cutoffTime ? 'opacity-20 cursor-not-allowed text-gray-600' : 'text-gray-300 hover:text-white'
            }`}
          >
            <SkipForward size={16} fill="currentColor" />
          </button>

          <div className="relative">
            <button 
              onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
              className="text-gray-300 hover:text-white text-[12px] font-bold px-2 py-1 rounded hover:bg-white/5 transition-colors"
            >
              {SPEED_OPTIONS.find(o => o.value === state.speed)?.label || '1x'}
            </button>
            {isSpeedMenuOpen && (
              <div 
                ref={speedMenuRef}
                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#1e222d] border border-[#363a45] rounded-md shadow-2xl py-1.5 min-w-[80px] z-[110]"
              >
                {SPEED_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { onSpeedChange(opt.value); setIsSpeedMenuOpen(false); }}
                    className="w-full flex items-center px-4 py-1.5 hover:bg-white/5 text-[11px] text-gray-300"
                  >
                    {state.speed === opt.value && <Check size={11} className="mr-2 text-[#2962ff]" strokeWidth={3} />}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-gray-300 text-[12px] font-bold uppercase tracking-wide">
            {timeframeLabel}
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#2a2e39] mx-4"></div>

        {/* Jump to End Icon */}
        <button className="text-gray-500 hover:text-gray-300 transition-colors">
           <div className="flex items-center">
             <Play size={12} fill="currentColor" />
             <div className="w-[1.5px] h-2.5 bg-current ml-px"></div>
           </div>
        </button>

        <div className="flex-1"></div>

        {/* Exit Button */}
        <button 
          onClick={onClose}
          className="p-1.5 text-[#787b86] hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ReplayToolbar;
