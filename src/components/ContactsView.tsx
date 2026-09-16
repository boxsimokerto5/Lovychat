import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import { 
  Users, 
  MapPin, 
  MessageSquare, 
  Search, 
  ChevronRight, 
  X,
  Share2,
  Check
} from 'lucide-react';
import { OtherUserProfileModal } from './OtherUserProfileModal';

interface ContactsViewProps {
  onStartChatWithUser: (user: UserProfile) => void;
  onNavigateToNearby: () => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  onStartChatWithUser,
  onNavigateToNearby
}) => {
  const { user, userProfile } = useAuth();
  const [contacts, setContacts] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      try {
        const allUsers = await api.getUsers();
        const list: UserProfile[] = [];
        allUsers.forEach((u) => {
          if (u.uid !== user.uid) {
            list.push(u);
          }
        });
        setContacts(list);
      } catch (err) {
        console.error('Failed to fetch contacts:', err);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  const blockedUids = userProfile?.blockedUsers || [];
  const activeContacts = contacts.filter(c => !blockedUids.includes(c.uid));

  const filteredContacts = activeContacts.filter((c) =>
    c.displayName.toLowerCase().includes(search.toLowerCase()) ||
    c.michatId.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyMyId = () => {
    if (!userProfile?.michatId) return;
    navigator.clipboard.writeText(userProfile.michatId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top Header */}
      <header className="bg-emerald-600 text-white px-4 py-3 sticky top-0 z-20 shadow-sm shrink-0 flex items-center justify-between">
        <h1 className="text-base font-bold tracking-tight">Teman & Kontak</h1>
        <span className="text-xs bg-emerald-700/80 px-2 py-0.5 rounded-full font-medium">
          {activeContacts.length} Teman
        </span>
      </header>

      {/* Search Bar */}
      <div className="p-3 bg-white border-b border-slate-200/80 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari teman atau ID LovyChat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-100/80 rounded-xl text-xs border border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none transition"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {/* Shortcut rows */}
        <div className="bg-white divide-y divide-slate-100 mb-2 shadow-2xs">
          <button
            onClick={onNavigateToNearby}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Pengguna di Sekitar</span>
                <span className="text-[11px] text-slate-400">Temukan teman baru berdasarkan jarak</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>
        </div>

        {/* Contacts section header */}
        <div className="px-4 py-2 bg-slate-100/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Semua Pengguna ({filteredContacts.length})</span>
          {userProfile && (
            <button
              onClick={handleCopyMyId}
              className="text-emerald-700 hover:text-emerald-800 text-[10px] font-semibold flex items-center gap-1 uppercase tracking-normal"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
              <span>{copied ? 'ID Disalin' : 'ID Saya: ' + userProfile.michatId}</span>
            </button>
          )}
        </div>

        {/* Contacts List */}
        <div className="bg-white divide-y divide-slate-100">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Memuat kontak...
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="py-14 text-center px-6 space-y-3">
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Belum Ada Pengguna Lain Terdaftar</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Buka tab Temukan untuk mencari orang di sekitar atau bagikan ID LovyChat Anda ke teman untuk mulai saling mengobrol secara real-time.
                </p>
              </div>
              <button
                onClick={onNavigateToNearby}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Pindai Radar di Sekitar</span>
              </button>
            </div>
          ) : (
            filteredContacts.map((c) => (
              <button
                key={c.uid}
                onClick={() => setSelectedUser(c)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={c.avatarUrl}
                      alt={c.displayName}
                      className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    {c.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{c.displayName}</h4>
                      {c.gender === 'female' ? (
                        <span className="text-[10px] text-pink-600 font-bold">♀</span>
                      ) : c.gender === 'male' ? (
                        <span className="text-[10px] text-blue-600 font-bold">♂</span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">ID: {c.michatId}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 text-xs text-emerald-600 font-semibold px-2.5 py-1 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Obrolan</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Contact Profile Dialog with Block Feature */}
      <OtherUserProfileModal
        user={selectedUser}
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        onStartChat={(target) => {
          setSelectedUser(null);
          onStartChatWithUser(target);
        }}
        onUserBlocked={() => {
          setSelectedUser(null);
        }}
      />
    </div>
  );
};
