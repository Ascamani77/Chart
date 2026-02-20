
import React, { useRef } from 'react';
import { Check } from 'lucide-react';

export const ColorPicker: React.FC<{ color: string, onChange?: (color: string) => void }> = ({ color, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div 
      className="w-6 h-6 rounded-md border border-[#434651] cursor-pointer hover:border-gray-400 transition-colors relative overflow-hidden" 
      style={{ backgroundColor: color }}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        ref={inputRef}
        type="color" 
        value={color.startsWith('#') ? color : '#2962ff'} 
        onChange={(e) => onChange?.(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />
    </div>
  );
};

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  nested?: boolean;
  description?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label, nested = false, description }) => (
  <div className={`flex flex-col ${nested ? 'ml-8' : ''}`}>
    <div className="flex items-center space-x-3 group cursor-pointer select-none" onClick={onChange}>
      <div 
        className={`w-3.5 h-3.5 rounded-[2px] border flex items-center justify-center transition-colors shrink-0 ${checked ? 'bg-[#2962ff] border-[#2962ff]' : 'bg-transparent border-[#434651] group-hover:border-gray-400'}`}
      >
        {checked && <Check size={10} strokeWidth={4} className="text-white" />}
      </div>
      <span className="text-[11.5px] text-gray-200">{label}</span>
    </div>
    {description && <p className="ml-7 mt-0.5 text-[10px] text-[#787b86] leading-tight">{description}</p>}
  </div>
);

export const SettingSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-6 last:mb-0">
    <h3 className="text-[10px] font-bold text-[#787b86] uppercase tracking-wider mb-3">{title}</h3>
    <div className="space-y-3.5">
      {children}
    </div>
  </section>
);
