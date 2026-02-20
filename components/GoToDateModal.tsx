
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface GoToDateModalProps {
  onClose: () => void;
  onGoTo: (date: Date) => void;
}

const GoToDateModal: React.FC<GoToDateModalProps> = ({ onClose, onGoTo }) => {
  const [activeTab, setActiveTab] = useState<'date' | 'range'>('date');
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 12)); // Jan 12, 2026 as per screenshot
  const [viewDate, setViewDate] = useState(new Date(2026, 0, 1));
  const [time, setTime] = useState('00:00');

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust to start Monday
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === viewDate.getMonth() && 
           selectedDate.getFullYear() === viewDate.getFullYear();
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
  };

  const handleGoTo = () => {
    const [hours, minutes] = time.split(':').map(Number);
    const finalDate = new Date(selectedDate);
    finalDate.setHours(hours || 0, minutes || 0, 0, 0);
    onGoTo(finalDate);
    onClose();
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const startOffset = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = [];

    // Fill offset
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Fill days
    for (let d = 1; d <= totalDays; d++) {
      const selected = isSelected(d);
      days.push(
        <button
          key={d}
          onClick={() => handleDayClick(d)}
          className={`w-8 h-8 flex items-center justify-center text-[12px] rounded transition-colors relative
            ${selected 
              ? 'bg-white text-black font-bold z-10' 
              : 'text-gray-300 hover:bg-[#2a2e39] hover:text-white'
            }`}
        >
          {d}
          {selected && (
             <div className="absolute bottom-1 w-3 h-0.5 bg-black rounded-full"></div>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
      <div className="bg-[#1e1e1e] w-[290px] rounded-lg shadow-2xl border border-[#363a45] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-[16px] font-bold text-gray-100">Go to</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 flex border-b border-[#363a45] space-x-4 relative">
          <button 
            onClick={() => setActiveTab('date')}
            className={`pb-1.5 text-[13px] font-bold transition-colors ${activeTab === 'date' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Date
          </button>
          <button 
            onClick={() => setActiveTab('range')}
            className={`pb-1.5 text-[13px] font-bold transition-colors ${activeTab === 'range' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Custom range
          </button>
          {/* Animated Indicator */}
          <div 
            className={`absolute bottom-0 h-0.5 bg-gray-300 transition-all duration-300 rounded-full`}
            style={{ 
              width: activeTab === 'date' ? '30px' : '90px',
              left: activeTab === 'date' ? '16px' : '62px'
            }}
          ></div>
        </div>

        {/* Input area */}
        <div className="p-4 space-y-3">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input 
                type="text" 
                readOnly
                value={selectedDate.toISOString().split('T')[0]}
                className="w-full bg-transparent border border-[#2962ff] rounded px-2 py-1.5 text-[13px] text-white outline-none"
              />
              <CalendarIcon size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="w-20 relative">
              <input 
                type="text" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-transparent border border-[#363a45] rounded px-2 py-1.5 text-[13px] text-white outline-none focus:border-[#2962ff] transition-colors"
              />
              <Clock size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Calendar View */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <button onClick={handlePrevMonth} className="text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={18} />
              </button>
              <span className="text-[13px] font-bold text-gray-100">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button onClick={handleNextMonth} className="text-gray-400 hover:text-white transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-0.5 text-center">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="text-[10px] font-bold text-gray-500 py-1 uppercase">{day}</div>
              ))}
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-[#363a45] flex justify-end space-x-2 bg-[#1e1e1e]">
          <button 
            onClick={onClose}
            className="px-4 py-1.5 text-[13px] font-bold text-white bg-transparent border border-[#434651] rounded hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleGoTo}
            className="px-5 py-1.5 text-[13px] font-bold text-black bg-white rounded hover:bg-gray-200 transition-colors"
          >
            Go to
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoToDateModal;
