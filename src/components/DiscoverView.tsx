import React, { useState } from 'react';
import { BottleView } from './BottleView';
import { NearbyView } from './NearbyView';
import { MomentsView } from './MomentsView';
import { UserProfile } from '../types';
import { 
  Compass, 
  MapPin, 
  Waves, 
  Camera, 
  ChevronRight, 
  ArrowLeft
} from 'lucide-react';

interface DiscoverViewProps {
  onStartChatWithUser: (targetUser: UserProfile) => void;
  onStartChatWithUserId: (userId: string, senderName: string, avatarUrl: string, greetingPrefix?: string) => void;
  initialSubView?: 'menu' | 'bottle' | 'nearby' | 'moments';
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onStartChatWithUser,
  onStartChatWithUserId,
  initialSubView = 'menu'
}) => {
  const [subView, setSubView] = useState<'menu' | 'bottle' | 'nearby' | 'moments'>(initialSubView);

  if (subView === 'bottle') {
    return (
      <div className="flex flex-col h-full w-full bg-white">
        <div className="bg-sky-600 text-white px-3.5 py-3 flex items-center gap-2 border-b border-sky-700 shadow-xs z-20 shrink-0">
          <button
            onClick={() => setSubView('menu')}
            className="p-1 hover:bg-sky-700 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-bold">Pesan dalam Botol</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <BottleView onStartChatWithUserId={onStartChatWithUserId} />
        </div>
      </div>
    );
  }

  if (subView === 'nearby') {
    return (
      <div className="flex flex-col h-full w-full bg-white">
        <div className="bg-emerald-600 text-white px-3.5 py-3 flex items-center gap-2 border-b border-emerald-700 shadow-xs z-20 shrink-0">
          <button
            onClick={() => setSubView('menu')}
            className="p-1 hover:bg-emerald-700 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-bold">Pengguna di Sekitar</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <NearbyView onStartChat={onStartChatWithUser} />
        </div>
      </div>
    );
  }

  if (subView === 'moments') {
    return (
      <div className="flex flex-col h-full w-full bg-white">
        <div className="bg-emerald-700 text-white px-3.5 py-3 flex items-center gap-2 border-b border-emerald-800 shadow-xs z-20 shrink-0">
          <button
            onClick={() => setSubView('menu')}
            className="p-1 hover:bg-emerald-800 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-bold">Momen Status</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <MomentsView />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 overflow-y-auto">
      {/* Top Header */}
      <header className="bg-emerald-600 text-white px-4 py-3 sticky top-0 z-20 shadow-sm shrink-0">
        <h1 className="text-base font-bold tracking-tight">Temukan</h1>
      </header>

      <div className="p-3.5 space-y-3 flex-1">
        {/* Banner */}
        <div className="bg-linear-to-r from-teal-500 to-emerald-600 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Jelajahi Dunia LovyChat
            </span>
            <h3 className="text-sm font-extrabold">Temukan Teman Sekitar & Pesan Botol</h3>
            <p className="text-[11px] text-teal-100 leading-relaxed">
              Kenalan dengan pengguna di sekitarmu atau tangkap cerita tak terduga lewat pesan botol lautan.
            </p>
          </div>
          <Compass className="w-24 h-24 text-white/10 absolute -right-3 -bottom-4" />
        </div>

        {/* Menu list */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {/* People Nearby */}
          <button
            onClick={() => setSubView('nearby')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition">
                  Pengguna di Sekitar (People Nearby)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Lihat orang-orang terdekat dan sapa langsung
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0" />
          </button>

          {/* Message in a Bottle */}
          <button
            onClick={() => setSubView('bottle')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 transition">
                  Pesan dalam Botol (Message in a Bottle)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Lempar atau pancing pesan misterius di lautan
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-600 shrink-0" />
          </button>

          {/* Moments */}
          <button
            onClick={() => setSubView('moments')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition">
                  Momen (Feed Status)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Bagikan cerita, foto harian, dan berikan suka
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
