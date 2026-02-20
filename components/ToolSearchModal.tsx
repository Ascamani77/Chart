
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  Star, 
  TrendingUp, 
  Type, 
  MoveHorizontal, 
  MoveVertical, 
  Hash, 
  PenTool, 
  Shapes, 
  Triangle, 
  Network, 
  Waves, 
  LayoutTemplate, 
  Activity, 
  Smile, 
  Ruler, 
  Lock, 
  Eye, 
  Trash2, 
  ArrowLeftToLine 
} from 'lucide-react';
import { ToolType } from '../icons/toolTypes';

interface ToolSearchModalProps {
  onClose: () => void;
  onSelectTool: (tool: ToolType) => void;
}

interface ToolItem {
  id: ToolType;
  name: string;
  icon: React.ElementType;
}

const ALL_TOOLS: ToolItem[] = [
  { id: 'trendline', name: 'Trend Line', icon: TrendingUp },
  { id: 'ray', name: 'Ray', icon: TrendingUp },
  { id: 'horizontal_line', name: 'Horizontal Line', icon: MoveHorizontal },
  { id: 'vertical_line', name: 'Vertical Line', icon: MoveVertical },
  { id: 'cross_line', name: 'Cross Line', icon: PlusIcon },
  { id: 'fib' as ToolType, name: 'Fib Retracement', icon: Hash },
  { id: 'brush', name: 'Brush', icon: PenTool },
  { id: 'shapes' as ToolType, name: 'Geometric Shapes', icon: Shapes },
  { id: 'text' as ToolType, name: 'Text', icon: Type },
  { id: 'patterns' as ToolType, name: 'Patterns', icon: Triangle },
  { id: 'elliott' as ToolType, name: 'Elliott Wave', icon: Network },
  { id: 'cycles' as ToolType, name: 'Cycles', icon: Waves },
  { id: 'long_position', name: 'Long Position', icon: LayoutTemplate },
  { id: 'short_position', name: 'Short Position', icon: LayoutTemplate },
  { id: 'info' as ToolType, name: 'Price Range', icon: Activity },
  { id: 'date_range', name: 'Date Range', icon: ArrowLeftToLine },
  { id: 'icons' as ToolType, name: 'Icons', icon: Smile },
  { id: 'measure', name: 'Measure', icon: Ruler },
  { id: 'zoom', name: 'Zoom', icon: Search },
  { id: 'magnet' as ToolType, name: 'Magnet Mode', icon: Lock },
  { id: 'lock' as ToolType, name: 'Lock All Drawings', icon: Lock },
  { id: 'hide' as ToolType, name: 'Hide All Drawings', icon: Eye },
  { id: 'clear_drawings', name: 'Remove Drawings', icon: Trash2 },
];

function PlusIcon(props: any) {
  return (
    <svg 
      {...props}
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

const ToolSearchModal: React.FC<ToolSearchModalProps> = ({ onClose, onSelectTool }) => {
  const [query, setQuery] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const filteredTools = useMemo(() => {
    if (!query.trim()) return [];
    return ALL_TOOLS.filter(tool => 
      tool.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const recentSearch = ALL_TOOLS.filter(t => t.id === 'date_range' || t.id === 'trendline');

  return (
    <div className="fixed inset-0 z-[2500] flex items-start justify-center pt-24 bg-black/40 backdrop-blur-[1px]">
      <div 
        ref={modalRef}
        className="bg-[#1c1c1c] w-full max-w-[420px] rounded-lg shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-[#363a45] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#363a45]">
          <h2 className="text-[16px] font-bold text-gray-100 tracking-tight">Search tool or function</h2>
          <button onClick={onClose} className="text-[#787b86] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Input Area */}
        <div className="px-4 py-3 flex items-center border-b border-[#363a45] bg-[#0c0c0d]/50">
          <Search size={18} className="text-gray-500 mr-3" />
          <input 
            autoFocus
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-white placeholder-gray-600 font-medium"
          />
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto max-h-[360px] scrollbar-hide">
          {query.trim() === '' ? (
            <div className="py-2">
              <div className="px-4 py-2 text-[10px] font-bold text-[#787b86] uppercase tracking-wider">
                Recent Search
              </div>
              {recentSearch.map((tool) => (
                <div 
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className="flex items-center px-4 py-3 hover:bg-white/5 cursor-pointer group transition-colors"
                >
                  <Star size={14} className="text-gray-600 mr-3 group-hover:text-yellow-500 transition-colors" />
                  <div className="flex items-center space-x-3">
                    <tool.icon size={16} className="text-gray-300 group-hover:text-white" />
                    <span className="text-[13px] font-medium text-gray-200 group-hover:text-white">{tool.name}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <div 
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    className="flex items-center px-4 py-3 hover:bg-white/5 cursor-pointer group transition-colors"
                  >
                    <div className="w-10 flex items-center justify-center shrink-0">
                      <tool.icon size={18} className="text-gray-400 group-hover:text-white" />
                    </div>
                    <span className="text-[14px] font-medium text-gray-200 group-hover:text-white">{tool.name}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500 text-[13px] italic">
                  No tools found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolSearchModal;
