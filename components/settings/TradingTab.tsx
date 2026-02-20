
import React from 'react';
import { ChevronDown, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { ChartSettings } from '../../types';
import { Checkbox, SettingSection } from './SharedComponents';

interface TradingTabProps {
  settings: ChartSettings['trading'];
  onToggle: (key: keyof ChartSettings['trading']) => void;
  onChange: (key: keyof ChartSettings['trading'], value: any) => void;
}

const TradingTab: React.FC<TradingTabProps> = ({ settings, onToggle, onChange }) => (
  <div className="animate-in fade-in duration-200">
    <SettingSection title="General">
      <Checkbox 
        checked={settings.buySellButtons} 
        onChange={() => onToggle('buySellButtons')} 
        label="Buy/sell buttons" 
        description="Displays buy and sell buttons directly on the chart"
      />
      <div className="flex items-start space-x-2">
        <Checkbox 
          checked={settings.oneClickTrading} 
          onChange={() => onToggle('oneClickTrading')} 
          label="One-click trading" 
          description="Instantly place, edit, cancel orders or close positions"
        />
        <HelpCircle size={12} className="text-[#434651] mt-0.5" />
      </div>
      
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-3">
          <Checkbox checked={settings.executionSound} onChange={() => onToggle('executionSound')} label="Execution sound" />
          <div className="flex-1 flex items-center space-x-3 ml-6">
            {settings.executionSoundVolume > 0 ? <Volume2 size={14} className="text-gray-400" /> : <VolumeX size={14} className="text-gray-400" />}
            <input 
              type="range" 
              min="0" max="100" 
              value={settings.executionSoundVolume}
              onChange={(e) => onChange('executionSoundVolume', parseInt(e.target.value))}
              className="flex-1 h-1 bg-[#2a2e39] rounded-full appearance-none cursor-pointer accent-[#2962ff]"
            />
          </div>
        </div>
        <div className="ml-[100px] relative w-[160px]">
          <select 
            value={settings.executionSoundType}
            onChange={(e) => onChange('executionSoundType', e.target.value)}
            className="appearance-none w-full bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1.5 pr-8 text-[11px] text-white outline-none"
          >
            <option>Alarm Clock</option>
            <option>Chime</option>
            <option>Ding</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>
      <Checkbox checked={settings.rejectionNotifications} onChange={() => onToggle('rejectionNotifications')} label="Show only rejection notifications" />
    </SettingSection>

    <SettingSection title="Appearance">
      <div className="flex items-center space-x-2">
        <Checkbox checked={settings.positionsAndOrders} onChange={() => onToggle('positionsAndOrders')} label="Positions and orders" />
        <HelpCircle size={12} className="text-[#434651]" />
      </div>
      <Checkbox checked={settings.reversePositionButton} onChange={() => onToggle('reversePositionButton')} label="Reverse position button" nested description="Adds reverse button next to position" />
      <Checkbox checked={settings.projectOrder} onChange={() => onToggle('projectOrder')} label="Project order for market orders" description="Shows project order on chart" />
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox checked={settings.profitLossValue} onChange={() => onToggle('profitLossValue')} label="Profit and loss value" />
          <HelpCircle size={12} className="text-[#434651]" />
        </div>
        <div className="ml-6 space-y-3">
          <div className="flex items-center justify-between">
            <Checkbox checked={true} onChange={() => {}} label="Positions" />
            <div className="relative">
              <select value={settings.positionsMode} onChange={(e) => onChange('positionsMode', e.target.value)} className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1.5 pr-8 text-[11px] text-white outline-none min-w-[120px]">
                <option>Money</option>
                <option>Pips</option>
                <option>Percentage</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Checkbox checked={true} onChange={() => {}} label="Brackets" />
            <div className="relative">
              <select value={settings.bracketsMode} onChange={(e) => onChange('bracketsMode', e.target.value)} className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1.5 pr-8 text-[11px] text-white outline-none min-w-[120px]">
                <option>Money</option>
                <option>Pips</option>
                <option>Percentage</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox checked={settings.executionMarks} onChange={() => onToggle('executionMarks')} label="Execution marks" />
          <HelpCircle size={12} className="text-[#434651]" />
        </div>
        <Checkbox checked={settings.executionLabels} onChange={() => onToggle('executionLabels')} label="Execution labels" nested />
      </div>

      <Checkbox checked={settings.extendedPriceLines} onChange={() => onToggle('extendedPriceLines')} label="Extended price lines" />

      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-gray-200">Alignment</span>
        <div className="relative">
          <select value={settings.alignment} onChange={(e) => onChange('alignment', e.target.value)} className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1.5 pr-8 text-[11px] text-white outline-none min-w-[120px]">
            <option>Right</option>
            <option>Left</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <Checkbox checked={settings.screenshotVisibility} onChange={() => onToggle('screenshotVisibility')} label="In screenshots" description="Shows trades on chart in screenshots" />
    </SettingSection>
  </div>
);

export default TradingTab;
