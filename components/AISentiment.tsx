
import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface AISentimentProps {
  analysisContent?: string | null;
  isAnalyzing?: boolean;
  onRefreshAnalysis?: () => void;
}

const AISentiment: React.FC<AISentimentProps> = ({ analysisContent, isAnalyzing, onRefreshAnalysis }) => {
  return (
    <div className="shrink-0 bg-black border-t border-[#434651] p-3 shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Sparkles size={12} className="text-blue-400" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">AI Sentiment</span>
        </div>
        <button 
          onClick={onRefreshAnalysis} 
          className="text-gray-400 hover:text-blue-400 transition-colors p-1"
          title="Refresh Analysis"
        >
          <RefreshCw size={12} className={isAnalyzing ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="text-[11px] text-gray-300 leading-relaxed bg-[#0a0a0a] p-2.5 rounded border border-[#434651] max-h-[140px] overflow-y-auto">
        {isAnalyzing ? (
          <div className="flex items-center space-x-2 text-blue-400">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="font-medium">Analyzing...</span>
          </div>
        ) : (
          <div className="prose prose-invert prose-xs">
            {analysisContent || "Select a ticker to see AI analysis."}
          </div>
        )}
      </div>
    </div>
  );
};

export default AISentiment;
