
import React from 'react';
import { 
  Cloud, 
  Download, 
  List, 
  Bell, 
  Network, 
  Home, 
  HelpCircle, 
  Zap, 
  Moon, 
  Square, 
  Globe, 
  LogIn, 
  UserPlus,
  ChevronRight,
  X
} from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const MenuItem = ({ icon: Icon, label, rightElement, color = "text-[#d1d4dc]", onClick }: any) => (
    <div 
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 hover:bg-[#2a2e39] cursor-pointer transition-colors group"
    >
      <div className="flex items-center space-x-4">
        <Icon size={20} className="text-gray-400 group-hover:text-gray-200" />
        <span className={`text-[14px] font-medium ${color}`}>{label}</span>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );

  const Toggle = ({ active }: { active: boolean }) => (
    <div className={`w-9 h-5 rounded-full relative transition-colors ${active ? 'bg-[#2962ff]' : 'bg-[#434651]'}`}>
      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${active ? 'right-1' : 'left-1'}`}></div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[300] flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Menu Panel */}
      <div className="relative w-[300px] h-full bg-[#1e222d] shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 border-r border-[#363a45]">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
            {/* Section 1 */}
            <div className="pb-2">
              <MenuItem icon={Cloud} label="Save layout" />
              <MenuItem icon={Download} label="Download chart data..." />
            </div>
            <div className="h-px bg-[#2a2e39] mx-4 my-1"></div>

            {/* Section 2 */}
            <div className="py-2">
              <MenuItem icon={List} label="Watchlist & Details" />
              <MenuItem icon={Bell} label="Alerts" />
              <MenuItem icon={Network} label="Connect to broker" />
            </div>
            <div className="h-px bg-[#2a2e39] mx-4 my-1"></div>

            {/* Section 3 */}
            <div className="py-2">
              <MenuItem icon={Home} label="Home" />
              <MenuItem icon={HelpCircle} label="Help Center" />
              <MenuItem icon={Zap} label="What's new" />
            </div>
            <div className="h-px bg-[#2a2e39] mx-4 my-1"></div>

            {/* Section 4 */}
            <div className="py-2">
              <MenuItem icon={Moon} label="Dark theme" rightElement={<Toggle active={true} />} />
              <MenuItem icon={Square} label="Drawings panel" rightElement={<Toggle active={true} />} />
              <MenuItem 
                icon={Globe} 
                label="Language" 
                rightElement={
                  <div className="flex items-center space-x-1 text-gray-500 text-sm">
                    <span>English</span>
                    <ChevronRight size={14} />
                  </div>
                } 
              />
            </div>
            <div className="h-px bg-[#2a2e39] mx-4 my-1"></div>

            {/* Section 5 */}
            <div className="py-2">
              <MenuItem icon={LogIn} label="Sign in" color="text-[#2962ff]" />
              <MenuItem icon={UserPlus} label="Join now" color="text-[#2962ff]" />
            </div>
          </div>
        </div>

        {/* Close button for mobile accessibility */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-[-48px] p-2 text-white bg-[#1e222d] rounded-full lg:hidden"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

export default SideMenu;
