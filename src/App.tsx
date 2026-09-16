import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Navigation, TabType } from './components/Navigation';
import { ChatsView } from './components/ChatsView';
import { ActiveChatRoom } from './components/ActiveChatRoom';
import { ContactsView } from './components/ContactsView';
import { DiscoverView } from './components/DiscoverView';
import { ProfileView } from './components/ProfileView';
import { ChatConversation, UserProfile } from './types';
import { api } from './lib/api';
import { LovyChatIcon } from './components/LovyChatIcon';
import { RefreshCw, UserCheck, ArrowRight } from 'lucide-react';

function MainApp() {
  const { user, userProfile, loading, bypassLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [activeChat, setActiveChat] = useState<ChatConversation | null>(null);
  const [discoverSubView, setDiscoverSubView] = useState<'menu' | 'bottle' | 'nearby' | 'moments'>('menu');
  const [totalUnread, setTotalUnread] = useState(0);
  const [showSlowNotice, setShowSlowNotice] = useState(true);

  // Monitor loading timeout
  useEffect(() => {
    if (!loading) {
      setShowSlowNotice(false);
    }
  }, [loading]);

  // Monitor total unread badge for the current user
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const chats = await api.getChats(user.uid);
        let count = 0;
        for (const chat of chats) {
          if (chat.unreadCount && chat.unreadCount[user.uid]) {
            count += chat.unreadCount[user.uid];
          }
        }
        setTotalUnread(count);
      } catch (e) {
        console.error('Failed to fetch unread chats:', e);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const handleStartChatWithUser = async (targetUser: UserProfile, greetingPrefix?: string) => {
    if (!user || !userProfile) return;

    try {
      // Check existing chat or create new chat
      const chats = await api.getChats(user.uid);
      const existing = chats.find(
        (c) => c.participants.includes(targetUser.uid) && !c.isGroup
      );

      if (existing) {
        if (greetingPrefix) {
          await api.sendMessage({
            conversationId: existing.id,
            senderId: user.uid,
            recipientId: targetUser.uid,
            text: greetingPrefix,
            senderName: userProfile.displayName,
            senderAvatar: userProfile.avatarUrl,
          });
        }
        setActiveChat(existing);
        return;
      }

      // Create new chat
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
            isOnline: targetUser.isOnline || false,
          },
        },
        lastMessage: greetingPrefix || 'Halo, salam kenal!',
        lastSenderId: user.uid,
      });

      if (greetingPrefix) {
        await api.sendMessage({
          conversationId: newChat.id,
          senderId: user.uid,
          recipientId: targetUser.uid,
          text: greetingPrefix,
          senderName: userProfile.displayName,
          senderAvatar: userProfile.avatarUrl,
        });
      }

      setActiveChat(newChat);
    } catch (err) {
      console.error('Failed to start chat with user:', err);
    }
  };

  const handleStartChatWithUserId = async (
    targetUserId: string,
    targetName: string,
    targetAvatar: string,
    greetingPrefix?: string
  ) => {
    try {
      const userDoc = await api.getUser(targetUserId);
      if (userDoc) {
        await handleStartChatWithUser(userDoc, greetingPrefix);
      } else {
        const resolvedUser: UserProfile = {
          uid: targetUserId,
          displayName: targetName,
          email: `${targetUserId}@lovychat.app`,
          avatarUrl: targetAvatar,
          bio: 'Pengguna LovyChat',
          gender: 'unspecified',
          region: 'Indonesia',
          michatId: 'lovy_' + targetUserId.slice(0, 6),
          isOnline: true,
          lastSeen: null,
          createdAt: null,
        };
        await handleStartChatWithUser(resolvedUser, greetingPrefix);
      }
    } catch (err) {
      console.error('Error starting chat by ID:', err);
    }
  };

  const handleNavigateToNearby = () => {
    setActiveTab('discover');
    setDiscoverSubView('nearby');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-6 py-8 space-y-4">
        <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/25 animate-pulse">
          <LovyChatIcon size={80} withText={true} />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold tracking-wide">Menghubungkan ke LovyChat...</h2>
          <p className="text-xs text-slate-400">Sinkronisasi Real-Time</p>
        </div>

        {showSlowNotice && (
          <div className="w-full max-w-xs bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200 mt-2">
            <p className="text-xs text-slate-300 leading-relaxed">
              Memerlukan waktu lebih lama untuk terhubung. Anda dapat membuka menu autentikasi:
            </p>
            <div className="space-y-2">
              <button
                onClick={() => bypassLoading()}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Buka Menu Masuk / Daftar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full py-1.5 text-[11px] text-slate-400 hover:text-slate-300 transition flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Muat Ulang Halaman</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-dvh h-dvh bg-slate-900/90 sm:bg-slate-200/90 flex flex-col items-center justify-center font-sans antialiased overflow-hidden">
      {/* Mobile Frame Container */}
      <div className="w-full h-full sm:max-w-md sm:h-[844px] sm:max-h-[92dvh] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border-slate-300">
        {activeChat ? (
          <ActiveChatRoom
            chat={activeChat}
            onBack={() => setActiveChat(null)}
          />
        ) : (
          <div className="flex flex-col h-full w-full overflow-hidden">
            <main className="flex-1 overflow-hidden relative">
              {activeTab === 'chats' && (
                <ChatsView
                  onOpenChat={(chat) => setActiveChat(chat)}
                  onNavigateToNearby={handleNavigateToNearby}
                />
              )}

              {activeTab === 'contacts' && (
                <ContactsView
                  onStartChatWithUser={handleStartChatWithUser}
                  onNavigateToNearby={handleNavigateToNearby}
                />
              )}

              {activeTab === 'discover' && (
                <DiscoverView
                  onStartChatWithUser={handleStartChatWithUser}
                  onStartChatWithUserId={handleStartChatWithUserId}
                  initialSubView={discoverSubView}
                />
              )}

              {activeTab === 'profile' && <ProfileView />}
            </main>

            <Navigation
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                if (tab === 'discover') {
                  setDiscoverSubView('menu');
                }
              }}
              totalUnreadCount={totalUnread}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
