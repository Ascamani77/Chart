
import React from 'react';
import { MessageSquare, Users } from 'lucide-react';

const PublicChatsPanel: React.FC = () => {
  const rooms = [
    { name: 'Bitcoin / USDT', users: 4521 },
    { name: 'Forex Major', users: 1240 },
    { name: 'Altcoins Hub', users: 890 },
  ];

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="p-3 border-b border-[#434651]/30">
        <div className="flex items-center space-x-2">
          <MessageSquare size={14} className="text-green-400" />
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Public Chats</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {rooms.map((room) => (
          <div key={room.name} className="p-3 border-b border-[#434651]/10 hover:bg-[#1e222d] cursor-pointer">
            <div className="text-[12px] font-bold text-white mb-0.5">{room.name}</div>
            <div className="flex items-center space-x-1 text-gray-500">
              <Users size={10} />
              <span className="text-[10px]">{room.users.toLocaleString()} users</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicChatsPanel;
