
import React from 'react';
import { Play, Save, Share2, ChevronDown, MoreHorizontal, FileCode, Search, Settings } from 'lucide-react';

const PineEditor: React.FC = () => {
  const dummyCode = [
    { line: 1, text: '// @version=5', type: 'comment' },
    { line: 2, text: 'indicator("My Custom Script", overlay=true)', type: 'function' },
    { line: 3, text: '', type: 'text' },
    { line: 4, text: 'length = input.int(14, "Length", minval=1)', type: 'keyword' },
    { line: 5, text: 'src = close', type: 'keyword' },
    { line: 6, text: '', type: 'text' },
    { line: 7, text: 'rma(src, len) =>', type: 'function' },
    { line: 8, text: '    alpha = 1/len', type: 'text' },
    { line: 9, text: '    sum = 0.0', type: 'text' },
    { line: 10, text: '    sum := alpha * src + (1 - alpha) * nz(sum[1])', type: 'text' },
    { line: 11, text: '', type: 'text' },
    { line: 12, text: 'rsi_val = rma(math.max(src - src[1], 0), length) / rma(math.abs(src - src[1]), length) * 100', type: 'text' },
    { line: 13, text: '', type: 'text' },
    { line: 14, text: 'plot(rsi_val, "RSI", color=color.purple)', type: 'function' },
    { line: 15, text: 'hline(70, "Overbought", color=color.red)', type: 'function' },
    { line: 16, text: 'hline(30, "Oversold", color=color.green)', type: 'function' },
  ];

  const getLineStyle = (type: string) => {
    switch (type) {
      case 'comment': return 'text-[#787b86] italic';
      case 'function': return 'text-[#2962ff] font-semibold';
      case 'keyword': return 'text-[#ff9800]';
      default: return 'text-[#d1d4dc]';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-t border-[#434651] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Editor Toolbar */}
      <div className="h-9 flex items-center justify-between px-2 border-b border-[#2a2e39] bg-[#1e1e1e] shrink-0">
        <div className="flex items-center space-x-1 h-full">
          <div className="flex items-center px-2 py-1 space-x-2 hover:bg-white/5 rounded cursor-pointer group transition-colors">
            <FileCode size={14} className="text-[#787b86] group-hover:text-white" />
            <span className="text-[12px] font-bold text-gray-200 group-hover:text-white">My Custom Script</span>
            <ChevronDown size={12} className="text-[#787b86]" />
          </div>
          <div className="h-4 w-px bg-[#434651] mx-1"></div>
          <button className="flex items-center space-x-1.5 px-3 h-7 text-[12px] font-bold text-gray-200 hover:bg-white/5 rounded transition-colors">
            <Save size={14} />
            <span>Save</span>
          </button>
          <div className="relative group">
            <button className="flex items-center space-x-1 px-2 h-7 text-[12px] font-bold text-[#2962ff] hover:bg-[#2962ff]/10 rounded transition-colors">
              <span>Add to chart</span>
              <ChevronDown size={12} />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors" title="Search">
            <Search size={14} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors" title="Settings">
            <Settings size={14} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors" title="More">
            <MoreHorizontal size={14} />
          </button>
          <div className="h-4 w-px bg-[#434651] mx-1"></div>
          <button className="flex items-center space-x-1.5 px-4 h-7 text-[12px] font-bold text-white bg-[#2962ff] hover:bg-[#1e4bd8] rounded transition-all shadow-sm">
            <Share2 size={14} />
            <span>Publish script</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers gutter */}
        <div className="w-12 bg-[#131722] border-r border-[#2a2e39] flex flex-col items-end py-2 pr-3 select-none">
          {dummyCode.map(line => (
            <span key={line.line} className="text-[12px] font-mono text-[#434651] h-5 leading-5">{line.line}</span>
          ))}
        </div>
        {/* Code View */}
        <div className="flex-1 bg-[#131722] overflow-auto p-2 font-mono text-[13px] leading-5 scrollbar-hide">
          {dummyCode.map(line => (
            <div key={line.line} className="flex h-5 whitespace-pre group hover:bg-white/5 px-2">
              <span className={getLineStyle(line.type)}>{line.text}</span>
            </div>
          ))}
          {/* Mock cursor */}
          <div className="flex h-5 px-2">
            <div className="w-[1px] h-full bg-[#2962ff] animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Editor Status Bar */}
      <div className="h-6 bg-[#1e1e1e] border-t border-[#2a2e39] flex items-center justify-between px-3 text-[10px] text-[#787b86] shrink-0">
        <div className="flex items-center space-x-4">
          <span className="hover:text-white cursor-pointer">Pine Script v5</span>
          <div className="flex items-center space-x-1">
             <div className="w-1.5 h-1.5 rounded-full bg-[#00e676]"></div>
             <span>Ready</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span>Ln 17, Col 1</span>
          <span>Spaces: 4</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};

export default PineEditor;
