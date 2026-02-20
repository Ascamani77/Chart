
import React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { ChartSettings } from '../../types';
import { Checkbox, SettingSection } from './SharedComponents';

interface ScalesTabProps {
  settings: ChartSettings['scales'];
  onToggle: (key: keyof ChartSettings['scales']) => void;
  onChange: (key: keyof ChartSettings['scales'], value: any) => void;
}

const ScalesTab: React.FC<ScalesTabProps> = ({ settings, onToggle, onChange }) => (
  <div className="animate-in fade-in duration-200">
    <SettingSection title="Price Scale">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-gray-200">Currency and Unit</span>
        <div className="relative group">
          <select 
            value={settings.currencyAndUnit}
            onChange={(e) => onChange('currencyAndUnit', e.target.value)}
            className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1.5 pr-8 text-[11px] text-white outline-none focus:border-gray-500 min-w-[140px] cursor-pointer"
          >
            <option>Always visible</option>
            <option>Hidden</option>
            <option>Visible on mouse over</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-gray-200">Scale modes (A and L)</span>
        <div className="relative group">
          <select 
            value={settings.scaleModes}
            onChange={(e) => onChange('scaleModes', e.target.value)}
            className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1.5 pr-8 text-[11px] text-white outline-none focus:border-gray-500 min-w-[140px] cursor-pointer"
          >
            <option>Visible on mouse over</option>
            <option>Always visible</option>
            <option>Hidden</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Checkbox checked={settings.lockRatio} onChange={() => onToggle('lockRatio')} label="Lock price to bar ratio" />
        <div className="flex-1"></div>
        <input 
          type="text" 
          value={settings.lockRatioValue}
          onChange={(e) => onChange('lockRatioValue', e.target.value)}
          className="bg-[#2a2e39] border border-[#363a45] rounded px-2 py-1 text-[11px] text-gray-200 outline-none w-28 focus:border-gray-500 font-mono"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-gray-200">Scales placement</span>
        <div className="relative group">
          <select 
            value={settings.placement}
            onChange={(e) => onChange('placement', e.target.value)}
            className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1.5 pr-8 text-[11px] text-white outline-none focus:border-gray-500 min-w-[140px] cursor-pointer"
          >
            <option>Auto</option>
            <option>Left</option>
            <option>Right</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>
    </SettingSection>

    <SettingSection title="Price Labels & Lines">
      <Checkbox checked={settings.noOverlappingLabels} onChange={() => onToggle('noOverlappingLabels')} label="No overlapping labels" />
      <div className="flex items-center space-x-2">
        <Checkbox checked={settings.plusButton} onChange={() => onToggle('plusButton')} label="Plus button" />
        <HelpCircle size={12} className="text-[#434651]" />
      </div>
      <Checkbox checked={settings.countdown} onChange={() => onToggle('countdown')} label="Countdown to bar close" />

      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-gray-200">Symbol</span>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select 
              value={settings.symbolLabel}
              onChange={(e) => onChange('symbolLabel', e.target.value)}
              className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1.5 pr-8 text-[11px] text-white outline-none focus:border-gray-500 min-w-[140px] cursor-pointer"
            >
              <option>Name, value, line</option>
              <option>Ticker</option>
              <option>None</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>
    </SettingSection>
  </div>
);

export default ScalesTab;
