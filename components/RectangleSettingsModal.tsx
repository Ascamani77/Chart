
import React, { useState } from 'react';
import { X, Pencil, ChevronDown, Bold, Italic } from 'lucide-react';
import { Drawing } from '../types';

interface RectangleSettingsModalProps {
  drawing: Drawing;
  onClose: () => void;
  onUpdate: (updates: Partial<Drawing>) => void;
}

const RectangleSettingsModal: React.FC<RectangleSettingsModalProps> = ({ drawing, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'Style' | 'Text' | 'Coordinates' | 'Visibility'>('Text');
  const [text, setText] = useState(drawing.text || '');
  const [color, setColor] = useState(drawing.color);

  const colors = [
    { hex: '#2962ff', label: 'Blue' },
    { hex: '#f23645', label: 'Red' },
    { hex: '#ff9800', label: 'Orange' },
    { hex: '#089981', label: 'Green' },
    { hex: '#9c27b0', label: 'Purple' }
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
      <div className="bg-[#1e222d] w-[380px] rounded-lg shadow-2xl border border-[#363a45] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <div className="flex items-center space-x-2">
            <h2 className="text-[20px] font-bold text-gray-100 tracking-tight">Rectangle</h2>
            <Pencil size={16} className="text-gray-400 cursor-pointer hover:text-white" />
          </div>
          <button onClick={onClose} className="text-[#787b86] hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 flex border-b border-[#2a2e39] space-x-6 relative shrink-0">
          {['Style', 'Text', 'Coordinates', 'Visibility'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`relative pb-2 text-[14px] font-bold transition-colors ${
                activeTab === tab ? 'text-white' : 'text-[#787b86] hover:text-gray-300'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 min-h-[280px]">
          {activeTab === 'Text' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative group">
                  <div 
                    className="w-8 h-8 rounded border border-[#434651] cursor-pointer" 
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      const nextIdx = (colors.findIndex(c => c.hex === color) + 1) % colors.length;
                      setColor(colors[nextIdx].hex);
                    }}
                  />
                </div>
                
                <div className="relative flex-1 max-w-[100px]">
                  <div className="bg-[#131722] border border-[#363a45] rounded px-3 py-1.5 flex items-center justify-between cursor-pointer hover:border-gray-500">
                    <span className="text-[13px] text-white">22</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </div>
                </div>

                <button className="w-9 h-9 flex items-center justify-center rounded border border-[#363a45] text-white hover:bg-white/5">
                  <Bold size={16} />
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded border border-[#363a45] text-white hover:bg-white/5 font-serif italic">
                  <span className="italic">I</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add text"
                  className="w-full h-32 bg-transparent border border-[#2962ff] rounded-lg p-3 text-[14px] text-white outline-none resize-none focus:ring-1 focus:ring-[#2962ff]/30 transition-all"
                />
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <span className="text-[14px] text-gray-300">Text alignment</span>
                <div className="flex space-x-2 flex-1">
                   <div className="flex-1 bg-[#131722] border border-[#363a45] rounded px-3 py-1.5 flex items-center justify-between cursor-pointer hover:border-gray-500">
                      <span className="text-[13px] text-white">Inside</span>
                      <ChevronDown size={14} className="text-gray-400" />
                   </div>
                   <div className="flex-1 bg-[#131722] border border-[#363a45] rounded px-3 py-1.5 flex items-center justify-between cursor-pointer hover:border-gray-500">
                      <span className="text-[13px] text-white">Center</span>
                      <ChevronDown size={14} className="text-gray-400" />
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Style' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-gray-300">Background</span>
                <div className="flex space-x-2">
                  {colors.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setColor(c.hex)}
                      className={`w-6 h-6 rounded-full border border-white/10 transition-all ${
                        color === c.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1e222d] scale-110' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-gray-300">Border</span>
                <div className="w-12 h-6 bg-white/10 rounded border border-[#434651]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#2a2e39] flex items-center justify-between bg-[#1e222d] shrink-0">
          <div className="relative">
            <button className="flex items-center space-x-2 px-3 py-1.5 border border-[#363a45] rounded text-[13px] text-gray-200 hover:bg-white/5 transition-colors">
              <span>Template</span>
              <ChevronDown size={14} className="text-gray-500" />
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={onClose}
              className="px-5 py-1.5 text-[14px] font-bold text-white bg-transparent border border-[#434651] rounded hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onUpdate({ text, color });
                onClose();
              }}
              className="px-6 py-1.5 text-[14px] font-bold text-black bg-white rounded hover:bg-gray-200 transition-colors"
            >
              Ok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RectangleSettingsModal;
