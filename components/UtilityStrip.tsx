
import React from 'react';
import { 
  Activity, Bell, Database, Sparkles, Calendar, Lightbulb, 
  MessageSquare, MessageCircle, Newspaper, Layers, LayoutGrid, HelpCircle, Maximize2 
} from 'lucide-react';

interface Utility {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface UtilityStripProps {
  activeUtility: string | null;
  isExpanded: boolean;
  onUtilityClick: (id: string) => void;
  onToggleExpand: () => void;
}

export const utilities: Utility[] = [
  { id: 'watchlist', icon: <Activity size={20} />, label: 'Watchlist' },
  { id: 'alerts', icon: <Bell size={20} />, label: 'Alerts' },
  { id: 'data', icon: <Database size={20} />, label: 'Data Window' },
  { id: 'hotlist', icon: <Sparkles size={20} />, label: 'Hotlists' },
  { id: 'calendar', icon: <Calendar size={20} />, label: 'Calendar' },
  { id: 'ideas', icon: <Lightbulb size={20} />, label: 'My Ideas' },
  { id: 'chats_public', icon: <MessageSquare size={20} />, label: 'Public Chats' },
  { id: 'chats_private', icon: <MessageCircle size={20} />, label: 'Private Chats' },
  { id: 'idea_stream', icon: <Newspaper size={20} />, label: 'Idea Stream' },
  { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications' },
  { id: 'order_panel', icon: <LayoutGrid size={20} />, label: 'Order Panel' },
  { id: 'dom', icon: <Layers size={20} />, label: 'DOM' },
  { id: 'object_tree', icon: <LayoutGrid size={20} />, label: 'Object Tree' },
];

const UtilityStrip: React.FC<UtilityStripProps> = ({ activeUtility, isExpanded, onUtilityClick, onToggleExpand }) => {
  return (
    <div className="w-[56px] flex flex-col items-center py-2 border-l-[4px] border-[#333333] bg-[#0c0c0d] space-y-0.5 shrink-0 z-20 px-0 h-full overflow-y-auto scrollbar-hide shadow-sm">
      {utilities.map((util) => (
        <div key={util.id} className="relative group shrink-0">
          <button
            onClick={() => onUtilityClick(util.id)}
            className={`w-10 h-10 flex items-center justify-center rounded transition-all active:scale-90
              ${activeUtility === util.id && isExpanded 
                ? 'text-white bg-white/10 shadow-sm border border-white/5' 
                : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
            title={util.label}
          >
            {util.icon}
            {util.id === 'notifications' && (
              <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#ff5252] text-white text-[8px] flex items-center justify-center rounded-full font-bold border border-[#1e1e1e]">
                16
              </div>
            )}
          </button>
          <div className="absolute right-full mr-3 px-3 py-1.5 bg-[#1e222d] text-white text-[11px] font-medium whitespace-nowrap rounded shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-[#333333] hidden lg:block">
            {util.label}
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-[#1e222d] rotate-45 border-r border-t border-[#333333]"></div>
          </div>
        </div>
      ))}
      <div className="flex-1 min-h-[40px]"></div>
      <button 
        onClick={onToggleExpand}
        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0" 
        title="Hide right panel"
      >
        <Maximize2 size={24} />
      </button>
      <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors mb-4 shrink-0" title="Help">
        <HelpCircle size={20} />
      </button>
    </div>
  );
};

export default UtilityStrip;
