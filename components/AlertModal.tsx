
import React, { useState, useEffect } from 'react';
import { X, LayoutGrid, ChevronDown, HelpCircle, Check, Plus, Volume2 } from 'lucide-react';

interface AlertModalProps {
  symbol: string;
  onClose: () => void;
  onCreate: (alertData: any) => void;
  lastPrice?: number;
}

interface NotificationSetting {
  id: string;
  label: string;
  desc: string;
  link?: string;
  active: boolean;
  help?: boolean;
  hasExtras?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({ symbol, onClose, onCreate, lastPrice = 0 }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'message' | 'notifications'>('settings');
  const [triggerMode, setTriggerMode] = useState<'once' | 'every'>('once');
  
  // Form State
  const [price, setPrice] = useState<string>(lastPrice.toFixed(2));
  const [alertName, setAlertName] = useState<string>('');
  const [message, setMessage] = useState<string>(`${symbol} Crossing ${lastPrice.toFixed(2)}`);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: 'app', label: 'Notify in app', desc: 'Push notification', link: 'in app', active: true },
    { id: 'toast', label: 'Show toast notification', desc: 'Displays onsite notification.', active: true },
    { id: 'email', label: 'Send email', desc: 'Email notification to', link: 'settings', active: false },
    { id: 'webhook', label: 'Webhook URL', desc: 'Sends POST request to URL.', active: false, help: true },
    { id: 'sound', label: 'Play sound', desc: 'Plays audio cue.', active: true, hasExtras: true },
    { id: 'text', label: 'Send plain text', desc: 'Alternative email.', active: false, help: true }
  ]);

  useEffect(() => {
    setMessage(`${symbol} Crossing ${price}`);
  }, [price, symbol]);

  const toggleNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, active: !n.active } : n));
  };

  const TabButton = ({ id, label, count }: { id: any, label: string, count?: number }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative pb-2 text-[13px] font-bold transition-colors ${
        activeTab === id ? 'text-white' : 'text-[#787b86] hover:text-gray-300'
      }`}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {count !== undefined && (
          <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] flex items-center justify-center font-bold">
            {count}
          </span>
        )}
      </div>
      {activeTab === id && (
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white rounded-full"></div>
      )}
    </button>
  );

  const handleCreate = () => {
    onCreate({
      symbol,
      price: parseFloat(price),
      name: alertName,
      message,
    });
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 backdrop-blur-[1px]">
      <div className="bg-black w-full max-w-[380px] rounded-lg shadow-2xl border border-[#363a45] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <h2 className="text-[18px] font-bold text-gray-100 tracking-tight">Create alert on {symbol}</h2>
          <div className="flex items-center space-x-4">
            <button className="text-[#787b86] hover:text-white transition-colors">
              <LayoutGrid size={18} />
            </button>
            <button onClick={onClose} className="text-[#787b86] hover:text-white transition-colors">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Tabs Strip */}
        <div className="px-5 flex border-b border-[#2a2e39] space-x-6 shrink-0">
          <TabButton id="settings" label="Settings" />
          <TabButton id="message" label="Message" />
          <TabButton id="notifications" label="Notifications" count={notifications.filter(n => n.active).length} />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
          {activeTab === 'settings' && (
            <div className="px-5 space-y-5">
              {/* Symbols Row */}
              <div className="flex items-center">
                <label className="w-20 text-[13px] text-[#787b86] font-medium shrink-0">Symbols</label>
                <div className="flex-1 bg-[#131722] border border-[#363a45] rounded-md flex items-center px-3 py-1.5 cursor-default overflow-hidden">
                  <div className="w-3.5 h-3.5 rounded-full bg-white text-black font-extrabold text-[8px] flex items-center justify-center mr-2 shrink-0">
                    {symbol.charAt(0)}
                  </div>
                  <span className="text-[13px] text-white font-bold truncate">{symbol}</span>
                </div>
              </div>

              {/* Condition Row */}
              <div className="flex items-start">
                <label className="w-20 text-[13px] text-[#787b86] font-medium pt-2 shrink-0">Condition</label>
                <div className="flex-1 space-y-2">
                  <div className="w-full bg-black border border-[#363a45] rounded-md flex items-center justify-between px-3 py-2 cursor-pointer hover:border-gray-500 transition-colors group">
                    <span className="text-[13px] text-white">Price</span>
                    <ChevronDown size={14} className="text-[#787b86] group-hover:text-white" />
                  </div>
                  <div className="w-full bg-black border border-[#363a45] rounded-md flex items-center justify-between px-3 py-2 cursor-pointer hover:border-gray-500 transition-colors group">
                    <div className="flex items-center">
                       <span className="mr-2 text-[#787b86]">⤩</span>
                       <span className="text-[13px] text-white">Crossing</span>
                    </div>
                    <ChevronDown size={14} className="text-[#787b86] group-hover:text-white" />
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-[1.1] bg-black border border-[#363a45] rounded-md flex items-center justify-between px-3 py-2 cursor-pointer hover:border-gray-500 transition-colors group overflow-hidden">
                      <span className="text-[13px] text-white truncate">Value</span>
                      <ChevronDown size={14} className="text-[#787b86] shrink-0 group-hover:text-white" />
                    </div>
                    <div className="flex-1 bg-black border border-[#2962ff] rounded-md flex items-center px-2 py-2 min-w-0 ring-1 ring-[#2962ff]/30 shadow-[0_0_10px_rgba(41,98,255,0.15)]">
                      <input 
                        type="text" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-[13px] text-white tabular-nums font-medium"
                      />
                      <div className="flex flex-col -space-y-1 text-[#787b86] ml-0.5 shrink-0">
                         <button onClick={() => setPrice((p) => (parseFloat(p) + 0.1).toFixed(2))} className="hover:text-white"><ChevronDown size={10} className="rotate-180" /></button>
                         <button onClick={() => setPrice((p) => (parseFloat(p) - 0.1).toFixed(2))} className="hover:text-white"><ChevronDown size={10} /></button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-1 flex items-center text-[#2962ff] hover:text-blue-400 cursor-pointer font-bold select-none transition-colors group">
                    <Plus size={14} className="mr-1.5" />
                    <span className="text-[13px] group-hover:underline">Add condition</span>
                    <HelpCircle size={14} className="ml-2 text-[#434651]" />
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#2a2e39] w-full my-4"></div>

              {/* Trigger Row */}
              <div className="flex items-start">
                <label className="w-20 text-[13px] text-[#787b86] font-medium pt-2 shrink-0">Trigger</label>
                <div className="flex-1">
                  <div className="flex bg-[#131722] rounded-md p-0.5 border border-[#363a45]">
                    <button 
                      onClick={() => setTriggerMode('once')}
                      className={`flex-1 py-1 text-[12px] font-bold rounded transition-all ${
                        triggerMode === 'once' ? 'bg-[#2a2e39] text-white shadow-sm' : 'text-[#787b86] hover:text-gray-200'
                      }`}
                    >
                      Only once
                    </button>
                    <button 
                      onClick={() => setTriggerMode('every')}
                      className={`flex-1 py-1 text-[12px] font-bold rounded transition-all ${
                        triggerMode === 'every' ? 'bg-[#2a2e39] text-white shadow-sm' : 'text-[#787b86] hover:text-gray-200'
                      }`}
                    >
                      Every time
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-[#787b86] leading-snug">
                    {triggerMode === 'once' 
                      ? "The alert will only trigger once and will not be repeated" 
                      : "The alert will trigger every time the condition is met"}
                  </p>
                </div>
              </div>

              {/* Expiration Row */}
              <div className="flex items-center">
                <label className="w-20 text-[13px] text-[#787b86] font-medium shrink-0">Expiration</label>
                <div className="flex-1 flex items-center justify-between text-[13px] text-white font-bold cursor-pointer group hover:bg-[#1a1a1a] px-2 py-1 rounded transition-colors overflow-hidden">
                  <span className="truncate">Feb 11, 2026 at 02:05</span>
                  <ChevronDown size={14} className="text-[#787b86] group-hover:text-white shrink-0" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'message' && (
            <div className="px-5 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[12px] text-[#787b86] font-bold uppercase tracking-tight">Alert name</label>
                <input 
                  type="text" 
                  value={alertName}
                  onChange={(e) => setAlertName(e.target.value)}
                  className="w-full bg-black border border-[#363a45] rounded-md px-3 py-2 text-[13px] text-white outline-none focus:border-[#2962ff] focus:ring-1 focus:ring-[#2962ff]/30 transition-all font-medium placeholder-[#434651]"
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] text-[#787b86] font-bold uppercase tracking-tight">Message</label>
                <textarea 
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-black border border-[#363a45] rounded-md px-3 py-2 text-[13px] text-white outline-none focus:border-[#2962ff] focus:ring-1 focus:ring-[#2962ff]/30 transition-all resize-none font-medium leading-relaxed"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-3 py-1.5 bg-[#2a2e39] text-white text-[12px] font-bold rounded-md border border-[#434651] hover:bg-white/10 transition-colors">
                  Add placeholder
                </button>
                <HelpCircle size={15} className="text-[#787b86]" />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="px-5 space-y-4">
              {notifications.map((item) => (
                <div key={item.id} className="flex flex-col space-y-0.5">
                  <div className="flex items-center group cursor-pointer" onClick={() => toggleNotification(item.id)}>
                    <div className={`w-4 h-4 rounded-[2px] border flex items-center justify-center mr-3 transition-colors shrink-0 ${
                      item.active ? 'bg-[#2962ff] border-[#2962ff] text-white' : 'bg-transparent border-[#434651] group-hover:border-gray-400'
                    }`}>
                      {item.active && <Check size={12} strokeWidth={4} />}
                    </div>
                    <span className={`text-[13px] font-bold transition-colors ${item.active ? 'text-white' : 'text-[#787b86]'}`}>{item.label}</span>
                  </div>
                  <div className="pl-7">
                     <p className="text-[11px] text-[#787b86] leading-snug">
                       {item.desc} {item.link && <span className="text-[#2962ff] cursor-pointer hover:underline">{item.link}</span>}
                     </p>
                     {item.hasExtras && item.active && (
                        <div className="flex space-x-2 mt-2">
                           <div className="flex-1 bg-black border border-[#363a45] rounded-md flex items-center justify-between px-2 py-1.5 cursor-pointer hover:border-gray-500 min-w-0 group">
                              <span className="text-[12px] text-white font-medium truncate">Alarm Clock</span>
                              <ChevronDown size={12} className="text-[#787b86] shrink-0 group-hover:text-white" />
                           </div>
                           <div className="w-24 bg-black border border-[#363a45] rounded-md flex items-center justify-between px-2 py-1.5 cursor-pointer hover:border-gray-500 shrink-0 group">
                              <span className="text-[12px] text-white font-medium truncate">30s</span>
                              <ChevronDown size={12} className="text-[#787b86] shrink-0 group-hover:text-white" />
                           </div>
                        </div>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#2a2e39] flex justify-end space-x-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-1.5 text-[13px] font-bold text-gray-300 border border-[#434651] rounded-md hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            className="px-5 py-1.5 text-[13px] font-bold text-black bg-white rounded-md hover:bg-gray-200 transition-colors shadow-lg active:scale-95 transform transition-transform"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
