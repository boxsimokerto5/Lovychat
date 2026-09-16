import React from 'react';
import { MessageSquare, Users, Compass, User } from 'lucide-react';

export type TabType = 'chats' | 'contacts' | 'discover' | 'profile';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  totalUnreadCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  totalUnreadCount
}) => {
  return (
    <nav className="shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 py-2 px-4 shadow-sm z-30 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around">
        {/* Chats Tab */}
        <button
          onClick={() => onSelectTab('chats')}
          className={`flex flex-col items-center justify-center w-16 py-1 transition relative ${
            activeTab === 'chats' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <MessageSquare className={`w-5 h-5 ${activeTab === 'chats' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[10px] font-bold px-1.5 min-w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Obrolan</span>
        </button>

        {/* Contacts Tab */}
        <button
          onClick={() => onSelectTab('contacts')}
          className={`flex flex-col items-center justify-center w-16 py-1 transition ${
            activeTab === 'contacts' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'contacts' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-1 font-medium">Teman</span>
        </button>

        {/* Discover Tab */}
        <button
          onClick={() => onSelectTab('discover')}
          className={`flex flex-col items-center justify-center w-16 py-1 transition relative ${
            activeTab === 'discover' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <Compass className={`w-5 h-5 ${activeTab === 'discover' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
          <span className="text-[10px] mt-1 font-medium">Temukan</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center w-16 py-1 transition ${
            activeTab === 'profile' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-1 font-medium">Saya</span>
        </button>
      </div>
    </nav>
  );
};
