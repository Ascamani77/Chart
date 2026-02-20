import React, { useState } from 'react';
import { Maximize2, ChevronRight, ChevronLeft } from 'lucide-react';
import { ToolType } from '../icons/toolTypes';
import CursorTool from './sidebar/CursorTool';
import TrendLineTool from './sidebar/TrendLineTool';
import FibTool from './sidebar/FibTool';
import BrushTool from './sidebar/BrushTool';
import FibFanTool from './sidebar/FibFanTool';
import RectangleTool from './sidebar/RectangleTool';
import ProjectionTool from './sidebar/ProjectionTool';
import AnchoredVwapTool from './sidebar/AnchoredVwapTool';
import TextTool from './sidebar/TextTool';
import LongShortTool from './sidebar/LongShortTool';
import IconsTool from './sidebar/IconsTool';
import MeasureTool from './sidebar/MeasureTool';
import ZoomTool from './sidebar/ZoomTool';
import MagnetTool from './sidebar/MagnetTool';
import StayInDrawingModeTool from './sidebar/StayInDrawingModeTool';
import LockTool from './sidebar/LockTool';
import HideTool from './sidebar/HideTool';
import RemoveTool from './sidebar/RemoveTool';

interface SidebarProps {
  activeTool: ToolType;
  onActivateTool: (tool: ToolType) => void;
  stayInDrawingMode?: boolean;
  isMagnetEnabled?: boolean;
  areDrawingsLocked?: boolean;
  areDrawingsVisible?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTool, 
  onActivateTool, 
  stayInDrawingMode, 
  isMagnetEnabled,
  areDrawingsLocked,
  areDrawingsVisible
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const Divider = () => <div className="w-6 h-[1px] bg-[#2a2e39] my-1"></div>;

  return (
    <div className={`${isCollapsed ? 'w-[14px]' : 'w-[52px]'} border-r-[4px] border-[#333333] bg-[#0c0c0d] flex flex-col items-center py-2 shrink-0 h-full overflow-y-auto overflow-x-visible scrollbar-hide select-none shadow-sm z-[1001] transition-all duration-300 ease-in-out`}>
      {!isCollapsed && (
        <div className="flex flex-col items-center space-y-0.5 w-full px-0 animate-in fade-in duration-300">
          <CursorTool activeTool={activeTool} onActivate={onActivateTool} />
          <Divider />
          
          <TrendLineTool activeTool={activeTool} onActivate={onActivateTool} />
          <FibTool activeTool={activeTool} onActivate={onActivateTool} />
          <BrushTool activeTool={activeTool} onActivate={onActivateTool} />
          <FibFanTool activeTool={activeTool} onActivate={onActivateTool} />
          <RectangleTool activeTool={activeTool} onActivate={onActivateTool} />
          <TextTool activeTool={activeTool} onActivate={onActivateTool} />
          <LongShortTool activeTool={activeTool} onActivate={onActivateTool} />
          <ProjectionTool activeTool={activeTool} onActivate={onActivateTool} />
          <AnchoredVwapTool activeTool={activeTool} onActivate={onActivateTool} />
          
          <Divider />

          <IconsTool activeTool={activeTool} onActivate={onActivateTool} />
          <MeasureTool activeTool={activeTool} onActivate={onActivateTool} />

          <Divider />

          <MagnetTool isActive={isMagnetEnabled} onActivate={onActivateTool} activeTool={activeTool} />
          <LockTool isActive={areDrawingsLocked} onActivate={onActivateTool} />
          <HideTool isActive={!areDrawingsVisible} onActivate={onActivateTool} />
          
          <Divider />

          <RemoveTool activeTool={activeTool} onActivate={onActivateTool} />
        </div>
      )}
      
      <div className="flex-1 min-h-[20px]"></div>

      <div className="flex flex-col items-center space-y-1 w-full px-0 pb-2 shrink-0 bg-[#0c0c0d] sticky bottom-0">
         <button 
           onClick={() => setIsCollapsed(!isCollapsed)}
           className={`flex items-center justify-center rounded text-[#787b86] hover:bg-[#1e222d] hover:text-white transition-all
             ${isCollapsed 
               ? 'w-full h-8 border-y border-[#333333] bg-[#131722]' 
               : 'w-10 h-10'
             }`}
           title={isCollapsed ? "Expand Toolbar" : "Hide Toolbar"}
         >
           {isCollapsed ? <ChevronRight size={13} strokeWidth={3} /> : <ChevronLeft size={28} />}
         </button>
      </div>
    </div>
  );
};

export default Sidebar;