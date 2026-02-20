
import React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { ChartSettings } from '../../types';
import { Checkbox, ColorPicker, SettingSection } from './SharedComponents';

interface EventsTabProps {
  settings: ChartSettings['events'];
  onToggle: (key: keyof ChartSettings['events']) => void;
  onChange: (key: keyof ChartSettings['events'], value: any) => void;
}

const EventsTab: React.FC<EventsTabProps> = ({ settings, onToggle, onChange }) => (
  <div className="animate-in fade-in duration-200">
    <SettingSection title="Events">
      <div className="flex items-center justify-between">
        <Checkbox checked={settings.ideas} onChange={() => onToggle('ideas')} label="Ideas" />
        <div className="flex items-center space-x-2">
           <div className="relative">
             <select 
               value={settings.ideasMode} 
               onChange={(e) => onChange('ideasMode', e.target.value)}
               className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1.5 pr-8 text-[11px] text-white outline-none min-w-[120px]"
             >
               <option>All ideas</option>
             </select>
             <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
           </div>
           <HelpCircle size={12} className="text-[#434651]" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Checkbox checked={settings.sessionBreaks} onChange={() => onToggle('sessionBreaks')} label="Session breaks" />
        <div className="flex items-center space-x-2">
          <ColorPicker color="#42a5f5" />
          <div className="w-9 h-5 border border-[#434651] rounded bg-[#1e222d] flex items-center justify-center">
             <div className="w-5 h-[1px] bg-white opacity-40"></div>
          </div>
        </div>
      </div>

      <Checkbox checked={settings.economicEvents} onChange={() => onToggle('economicEvents')} label="Economic events" />

      <div className="ml-6 space-y-4">
        <Checkbox checked={settings.onlyFutureEvents} onChange={() => onToggle('onlyFutureEvents')} label="Only future events" />
        <div className="flex items-center justify-between">
          <Checkbox checked={settings.eventsBreaks} onChange={() => onToggle('eventsBreaks')} label="Events breaks" />
          <div className="flex items-center space-x-2">
            <ColorPicker color="#363a45" />
            <div className="w-9 h-5 border border-[#434651] rounded bg-[#1e222d] flex items-center justify-center">
               <div className="w-5 h-[1px] bg-white opacity-40"></div>
            </div>
          </div>
        </div>
      </div>

      <Checkbox checked={settings.latestNews} onChange={() => onToggle('latestNews')} label="Latest news" />
      <Checkbox checked={settings.newsNotification} onChange={() => onToggle('newsNotification')} label="News notification" />
    </SettingSection>
  </div>
);

export default EventsTab;
