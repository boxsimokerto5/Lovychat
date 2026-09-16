import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import { 
  X, 
  ShieldCheck, 
  UserX, 
  Trash2, 
  Loader2, 
  Shield 
} from 'lucide-react';

interface BlockedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlockedUsersModal: React.FC<BlockedUsersModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, unblockUser } = useAuth();
  const [blockedList, setBlockedList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [unblockingUid, setUnblockingUid] = useState<string | null>(null);

  const blockedUids = userProfile?.blockedUsers || [];

  useEffect(() => {
    if (!isOpen) return;

    const fetchBlockedDetails = async () => {
      setLoading(true);
      try {
        if (blockedUids.length === 0) {
          setBlockedList([]);
          return;
        }

        const profiles: UserProfile[] = [];
        for (const uid of blockedUids) {
          try {
            const userProfileData = await api.getUser(uid);
            if (userProfileData) {
              profiles.push(userProfileData);
            } else {
              profiles.push({
                uid,
                michatId: 'user_' + uid.substring(0, 6),
                displayName: 'Pengguna LovyChat',
                email: '',
                avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
                bio: '',
                gender: 'unspecified',
                region: '',
                isOnline: false,
                lastSeen: null,
                createdAt: null
              });
            }
          } catch (e) {
            profiles.push({
              uid,
              michatId: 'user_' + uid.substring(0, 6),
              displayName: 'Pengguna LovyChat',
              email: '',
              avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
              bio: '',
              gender: 'unspecified',
              region: '',
              isOnline: false,
              lastSeen: null,
              createdAt: null
            });
          }
        }
        setBlockedList(profiles);
      } catch (err) {
        console.error('Failed to load blocked users list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedDetails();
  }, [isOpen, blockedUids.length]);

  if (!isOpen) return null;

  const handleUnblock = async (uid: string) => {
    setUnblockingUid(uid);
    try {
      await unblockUser(uid);
      setBlockedList(prev => prev.filter(u => u.uid !== uid));
    } catch (err) {
      console.error('Failed to unblock user:', err);
    } finally {
      setUnblockingUid(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] relative border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Daftar Pengguna Diblokir</h3>
              <p className="text-[11px] text-slate-400">{blockedUids.length} pengguna diblokir</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs">Memuat daftar blokir...</span>
            </div>
          ) : blockedList.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">Tidak Ada Pengguna Diblokir</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Anda belum memblokir siapa pun. Obrolan dan pesan tetap berjalan normal.
              </p>
            </div>
          ) : (
            blockedList.map((target) => (
              <div
                key={target.uid}
                className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-3 flex items-center justify-between gap-3 border border-slate-100 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={target.avatarUrl}
                    alt={target.displayName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{target.displayName}</h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">ID: {target.michatId}</p>
                    <span className="text-[9px] text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.5 rounded-sm inline-block mt-0.5">
                      Obrolan disembunyikan
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUnblock(target.uid)}
                  disabled={unblockingUid === target.uid}
                  className="shrink-0 px-3 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-emerald-700 rounded-xl text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
                >
                  {unblockingUid === target.uid ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>Buka Blokir</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center shrink-0">
          Membuka blokir akan memulihkan obrolan dan mengizinkan pesan kembali.
        </div>
      </div>
    </div>
  );
};
