
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ChartSettings } from '../../types';
import { ColorPicker, SettingSection, Checkbox } from './SharedComponents';

interface CanvasTabProps {
  settings: ChartSettings['canvas'];
  onToggle: (key: keyof ChartSettings['canvas']) => void;
  onChange: (key: keyof ChartSettings['canvas'], value: any) => void;
}

const CanvasTab: React.FC<CanvasTabProps> = ({ settings, onToggle, onChange }) => (
  <div className="animate-in fade-in duration-200">
    <SettingSection title="Chart Basic Styles">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-gray-200">Background</span>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select 
              value={settings.backgroundType}
              onChange={(e) => onChange('backgroundType', e.target.value)}
              className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1 pr-7 text-[11px] text-white outline-none min-w-[100px]"
            >
              <option>Gradient</option>
              <option>Solid</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          <ColorPicker color={settings.background} onChange={(c) => onChange('background', c)} />
          {settings.backgroundType === 'Gradient' && <ColorPicker color={settings.backgroundGradientEnd} onChange={(c) => onChange('backgroundGradientEnd', c)} />}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Checkbox checked={settings.gridVisible} onChange={() => onToggle('gridVisible')} label="Grid lines" />
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select 
              value={settings.gridType}
              onChange={(e) => onChange('gridType', e.target.value)}
              className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1 pr-7 text-[11px] text-white outline-none min-w-[100px]"
            >
              <option>Vert and horz</option>
              <option>Vertical</option>
              <option>Horizontal</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          <ColorPicker color={settings.gridColor} onChange={(c) => onChange('gridColor', c)} />
          <ColorPicker color={settings.horzGridColor} onChange={(c) => onChange('horzGridColor', c)} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-gray-200">Crosshair</span>
        <div className="flex items-center space-x-2">
          <ColorPicker color={settings.crosshairColor} onChange={(c) => onChange('crosshairColor', c)} />
          <div className="relative">
            <select 
              value={settings.crosshairStyle}
              onChange={(e) => onChange('crosshairStyle', parseInt(e.target.value))}
              className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1 pr-7 text-[11px] text-white outline-none min-w-[70px]"
            >
              <option value={1}>----</option>
              <option value={0}>____</option>
              <option value={2}>....</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Checkbox checked={settings.watermarkVisible} onChange={() => onToggle('watermarkVisible')} label="Watermark" />
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select 
              value={settings.watermarkType}
              onChange={(e) => onChange('watermarkType', e.target.value)}
              className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1 pr-7 text-[11px] text-white outline-none min-w-[100px]"
            >
              <option>Replay mode</option>
              <option>Hidden</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          <ColorPicker color={settings.watermarkColor} onChange={(c) => onChange('watermarkColor', c)} />
        </div>
      </div>
    </SettingSection>

    <SettingSection title="Scales">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-gray-200">Text</span>
        <div className="flex items-center space-x-2">
          <ColorPicker color={settings.scaleTextColor} onChange={(c) => onChange('scaleTextColor', c)} />
          <div className="relative">
            <select 
              value={settings.scaleFontSize}
              onChange={(e) => onChange('scaleFontSize', parseInt(e.target.value))}
              className="appearance-none bg-[#1e222d] border border-[#363a45] rounded-md px-2 py-1 pr-7 text-[11px] text-white outline-none min-w-[70px]"
            >
              <option value={10}>10</option>
              <option value={11}>11</option>
              <option value={12}>12</option>
              <option value={14}>14</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-gray-200">Lines</span>
        <ColorPicker color={settings.scaleLineColor} onChange={(c) => onChange('scaleLineColor', c)} />
      </div>
    </SettingSection>

    <SettingSection title="Margins">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-gray-200">Top</span>
        <div className="flex items-center space-x-2">
          <input 
            type="number" 
            value={settings.marginTop} 
            onChange={(e) => onChange('marginTop', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
            className="w-14 bg-[#1e222d] border border-[#363a45] rounded px-2 py-1 text-[11px] text-white outline-none focus:border-gray-500" 
          />
          <span className="text-[11px] text-gray-500">%</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-gray-200">Bottom</span>
        <div className="flex items-center space-x-2">
          <input 
            type="number" 
            value={settings.marginBottom} 
            onChange={(e) => onChange('marginBottom', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
            className="w-14 bg-[#1e222d] border border-[#363a45] rounded px-2 py-1 text-[11px] text-white outline-none focus:border-gray-500" 
          />
          <span className="text-[11px] text-gray-500">%</span>
        </div>
      </div>
    </SettingSection>
  </div>
);

export default CanvasTab;
