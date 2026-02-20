
import React, { useState } from 'react';
import { 
  Plus, 
  ListFilter, 
  ChevronDown, 
  Activity, 
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import UtilityStrip from './UtilityStrip';
import WatchlistTable from './WatchlistTable';
import AISentiment from './AISentiment';
import AlertsPanel from './AlertsPanel';
import DataWindowPanel from './DataWindowPanel';
import HotlistPanel from './HotlistPanel';
import CalendarPanel from './CalendarPanel';
import MyIdeasPanel from './MyIdeasPanel';
import PublicChatsPanel from './PublicChatsPanel';
import PrivateChatsPanel from './PrivateChatsPanel';
import IdeaStreamPanel from './IdeaStreamPanel';
import OrderPanel from './OrderPanel';
import DOMPanel from './DOMPanel';
import ObjectTreePanel from './ObjectTreePanel';

interface RightPanelProps {
  analysisContent?: string | null;
  isAnalyzing?: boolean;
  onRefreshAnalysis?: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ analysisContent, isAnalyzing, onRefreshAnalysis }) => {
  const [activeUtility, setActiveUtility] = useState<string | null>('watchlist');
  // Both hidden by default as per user request
  const [isExpanded, setIsExpanded] = useState(false);
  const [isStripVisible, setIsStripVisible] = useState(false);

  const handleUtilityClick = (id: string) => {
    if (isExpanded && activeUtility === id) {
      setIsExpanded(false);
    } else {
      setActiveUtility(id);
      setIsExpanded(true);
    }
  };

  const handleToggleStrip = () => {
    const newState = !isStripVisible;
    setIsStripVisible(newState);
    if (!newState) {
      setIsExpanded(false);
    }
  };

  const renderActiveUtility = () => {
    switch (activeUtility) {
      case 'watchlist':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#0c0c0d]">
              <WatchlistTable />
            </div>
            <AISentiment 
              analysisContent={analysisContent} 
              isAnalyzing={isAnalyzing} 
              onRefreshAnalysis={onRefreshAnalysis} 
            />
          </div>
        );
      case 'alerts':
        return <AlertsPanel />;
      case 'data':
        return <DataWindowPanel />;
      case 'hotlist':
        return <HotlistPanel />;
      case 'calendar':
        return <CalendarPanel />;
      case 'ideas':
        return <MyIdeasPanel />;
      case 'chats_public':
        return <PublicChatsPanel />;
      case 'chats_private':
        return <PrivateChatsPanel />;
      case 'idea_stream':
        return <IdeaStreamPanel />;
      case 'order_panel':
        return <OrderPanel />;
      case 'dom':
        return <DOMPanel />;
      case 'object_tree':
        return <ObjectTreePanel />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500 space-y-4 bg-[#0c0c0d]">
            <Activity size={32} className="opacity-20" />
            <p className="text-[12px] italic">Details for {activeUtility?.replace('_', ' ')}</p>
          </div>
        );
    }
  };

  return (
    <div className="relative flex h-full shrink-0">
      {/* Content Area (Overlay Drawer) */}
      <div 
        className={`absolute top-0 right-[56px] h-full flex flex-col overflow-hidden bg-[#0c0c0d] border-l-[4px] border-[#333333] z-[70] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out
          ${isExpanded && isStripVisible
            ? 'translate-x-0 opacity-100 lg:w-[260px] md:w-[320px] w-[calc(100vw-56px)]' 
            : 'translate-x-full opacity-0 w-0 pointer-events-none'
          }`}
      >
        {/* Panel Header */}
        <div className="h-12 flex items-center justify-between px-3 border-b border-[#333333] bg-[#0c0c0d] shrink-0">
          <div className="flex items-center space-x-1 cursor-pointer hover:bg-white/5 px-1.5 py-1 rounded transition-colors group">
            <span className="text-[12px] font-bold text-white uppercase tracking-tight">
              {activeUtility === 'watchlist' ? 'Watchlist' : activeUtility?.toUpperCase().replace('_', ' ')}
            </span>
            <ChevronDown size={12} className="text-gray-400 group-hover:text-white" />
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Plus size={16} className="cursor-pointer hover:text-white transition-colors" />
            <ListFilter size={16} className="cursor-pointer hover:text-white transition-colors" />
            <button 
              onClick={() => setIsExpanded(false)} 
              className="hover:text-white transition-colors p-1"
              aria-label="Close panel"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0c0d]">
          {renderActiveUtility()}
        </div>
      </div>

      {/* Restore Sidebar Handle (Visible when completely hidden) */}
      {!isStripVisible && (
        <button 
          onClick={() => setIsStripVisible(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[80] w-6 h-16 bg-[#131722] border border-[#333333] border-r-0 rounded-l-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1e222d] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all active:scale-95 group"
          title="Show Sidebar"
        >
          <ChevronLeft size={20} className="group-hover:translate-x-[-1px] transition-transform" />
        </button>
      )}

      {/* Far Right Vertical Utility Strip (56px) */}
      <div className={`relative transition-all duration-300 h-full flex flex-col ${isStripVisible ? 'w-[56px]' : 'w-0 overflow-hidden opacity-0'}`}>
        <UtilityStrip 
          activeUtility={activeUtility} 
          isExpanded={isExpanded} 
          onUtilityClick={handleUtilityClick}
          onToggleExpand={handleToggleStrip}
        />
        
        {/* Mobile-only internal collapse button at bottom of strip */}
        <div className="absolute bottom-16 right-0 w-full flex justify-center lg:hidden">
          <button 
            onClick={() => setIsStripVisible(false)}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full"
            title="Collapse Sidebar"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
