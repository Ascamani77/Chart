
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ChartSettings } from '../../types';
import { Checkbox, SettingSection } from './SharedComponents';

interface StatusLineTabProps {
  settings: ChartSettings['statusLine'];
  onToggle: (key: keyof ChartSettings['statusLine']) => void;
  onChange: (key: keyof ChartSettings['statusLine'], value: any) => void;
}

const StatusLineTab: React.FC<StatusLineTabProps> = ({ settings, onToggle, onChange }) => (
  <div className="animate-in fade-in duration-200">
    <SettingSection title="Symbol">
      <Checkbox checked={settings.logo} onChange={() => onToggle('logo')} label="Logo" />
      <div className="flex items-center justify-between">
        <Checkbox checked={settings.symbol} onChange={() => onToggle('symbol')} label="Title" />
        <div className="relative">
          <select
            value={settings.titleMode}
            onChange={(e) => onChange('titleMode', e.target.value)}
            className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1.5 pr-8 text-[11px] text-white outline-none min-w-[120px]"
          >
            <option>Description</option>
            <option>Ticker</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>
      <Checkbox checked={settings.openMarketStatus} onChange={() => onToggle('openMarketStatus')} label="Open market status" />
      <Checkbox checked={settings.ohlc} onChange={() => onToggle('ohlc')} label="Chart values" />
      <div className="flex items-center space-x-4">
        <Checkbox checked={!!settings.showLastPrice} onChange={() => onToggle('showLastPrice' as any)} label="Show last price" />
        <Checkbox checked={!!settings.showAskPrice} onChange={() => onToggle('showAskPrice' as any)} label="Show ask price" />
      </div>
      <Checkbox checked={settings.barChangeValues} onChange={() => onToggle('barChangeValues')} label="Bar change values" />
      <Checkbox checked={settings.volume} onChange={() => onToggle('volume')} label="Volume" />
      <Checkbox checked={settings.lastDayChange} onChange={() => onToggle('lastDayChange')} label="Last day change values" />
    </SettingSection>

    <SettingSection title="Indicators">
      <Checkbox checked={settings.indicatorTitles} onChange={() => onToggle('indicatorTitles')} label="Titles" />
      <Checkbox checked={settings.indicatorInputs} onChange={() => onToggle('indicatorInputs')} label="Inputs" nested />
      <Checkbox checked={settings.indicatorValues} onChange={() => onToggle('indicatorValues')} label="Values" />
      <div className="flex items-center space-x-4">
        <Checkbox checked={settings.indicatorBackground} onChange={() => onToggle('indicatorBackground')} label="Background" />
        <div className="flex-1 h-1.5 bg-[#2a2e39] rounded-full relative group">
          <div
            className="absolute h-full bg-gradient-to-r from-blue-900 to-blue-500 rounded-full"
            style={{ width: `${settings.indicatorBackgroundOpacity}%` }}
          ></div>
          <input
            type="range"
            min="0" max="100"
            value={settings.indicatorBackgroundOpacity}
            onChange={(e) => onChange('indicatorBackgroundOpacity', parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white bg-black shadow-lg pointer-events-none"
            style={{ left: `calc(${settings.indicatorBackgroundOpacity}% - 5px)` }}
          ></div>
        </div>
      </div>
    </SettingSection>
  </div>
);

export default StatusLineTab;
