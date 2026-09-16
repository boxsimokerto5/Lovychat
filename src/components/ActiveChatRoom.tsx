import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ChatMessage, ChatConversation, UserProfile } from '../types';
import { formatTimestamp } from '../utils/avatars';
import { uploadImageToImgBB, isImgBBConfigured } from '../utils/imgbb';
import { OtherUserProfileModal } from './OtherUserProfileModal';
import { 
  ArrowLeft, 
  Send, 
  Smile, 
  Image as ImageIcon, 
  Phone, 
  Video, 
  Check, 
  CheckCheck,
  MoreVertical,
  Heart,
  Coffee,
  Sparkles,
  X,
  Upload,
  Loader2,
  UserX,
  ShieldCheck,
  ShieldAlert,
  User as UserIcon,
  AlertTriangle
} from 'lucide-react';

const QUICK_GREETINGS = [
  'Hai! Salam kenal ya 😊',
  'Lagi di mana sekarang?',
  'Boleh kenalan gak nih? ✨',
  'Sore! Lagi santai ya?',
  '☕ Kopi dulu yuk!'
];

const PRESET_CHAT_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80'
];

interface ActiveChatRoomProps {
  chat: ChatConversation;
  onBack: () => void;
}

export const ActiveChatRoom: React.FC<ActiveChatRoomProps> = ({ chat, onBack }) => {
  const { user, userProfile, isUserBlocked, blockUser, unblockUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [callModal, setCallModal] = useState<'audio' | 'video' | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [recipientFullProfile, setRecipientFullProfile] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCurrentlyTypingRef = useRef(false);

  // Find recipient details
  const recipientUid = chat.participants.find((p) => p !== user?.uid) || '';
  const recipient = chat.participantDetails?.[recipientUid] || {
    displayName: 'Pengguna LovyChat',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    michatId: 'lovy_user',
    isOnline: false
  };

  const isBlocked = isUserBlocked(recipientUid);

  // Fetch full recipient profile for the modal
  useEffect(() => {
    if (!recipientUid) return;

    let isMounted = true;
    api.getUser(recipientUid).then((profile) => {
      if (profile && isMounted) {
        setRecipientFullProfile(profile);
      } else if (isMounted) {
        setRecipientFullProfile({
          uid: recipientUid,
          displayName: recipient.displayName,
          avatarUrl: recipient.avatarUrl,
          michatId: recipient.michatId,
          email: '',
          bio: 'Pengguna LovyChat',
          gender: 'unspecified',
          region: '',
          isOnline: recipient.isOnline || false,
          lastSeen: null,
          createdAt: null
        });
      }
    }).catch(() => {
      if (isMounted) {
        setRecipientFullProfile({
          uid: recipientUid,
          displayName: recipient.displayName,
          avatarUrl: recipient.avatarUrl,
          michatId: recipient.michatId,
          email: '',
          bio: 'Pengguna LovyChat',
          gender: 'unspecified',
          region: '',
          isOnline: recipient.isOnline || false,
          lastSeen: null,
          createdAt: null
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [recipientUid, recipient.displayName, recipient.avatarUrl, recipient.michatId, recipient.isOnline]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const loadMessages = useCallback(async () => {
    if (!chat.id) return;
    try {
      const msgs = await api.getMessages(chat.id);
      if (Array.isArray(msgs)) {
        setMessages(msgs);
      }
    } catch {
      // Gracefully recover on network blip
    }
  }, [chat.id]);

  // Poll messages and typing status periodically
  const checkTypingStatus = useCallback(async () => {
    if (!chat.id || !user) return;
    try {
      const res = await api.getTypingStatus(chat.id, user.uid);
      setIsRecipientTyping(Boolean(res.isTyping));
    } catch {
      // Ignore transient network errors
    }
  }, [chat.id, user]);

  useEffect(() => {
    if (!chat.id) return;
    loadMessages().then(scrollToBottom);
    checkTypingStatus();

    const msgInterval = setInterval(loadMessages, 2000);
    const typingInterval = setInterval(checkTypingStatus, 1200);

    // Reset unread count for current user
    if (user) {
      api.markChatRead(chat.id, user.uid);
    }

    return () => {
      clearInterval(msgInterval);
      clearInterval(typingInterval);
    };
  }, [chat.id, user, loadMessages, checkTypingStatus]);

  // Clean up user's own typing status on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isCurrentlyTypingRef.current && user && chat.id) {
        api.setTypingStatus(chat.id, user.uid, false);
      }
    };
  }, [chat.id, user]);

  // Scroll to bottom when recipient starts typing
  useEffect(() => {
    if (isRecipientTyping) {
      scrollToBottom();
    }
  }, [isRecipientTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);

    if (!user || !chat.id || isBlocked) return;

    if (val.trim().length > 0) {
      if (!isCurrentlyTypingRef.current) {
        isCurrentlyTypingRef.current = true;
        api.setTypingStatus(chat.id, user.uid, true);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Reset typing status after 2.5 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (isCurrentlyTypingRef.current && user && chat.id) {
          isCurrentlyTypingRef.current = false;
          api.setTypingStatus(chat.id, user.uid, false);
        }
      }, 2500);
    } else {
      // Text became empty
      if (isCurrentlyTypingRef.current && user && chat.id) {
        isCurrentlyTypingRef.current = false;
        api.setTypingStatus(chat.id, user.uid, false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleSendMessage = async (customText?: string, imageUrl?: string) => {
    const msgText = customText !== undefined ? customText : text.trim();
    if ((!msgText && !imageUrl) || !user || !userProfile) return;

    // Clear typing status immediately
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isCurrentlyTypingRef.current && chat.id) {
      isCurrentlyTypingRef.current = false;
      api.setTypingStatus(chat.id, user.uid, false);
    }

    if (customText === undefined && !imageUrl) {
      setText('');
    }

    try {
      const sent = await api.sendMessage({
        conversationId: chat.id,
        senderId: user.uid,
        recipientId: recipientUid,
        text: msgText || (imageUrl ? '📷 [Foto]' : ''),
        imageUrl: imageUrl || undefined,
        senderName: userProfile.displayName,
        senderAvatar: userProfile.avatarUrl,
      });

      setMessages((prev) => [...prev, sent]);
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setIsUploadingImage(true);
    try {
      const result = await uploadImageToImgBB(file, { maxWidth: 900, maxHeight: 900, quality: 0.8 });
      await handleSendMessage('', result.url);
      setShowImagePicker(false);
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 relative overflow-hidden">
      {/* Top Header */}
      <header className="bg-white px-3 py-2.5 border-b border-slate-200 flex items-center justify-between z-10 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 rounded-full transition shrink-0"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-90 transition group"
            title="Lihat Profil & Pengaturan Blokir"
          >
            <div className="relative shrink-0">
              <img
                src={recipient.avatarUrl}
                alt={recipient.displayName}
                className={`w-10 h-10 rounded-full object-cover ring-1 transition ${
                  isBlocked ? 'ring-rose-300 grayscale-30' : 'ring-slate-200'
                }`}
              />
              {recipient.isOnline && !isBlocked && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              )}
              {isBlocked && (
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-white" title="Diblokir">
                  <UserX className="w-2.5 h-2.5" />
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-800 truncate group-hover:text-emerald-700 transition">{recipient.displayName}</h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                {isBlocked ? (
                  <span className="text-rose-600 font-medium">● Diblokir</span>
                ) : isRecipientTyping ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1.5 animate-pulse">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                    </span>
                    <span>sedang mengetik...</span>
                  </span>
                ) : recipient.isOnline ? (
                  <span className="text-emerald-600 font-medium">● Online</span>
                ) : (
                  <span>ID: {recipient.michatId}</span>
                )}
              </p>
            </div>
          </button>
        </div>

        {/* Action icons & Menu */}
        <div className="flex items-center gap-1 text-slate-600 shrink-0 relative">
          <button
            onClick={() => setCallModal('audio')}
            disabled={isBlocked}
            className="p-2 hover:bg-slate-100 disabled:opacity-30 rounded-full transition text-slate-600 hover:text-emerald-600"
            title="Panggilan Suara"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCallModal('video')}
            disabled={isBlocked}
            className="p-2 hover:bg-slate-100 disabled:opacity-30 rounded-full transition text-slate-600 hover:text-emerald-600"
            title="Panggilan Video"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* 3-dot menu trigger */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(prev => !prev)}
              className={`p-2 rounded-full transition ${showMenu ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100 text-slate-600'}`}
              title="Menu Opsi Chat & Privasi"
              aria-expanded={showMenu}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowMenu(false)} 
                />
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100">
                  <div className="px-3 py-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Opsi Obrolan</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{recipient.displayName}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-600" />
                      <span>Lihat Profil Pengguna</span>
                    </button>
                  </div>

                  <div className="py-1">
                    {isBlocked ? (
                      <button
                        onClick={async () => {
                          setShowMenu(false);
                          await unblockUser(recipientUid);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition font-semibold"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Buka Blokir Pengguna</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowBlockConfirm(true);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition font-semibold"
                      >
                        <UserX className="w-4 h-4 text-rose-500" />
                        <span>Blokir Pengguna Ini</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Blocked Notification Banner */}
      {isBlocked && (
        <div className="bg-rose-50 border-b border-rose-200 px-3.5 py-2.5 flex items-center justify-between text-xs text-rose-800 z-10 shrink-0">
          <div className="flex items-center gap-2 min-w-0 mr-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="truncate font-medium">Pengguna ini telah diblokir. Pesan tidak akan dikirim.</span>
          </div>
          <button
            onClick={() => unblockUser(recipientUid)}
            className="px-3 py-1 bg-white hover:bg-rose-100 border border-rose-300 text-rose-700 rounded-xl font-bold text-xs transition shrink-0 shadow-2xs"
          >
            Buka Blokir
          </button>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Safe chat banner */}
        <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-2.5 text-center text-[11px] text-emerald-800">
          🔒 Percakapan ini terhubung secara real-time dan aman. Jaga privasi dan selalu bersikap ramah.
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs text-emerald-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-600">Mulai Obrolan Sekarang!</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Kirim sapaan hangat atau gunakan salah satu pesan pembuka cepat di bawah.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                  />
                )}

                <div
                  className={`max-w-[76%] rounded-2xl p-3 shadow-xs transition ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  {msg.imageUrl && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-black/10">
                      <img
                        src={msg.imageUrl}
                        alt="Kirim foto"
                        className="w-full max-h-52 object-cover"
                      />
                    </div>
                  )}

                  {msg.text && (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                  )}

                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMe ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    <span>{formatTimestamp(msg.createdAt)}</span>
                    {isMe && (
                      <CheckCheck className="w-3 h-3 text-emerald-200" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {/* Recipient is typing indicator bubble */}
        {isRecipientTyping && !isBlocked && (
          <div className="flex items-end gap-2 justify-start animate-in fade-in slide-in-from-bottom-2 duration-200">
            <img
              src={recipient.avatarUrl}
              alt={recipient.displayName}
              className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 ring-1 ring-slate-200"
            />
            <div className="bg-white text-slate-700 border border-slate-200/80 rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-xs flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">sedang mengetik</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick greetings suggestions */}
      <div className="bg-white/90 border-t border-slate-100 px-3 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] text-slate-400 shrink-0 font-medium">Sapa Cepat:</span>
        {QUICK_GREETINGS.map((greet, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(greet)}
            className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200/70 transition shrink-0"
          >
            {greet}
          </button>
        ))}
      </div>

      {/* Preset Image Picker Drawer */}
      {showImagePicker && (
        <div className="bg-white border-t border-slate-200 p-3 shrink-0 animate-in slide-in-from-bottom duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Kirim Foto</span>
            <button onClick={() => setShowImagePicker(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
              e.target.value = '';
            }}
          />

          <div className="grid grid-cols-5 gap-2">
            {/* Custom Upload Tile */}
            <button
              type="button"
              disabled={isUploadingImage}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="flex flex-col items-center justify-center h-14 rounded-lg border-2 border-dashed border-emerald-400 hover:bg-emerald-50 text-emerald-700 transition p-1 text-center"
              title="Pilih foto dari perangkat atau drag & drop"
            >
              {isUploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 mb-0.5" />
                  <span className="text-[9px] font-bold leading-tight">Unggah</span>
                  <span className="text-[8px] text-emerald-600/80 leading-none">ImgBB</span>
                </>
              )}
            </button>

            {/* Presets */}
            {PRESET_CHAT_IMAGES.map((imgUrl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  handleSendMessage('', imgUrl);
                  setShowImagePicker(false);
                }}
                className="rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-500 transition group relative"
              >
                <img src={imgUrl} alt="Preset" className="w-full h-14 object-cover group-hover:scale-105 transition" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar or Blocked status */}
      {isBlocked ? (
        <div className="bg-slate-50 p-3.5 border-t border-slate-200 text-center text-xs text-slate-600 font-medium z-10 flex flex-col sm:flex-row items-center justify-center gap-2">
          <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
            <UserX className="w-4 h-4 shrink-0" />
            <span>Anda telah memblokir {recipient.displayName}.</span>
          </div>
          <button
            onClick={() => unblockUser(recipientUid)}
            className="px-3 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-emerald-700 font-bold text-xs rounded-xl transition shadow-2xs"
          >
            Buka Blokir untuk Mengirim Pesan
          </button>
        </div>
      ) : (
        <div className="bg-white p-2.5 border-t border-slate-200 flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={() => setShowImagePicker(!showImagePicker)}
            className={`p-2 rounded-full transition ${showImagePicker ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Kirim Foto"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex-1 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tulis pesan..."
              value={text}
              onChange={handleInputChange}
              className="flex-1 py-2 px-3.5 bg-slate-100 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-emerald-500 transition"
            />

            <button
              type="submit"
              disabled={!text.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-full transition shadow-xs"
              title="Kirim"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Other User Profile Modal (with Block feature) */}
      <OtherUserProfileModal
        user={recipientFullProfile}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUserBlocked={() => {
          setShowProfileModal(false);
        }}
      />

      {/* Audio/Video Call Modal Simulator */}
      {callModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="relative mx-auto w-20 h-20">
              <img
                src={recipient.avatarUrl}
                alt={recipient.displayName}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-100"
              />
              <span className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 text-white rounded-full">
                {callModal === 'audio' ? <Phone className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 text-base">{recipient.displayName}</h3>
              <p className="text-xs text-emerald-600 font-medium animate-pulse mt-1">
                {callModal === 'audio' ? 'Memanggil suara...' : 'Memanggil video...'}
              </p>
            </div>

            <p className="text-[11px] text-slate-400">
              Fitur panggilan LovyChat tersambung via WebRTC signal channel.
            </p>

            <button
              onClick={() => setCallModal(null)}
              className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition"
            >
              Akhiri Panggilan
            </button>
          </div>
        </div>
      )}

      {/* Direct Block Confirmation Modal in Chat Detail */}
      {showBlockConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-center border border-slate-100">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">Blokir {recipient.displayName}?</h3>
              <p className="text-xs text-slate-500">
                Pengguna ini tidak akan dapat mengirimi Anda pesan atau panggilan. Percakapan akan disembunyikan dari daftar obrolan Anda demi privasi.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 text-left space-y-1.5 border border-slate-100 text-[11px] text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Pesan masuk baru akan diblokir otomatis.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Status online Anda tidak akan terlihat olehnya.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Dapat dipulihkan kapan saja di menu Profil.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowBlockConfirm(false)}
                disabled={blockLoading}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  setBlockLoading(true);
                  try {
                    await blockUser(recipientUid);
                    setShowBlockConfirm(false);
                  } catch (err) {
                    console.error('Failed to block user:', err);
                  } finally {
                    setBlockLoading(false);
                  }
                }}
                disabled={blockLoading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {blockLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserX className="w-3.5 h-3.5" />
                )}
                <span>Ya, Blokir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
