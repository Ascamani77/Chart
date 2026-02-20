
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ChartSettings } from '../../types';
import { Checkbox, ColorPicker, SettingSection } from './SharedComponents';

interface SymbolTabProps {
  settings: ChartSettings['symbol'];
  onToggle: (key: keyof ChartSettings['symbol']) => void;
  onChange: (key: keyof ChartSettings['symbol'], value: any) => void;
}

const SymbolTab: React.FC<SymbolTabProps> = ({ settings, onToggle, onChange }) => (
  <div className="animate-in fade-in duration-200">
    <SettingSection title="Candles">
      <div className="flex items-center justify-between">
        <Checkbox checked={settings.barColorer} onChange={() => onToggle('barColorer')} label="Body" />
        <div className="flex space-x-2">
          <ColorPicker color={settings.upColor} onChange={(val) => onChange('upColor', val)} />
          <ColorPicker color={settings.downColor} onChange={(val) => onChange('downColor', val)} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Checkbox checked={settings.borderVisible} onChange={() => onToggle('borderVisible')} label="Borders" />
        <div className="flex space-x-2">
          <ColorPicker color={settings.upColor} onChange={(val) => onChange('upColor', val)} />
          <ColorPicker color={settings.downColor} onChange={(val) => onChange('downColor', val)} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Checkbox checked={settings.wickVisible} onChange={() => onToggle('wickVisible')} label="Wick" />
        <div className="flex space-x-2">
          <ColorPicker color={settings.upColor} onChange={(val) => onChange('upColor', val)} />
          <ColorPicker color={settings.downColor} onChange={(val) => onChange('downColor', val)} />
        </div>
      </div>
    </SettingSection>

    <SettingSection title="Data Modification">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-gray-200">Precision</span>
        <div className="relative">
          <select 
            value={settings.precision}
            onChange={(e) => onChange('precision', e.target.value)}
            className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1.5 pr-8 text-[11px] text-white outline-none focus:border-gray-500 min-w-[140px] cursor-pointer"
          >
            <option>Default</option>
            <option>1/100</option>
            <option>1/1000</option>
            <option>1/10000</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-gray-200">Timezone</span>
        <div className="relative">
          <select 
            value={settings.timezone}
            onChange={(e) => onChange('timezone', e.target.value)}
            className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1.5 pr-8 text-[11px] text-white outline-none focus:border-gray-500 min-w-[140px] cursor-pointer"
          >
            <option>(UTC-8) Los Angeles</option>
            <option>(UTC-5) New York</option>
            <option>(UTC+0) London</option>
            <option>(UTC+1) Berlin</option>
            <option>(UTC+8) Hong Kong</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>
    </SettingSection>
  </div>
);

export default SymbolTab;
