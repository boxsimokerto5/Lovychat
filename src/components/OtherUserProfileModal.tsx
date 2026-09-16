import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  MessageSquare, 
  ShieldAlert, 
  ShieldCheck, 
  Copy, 
  Check, 
  MapPin, 
  UserX,
  AlertTriangle
} from 'lucide-react';

interface OtherUserProfileModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: (user: UserProfile) => void;
  onUserBlocked?: () => void;
}

export const OtherUserProfileModal: React.FC<OtherUserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onStartChat,
  onUserBlocked
}) => {
  const { userProfile, blockUser, unblockUser, isUserBlocked } = useAuth();
  const [showConfirmBlock, setShowConfirmBlock] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  if (!isOpen || !user) return null;

  const blocked = isUserBlocked(user.uid);

  const handleCopyId = () => {
    if (!user.michatId) return;
    navigator.clipboard.writeText(user.michatId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBlockConfirm = async () => {
    setLoadingAction(true);
    try {
      await blockUser(user.uid);
      setShowConfirmBlock(false);
      if (onUserBlocked) {
        onUserBlocked();
      }
    } catch (err) {
      console.error('Failed to block user:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUnblock = async () => {
    setLoadingAction(true);
    try {
      await unblockUser(user.uid);
    } catch (err) {
      console.error('Failed to unblock user:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-center relative border border-slate-100 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Avatar */}
        <div className="relative w-24 h-24 mx-auto mt-1">
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className={`w-24 h-24 rounded-full object-cover ring-4 shadow-md transition ${
              blocked ? 'ring-rose-200 grayscale-40' : 'ring-emerald-100'
            }`}
          />
          {user.isOnline && !blocked && (
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          )}
          {blocked && (
            <span className="absolute bottom-1 right-1 w-6 h-6 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-white" title="Diblokir">
              <UserX className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center justify-center gap-1.5">
            <h3 className="font-bold text-slate-800 text-lg">{user.displayName}</h3>
            {user.gender === 'female' ? (
              <span className="text-xs text-pink-600 font-bold bg-pink-50 px-1.5 py-0.5 rounded-md">♀</span>
            ) : user.gender === 'male' ? (
              <span className="text-xs text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded-md">♂</span>
            ) : null}
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-1">
            <span className="text-xs text-slate-500 font-mono">ID: {user.michatId}</span>
            <button
              onClick={handleCopyId}
              className="p-1 text-slate-400 hover:text-emerald-600 transition"
              title="Salin ID"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          {user.region && (
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>{user.region}</span>
            </p>
          )}

          <div className="text-xs text-slate-600 mt-3 bg-slate-50 p-3 rounded-2xl italic leading-relaxed border border-slate-100">
            "{user.bio || 'Hai, senang berkenalan di LovyChat!'}"
          </div>
        </div>

        {/* Blocked Alert Banner */}
        {blocked && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-2xl text-xs flex items-center gap-2 text-left">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="leading-snug">
              Pengguna ini telah diblokir. Obrolan disembunyikan dan pesan dari pengguna ini tidak akan masuk.
            </span>
          </div>
        )}

        {/* Block Confirmation Dialog */}
        {showConfirmBlock ? (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-left space-y-2.5 animate-in fade-in">
            <div className="flex items-start gap-2 text-xs text-rose-900 font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>Konfirmasi Blokir Pengguna?</span>
            </div>
            <p className="text-[11px] text-rose-700 leading-relaxed">
              Anda tidak akan menerima pesan dari <strong>{user.displayName}</strong> dan riwayat obrolan akan disembunyikan dari daftar obrolan Anda.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmBlock(false)}
                disabled={loadingAction}
                className="flex-1 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBlockConfirm}
                disabled={loadingAction}
                className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                {loadingAction ? 'Memproses...' : 'Ya, Blokir'}
              </button>
            </div>
          </div>
        ) : (
          /* Action Buttons */
          <div className="space-y-2 pt-1">
            {!blocked && onStartChat && (
              <button
                onClick={() => {
                  onClose();
                  onStartChat(user);
                }}
                className="w-full py-2.5 rounded-2xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Kirim Pesan</span>
              </button>
            )}

            {blocked ? (
              <button
                onClick={handleUnblock}
                disabled={loadingAction}
                className="w-full py-2.5 rounded-2xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{loadingAction ? 'Membuka...' : 'Buka Blokir Pengguna'}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmBlock(true)}
                className="w-full py-2 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition flex items-center justify-center gap-1.5"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Blokir Pengguna</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
