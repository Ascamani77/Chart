
import React from 'react';
import { Speaker, HelpCircle } from 'lucide-react';
import { ChartSettings } from '../../types';
import { Checkbox, SettingSection } from './SharedComponents';

interface AlertsTabProps {
  settings: ChartSettings['alerts'];
  onToggle: (key: keyof ChartSettings['alerts']) => void;
  onChange: (key: keyof ChartSettings['alerts'], value: any) => void;
}

const AlertsTab: React.FC<AlertsTabProps> = ({ settings, onToggle, onChange }) => (
  <div className="animate-in fade-in duration-200">
    <SettingSection title="Chart Line Visibility">
      <div className="flex items-center justify-between">
        <Checkbox checked={settings.alertLines} onChange={() => onToggle('alertLines')} label="Alert lines" />
        <div className="w-9 h-5 rounded-md border border-[#434651] bg-[#1e222d] relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-tr from-[#ef5350] to-[#26a69a] opacity-50"></div>
        </div>
      </div>
      <Checkbox checked={settings.onlyActiveAlerts} onChange={() => onToggle('onlyActiveAlerts')} label="Only active alerts" />
    </SettingSection>

    <SettingSection title="Notifications">
      <div className="flex items-center space-x-3">
        <Checkbox checked={settings.alertVolume} onChange={() => onToggle('alertVolume')} label="Alert volume" />
        <div className="flex-1 flex items-center space-x-3 ml-6">
          <Speaker size={14} className="text-gray-400" />
          <input 
            type="range" 
            min="0" max="100" 
            value={settings.volumeLevel}
            onChange={(e) => onChange('volumeLevel', parseInt(e.target.value))}
            className="flex-1 h-1 bg-[#2a2e39] rounded-full appearance-none cursor-pointer accent-[#2962ff]"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox checked={settings.hideToasts} onChange={() => onToggle('hideToasts')} label="Automatically hide toasts" />
        <HelpCircle size={12} className="text-[#434651]" />
      </div>
    </SettingSection>
  </div>
);

export default AlertsTab;
