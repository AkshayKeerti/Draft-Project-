
import React, { useState } from 'react';
import { X, Search, UserPlus, MoreVertical, Circle, MessageSquare } from 'lucide-react';
import { FriendsListViewProps, Friend } from '../types';

export const FriendsListView: React.FC<FriendsListViewProps> = ({ isOpen, onClose, friends }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Friend['status']) => {
    switch(status) {
      case 'active': return 'text-acid-lime bg-acid-lime';
      case 'home': return 'text-acid-blue bg-acid-blue';
      case 'offline': return 'text-gray-500 bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/20 flex justify-between items-start bg-night-950">
        <div>
          <h2 className="text-5xl font-display font-black text-white italic leading-none">THE<br/><span className="text-acid-lime">SQUAD</span></h2>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 border-2 border-white text-white hover:bg-white hover:text-black transition-colors"
        >
          <X size={28} strokeWidth={3} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-6 border-b border-white/10">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-500 group-focus-within:text-acid-lime" size={20} />
          </div>
          <input 
            type="text" 
            placeholder="FIND HOMIE..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-night-900 border-2 border-white/20 text-white font-bold font-display uppercase text-xl py-4 pl-12 pr-4 focus:outline-none focus:border-acid-lime focus:shadow-[4px_4px_0px_0px_#ccff00] transition-all placeholder:text-gray-700"
          />
        </div>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
        {filteredFriends.length > 0 ? (
          filteredFriends.map(friend => (
            <div key={friend.id} className="group relative bg-night-900 border border-white/10 hover:border-white p-4 flex items-center justify-between transition-all hover:bg-night-800 active:scale-[0.99]">
              
              <div className="flex items-center gap-4">
                {/* Avatar with Status Indicator */}
                <div className="relative">
                    <div className="w-16 h-16 border-2 border-white overflow-hidden bg-black">
                        <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-black ${getStatusColor(friend.status).split(' ')[1]}`}></div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-display font-black text-white uppercase leading-none">{friend.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border border-current ${getStatusColor(friend.status).split(' ')[0]}`}>
                        {friend.status}
                    </span>
                    {friend.status === 'active' && friend.drink && (
                        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                           • Drinking {friend.drink}
                        </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                 <button className="w-10 h-10 border border-white/20 hover:bg-white hover:text-black hover:border-white flex items-center justify-center transition-colors">
                    <MessageSquare size={18} strokeWidth={2.5} />
                 </button>
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-50">
              <p className="font-display font-black text-3xl uppercase text-gray-600">No Matches</p>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-6 border-t border-white/20 bg-night-950 pb-10">
        <button className="relative w-full py-5 bg-acid-pink border-2 border-black text-white shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center">
             <div className="absolute left-6 top-1/2 -translate-y-1/2">
                <UserPlus size={24} strokeWidth={3} />
             </div>
             <span className="font-display font-black text-xl uppercase tracking-wider text-center px-8 leading-none">Invite New Friend</span>
        </button>
      </div>
    </div>
  );
};
