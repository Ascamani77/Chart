
import React from 'react';
import { MessageCircle, Search } from 'lucide-react';

const PrivateChatsPanel: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-black">
      <div className="p-3 border-b border-[#434651]/30 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle size={14} className="text-pink-400" />
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Private Chats</span>
        </div>
        <Search size={14} className="text-gray-400" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2">
        <p className="text-[11px] text-gray-500 font-medium">No messages yet</p>
        <p className="text-[10px] text-gray-600">Start a conversation with another trader.</p>
      </div>
    </div>
  );
};

export default PrivateChatsPanel;
