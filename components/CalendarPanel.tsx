
import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

const CalendarPanel: React.FC = () => {
  const events = [
    { time: '14:30', impact: 'high', label: 'CPI (MoM) (Feb)' },
    { time: '16:00', impact: 'low', label: 'Business Inventories' },
    { time: '18:30', impact: 'medium', label: 'Fed Chair Powell Speech' },
  ];

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="p-3 border-b border-[#434651]/30">
        <div className="flex items-center space-x-2">
          <CalendarIcon size={14} className="text-purple-400" />
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Economic Calendar</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {events.map((event, i) => (
          <div key={i} className="p-3 border-b border-[#434651]/10 hover:bg-[#1e222d]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500 font-mono">{event.time}</span>
              <div className={`w-2 h-2 rounded-full ${event.impact === 'high' ? 'bg-red-500' : event.impact === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'}`}></div>
            </div>
            <p className="text-[11px] text-gray-200 font-medium line-clamp-1">{event.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarPanel;
