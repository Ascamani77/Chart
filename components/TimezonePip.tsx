import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, Check } from 'lucide-react';
import { TimeZone } from '../App';

interface TimezonePipProps {
  selectedTz: TimeZone;
  onSelectTz: (tz: TimeZone) => void;
  timeZones: TimeZone[];
}

const TimezonePip: React.FC<TimezonePipProps> = ({ selectedTz, onSelectTz, timeZones }) => {
  const [time, setTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: selectedTz.value
  });

  return (
    <div className="relative flex items-center">
      {/* The floating "Pip" */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center space-x-2 px-2.5 py-1.5 bg-[#1e222d]/80 backdrop-blur-md border border-[#363a45] rounded-full shadow-lg transition-all active:scale-95 hover:bg-[#2a2e39] ${
          isOpen ? 'bg-[#2a2e39] border-[#2962ff] ring-1 ring-[#2962ff]/30' : ''
        }`}
      >
        <span className="font-mono text-[10px] font-bold text-gray-200 group-hover:text-white tabular-nums tracking-tight">
          {formattedTime} <span className="text-gray-400 font-normal">{selectedTz.offsetLabel || selectedTz.label}</span>
        </span>
        <ChevronUp 
          size={12} 
          className={`text-gray-400 group-hover:text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropup Menu */}
      {isOpen && (
        <div 
          ref={menuRef}
          className="absolute bottom-full mb-2 right-0 bg-[#1c1c1c] border border-[#363a45] rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-1 min-w-[200px] z-[500] animate-in slide-in-from-bottom-2 duration-150"
        >
          <div className="px-3 py-2 border-b border-[#2a2e39] mb-1">
             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Timezone</span>
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-hide">
            {timeZones.map((tz) => (
              <button
                key={tz.value}
                onClick={() => {
                  onSelectTz(tz);
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-4 py-2.5 text-[12px] hover:bg-white/5 text-gray-200 transition-colors group"
              >
                <div className="w-5 flex items-center shrink-0">
                  {selectedTz.value === tz.value && <Check size={14} className="text-[#2962ff]" />}
                </div>
                <span className={`flex-1 text-left truncate group-hover:text-white ${selectedTz.value === tz.value ? 'font-bold' : ''}`}>
                  {tz.label} <span className="text-gray-500 font-normal ml-1">{tz.offsetLabel}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimezonePip;