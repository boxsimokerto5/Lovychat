import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ChatConversation, UserProfile } from '../types';
import { formatTimestamp } from '../utils/avatars';
import { LovyChatIcon } from './LovyChatIcon';
import { 
  Search, 
  MessageSquarePlus, 
  Users, 
  Sparkles, 
  X,
  UserPlus
} from 'lucide-react';

interface ChatsViewProps {
  onOpenChat: (conversation: ChatConversation) => void;
  onNavigateToNearby: () => void;
}

export const ChatsView: React.FC<ChatsViewProps> = ({ onOpenChat, onNavigateToNearby }) => {
  const { user, userProfile } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const chatList = await api.getChats(user.uid);
      if (Array.isArray(chatList)) {
        chatList.sort((a, b) => {
          const timeA = new Date(a.lastUpdated || 0).getTime();
          const timeB = new Date(b.lastUpdated || 0).getTime();
          return timeB - timeA;
        });
        setConversations(chatList);
      }
    } catch {
      // Gracefully continue polling on network blip
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Polling listener for user's conversations
  useEffect(() => {
    if (!user?.uid) return;
    loadConversations();
    const interval = setInterval(loadConversations, 3000);
    return () => clearInterval(interval);
  }, [user?.uid, loadConversations]);

  // Fetch registered users when modal opens
  const handleOpenNewChat = async () => {
    setShowNewChatModal(true);
    setLoadingUsers(true);
    try {
      const all = await api.getUsers();
      const list = all.filter(
        (u) => u.uid !== user?.uid && !userProfile?.blockedUsers?.includes(u.uid)
      );
      setAllUsers(list);
    } catch (e) {
      console.error('Failed to load users:', e);
      setAllUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Start or open existing chat with a user
  const handleStartChatWithUser = async (targetUser: UserProfile) => {
    if (!user || !userProfile) return;

    // Check if chat already exists
    const existing = conversations.find((c) =>
      c.participants.includes(targetUser.uid) && !c.isGroup
    );

    if (existing) {
      setShowNewChatModal(false);
      onOpenChat(existing);
      return;
    }

    // Create new conversation via PostgreSQL backend
    try {
      const newChat = await api.createOrGetChat({
        participants: [user.uid, targetUser.uid],
        participantDetails: {
          [user.uid]: {
            displayName: userProfile.displayName,
            avatarUrl: userProfile.avatarUrl,
            michatId: userProfile.michatId,
            isOnline: true,
          },
          [targetUser.uid]: {
            displayName: targetUser.displayName,
            avatarUrl: targetUser.avatarUrl,
            michatId: targetUser.michatId,
            isOnline: targetUser.isOnline,
          },
        },
        lastMessage: 'Obrolan dimulai',
        lastSenderId: user.uid,
      });

      setShowNewChatModal(false);
      await loadConversations();
      onOpenChat(newChat);
    } catch (err) {
      console.error('Failed to create new chat:', err);
    }
  };

  // Filter out blocked users
  const blockedUids = userProfile?.blockedUsers || [];
  const activeConversations = conversations.filter((c) => {
    const otherUid = c.participants.find((p) => p !== user?.uid);
    if (otherUid && blockedUids.includes(otherUid)) {
      return false;
    }
    return true;
  });

  const hiddenBlockedChatsCount = conversations.length - activeConversations.length;

  const filteredChats = activeConversations.filter((c) => {
    const otherUid = c.participants.find((p) => p !== user?.uid);
    const otherName = otherUid ? c.participantDetails?.[otherUid]?.displayName || '' : '';
    return otherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Header */}
      <header className="bg-emerald-600 text-white px-4 py-3 sticky top-0 z-20 shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <LovyChatIcon size={26} className="rounded-lg shadow-xs" />
          <h1 className="text-base font-bold tracking-tight">LovyChat</h1>
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNewChat}
            className="p-1.5 bg-emerald-700/60 hover:bg-emerald-700 rounded-xl text-white transition flex items-center gap-1.5 text-xs font-semibold px-2.5"
            title="Mulai Chat Baru"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Chat Baru</span>
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-3 pt-2.5 pb-2 bg-slate-50 border-b border-slate-100 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari obrolan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white rounded-xl text-xs border border-slate-200/80 focus:border-emerald-500 focus:outline-none transition shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Hidden Blocked Chats Notification Banner */}
      {hiddenBlockedChatsCount > 0 && (
        <div className="px-4 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {hiddenBlockedChatsCount} obrolan disembunyikan (pengguna diblokir)
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">Privasi Terjaga</span>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Memuat obrolan real-time...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-16 px-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Belum Ada Percakapan</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Mulai obrolan baru dengan teman atau temukan teman di sekitar Anda.
              </p>
            </div>
            <div className="flex flex-col gap-2 max-w-xs mx-auto pt-2">
              <button
                onClick={handleOpenNewChat}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Pilih Kontak / Mulai Chat</span>
              </button>
              <button
                onClick={onNavigateToNearby}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Cari Pengguna Terdekat</span>
              </button>
            </div>
          </div>
        ) : (
          filteredChats.map((c) => {
            const otherUid = c.participants.find((p) => p !== user?.uid) || '';
            const other = c.participantDetails?.[otherUid] || {
              displayName: 'Pengguna LovyChat',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
              michatId: 'lovy_user'
            };
            const unread = (user && c.unreadCount?.[user.uid]) || 0;

            return (
              <button
                key={c.id}
                onClick={() => onOpenChat(c)}
                className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-50 transition text-left"
              >
                <div className="relative shrink-0">
                  <img
                    src={other.avatarUrl}
                    alt={other.displayName}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  {other.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {other.displayName}
                    </h3>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                      {formatTimestamp(c.lastUpdated)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 truncate">
                      {c.lastMessage || 'Ketuk untuk mengobrol'}
                    </p>
                    {unread > 0 && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center ml-2">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Modal Start New Chat */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800">Mulai Obrolan Baru</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Pilih pengguna untuk diajak berbicara langsung secara real-time:
            </p>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
              {loadingUsers ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Mencari pengguna terdaftar...
                </div>
              ) : allUsers.length === 0 ? (
                <div className="py-8 text-center px-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-600">Belum ada pengguna lain terdaftar.</p>
                  <p className="text-[11px] text-slate-400">
                    Buka tab Temukan untuk mencari teman di sekitar atau bagikan ID LovyChat Anda!
                  </p>
                </div>
              ) : (
                allUsers.map((u) => (
                  <button
                    key={u.uid}
                    onClick={() => handleStartChatWithUser(u)}
                    className="w-full py-2.5 px-2 flex items-center gap-3 hover:bg-slate-50 rounded-xl transition text-left"
                  >
                    <img
                      src={u.avatarUrl}
                      alt={u.displayName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{u.displayName}</p>
                      <p className="text-[10px] text-slate-400 truncate">ID: {u.michatId} • {u.region}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
