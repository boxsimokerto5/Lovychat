import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { BottleMessage } from '../types';
import { formatTimestamp } from '../utils/avatars';
import { 
  Waves, 
  Send, 
  MessageCircle, 
  X, 
  CheckCircle2,
  Anchor
} from 'lucide-react';

interface BottleViewProps {
  onStartChatWithUserId: (userId: string, senderName: string, avatarUrl: string, greetingPrefix?: string) => void;
}

export const BottleView: React.FC<BottleViewProps> = ({ onStartChatWithUserId }) => {
  const { user, userProfile } = useAuth();
  const [bottlesCount, setBottlesCount] = useState<number>(0);
  const [isThrowing, setIsThrowing] = useState(false);
  const [throwText, setThrowText] = useState('');
  const [isFishing, setIsFishing] = useState(false);
  const [fishedBottle, setFishedBottle] = useState<BottleMessage | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [emptySeaMessage, setEmptySeaMessage] = useState<string | null>(null);

  // Check sea bottles count
  useEffect(() => {
    if (!user) return;
    const checkSea = async () => {
      try {
        const bottles = await api.getBottles();
        setBottlesCount(bottles.length);
      } catch (err) {
        console.error('Failed to count bottles:', err);
        setBottlesCount(0);
      }
    };
    checkSea();
  }, [user]);

  const handleThrowBottle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!throwText.trim() || !user || !userProfile) return;

    try {
      await api.throwBottle({
        senderId: user.uid,
        senderName: userProfile.displayName,
        senderAvatar: userProfile.avatarUrl,
        senderGender: userProfile.gender,
        content: throwText.trim(),
      });

      setThrowText('');
      setIsThrowing(false);
      setShowSuccessToast(true);
      setBottlesCount((prev) => prev + 1);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      console.error('Failed to throw bottle:', err);
    }
  };

  const handleFishBottle = async () => {
    if (!user) return;
    setIsFishing(true);
    setEmptySeaMessage(null);
    setFishedBottle(null);

    try {
      // Gentle realistic animation delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const bottles = await api.getBottles();
      const availableBottles: BottleMessage[] = [];
      let myBottlesCount = 0;

      bottles.forEach((b) => {
        if (b.senderId !== user.uid) {
          availableBottles.push(b);
        } else {
          myBottlesCount++;
        }
      });

      if (availableBottles.length > 0) {
        const randomBottle = availableBottles[Math.floor(Math.random() * availableBottles.length)];
        setFishedBottle(randomBottle);
      } else if (myBottlesCount > 0) {
        setEmptySeaMessage('Saat ini hanya botol yang kamu hanyutkan yang ada di laut. Bagikan aplikasi agar orang lain ikut melempar pesan!');
      } else {
        setEmptySeaMessage('Lautan masih tenang. Jadilah yang pertama melemparkan pesan dalam botol hari ini!');
      }
    } catch (err) {
      console.error('Failed to fish bottle:', err);
      setEmptySeaMessage('Gagal menjaring botol. Periksa koneksi internet Anda.');
    } finally {
      setIsFishing(false);
    }
  };

  const handleReplyToBottle = () => {
    if (!fishedBottle) return;
    onStartChatWithUserId(
      fishedBottle.senderId,
      fishedBottle.senderName,
      fishedBottle.senderAvatar,
      `Halo ${fishedBottle.senderName}! Aku menemukan botolmu di laut: "${fishedBottle.content}" 🍾🌊`
    );
    setFishedBottle(null);
  };

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-sky-400 via-teal-500 to-emerald-700 text-white relative overflow-hidden">
      {/* Decorative Ocean Waves & Atmospheric Shapes */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-6 w-24 h-10 bg-white/40 rounded-full blur-xs" />
        <div className="absolute top-20 right-8 w-32 h-12 bg-white/30 rounded-full blur-xs" />
        <div className="absolute bottom-16 left-0 right-0 h-32 bg-white/10 [mask-image:linear-gradient(to_top,white,transparent)]" />
      </div>

      {/* Header Info */}
      <div className="p-4 z-10 text-center space-y-1 shrink-0">
        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
          <Waves className="w-4 h-4 text-cyan-200" />
          <span>Lautan Pesan LovyChat</span>
        </div>
        <p className="text-[11px] text-teal-100">
          Lempar ceritamu ke laut bebas atau pancing pesan dari teman baru.
        </p>
      </div>

      {/* Ocean Centerpiece */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 text-center relative">
        <div className={`relative transition-transform duration-700 ${isFishing ? 'scale-110' : ''}`}>
          <div className="w-32 h-32 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl animate-pulse">
            <div className="text-6xl select-none transform -rotate-12 hover:rotate-0 transition duration-300">
              🍾
            </div>
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/25 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs whitespace-nowrap">
            {bottlesCount} Botol Terapung
          </span>
        </div>

        {isFishing && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-teal-100 animate-bounce">
              Menjaring botol dari lautan luas...
            </p>
          </div>
        )}

        {emptySeaMessage && !isFishing && (
          <div className="mt-4 bg-white/20 backdrop-blur-md p-3.5 rounded-2xl max-w-xs text-xs text-teal-50 border border-white/20 leading-relaxed shadow-sm">
            {emptySeaMessage}
          </div>
        )}
      </div>

      {/* Floating Success Toast */}
      {showSuccessToast && (
        <div className="absolute top-16 left-4 right-4 z-30 bg-emerald-800/90 backdrop-blur-md border border-emerald-400/30 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Botolmu berhasil dihanyutkan ke lautan bebas! Semoga lekas ditemukan.</span>
        </div>
      )}

      {/* Bottom Action Controls */}
      <div className="p-4 z-10 space-y-2.5 shrink-0">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsThrowing(true)}
            disabled={isFishing}
            className="py-3 px-4 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl text-xs font-extrabold shadow-lg transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-emerald-600" />
            <span>Lempar Botol</span>
          </button>

          <button
            onClick={handleFishBottle}
            disabled={isFishing}
            className="py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl text-xs font-extrabold shadow-lg transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Anchor className="w-4 h-4 text-cyan-100" />
            <span>Pancing Botol</span>
          </button>
        </div>
      </div>

      {/* Modal Throw Bottle */}
      {isThrowing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-slate-800">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍾</span>
                <h3 className="font-bold text-sm text-slate-800">Hanyutkan Pesan Botol</h3>
              </div>
              <button
                onClick={() => setIsThrowing(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleThrowBottle} className="space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Tuliskan pesan motivasi, salam perkenalan, atau hal yang sedang kamu pikirkan:
              </p>
              <textarea
                rows={4}
                required
                maxLength={300}
                placeholder="Tulis pesan botolmu di sini..."
                value={throwText}
                onChange={(e) => setThrowText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:bg-white focus:outline-emerald-500 transition resize-none"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Anonim di laut lepas</span>
                <span>{throwText.length}/300</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsThrowing(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!throwText.trim()}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Lempar ke Laut</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Fished Bottle Result */}
      {fishedBottle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-slate-800">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 relative text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto border-2 border-amber-200 text-3xl shadow-inner">
              📜
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Botol Terpancing!
              </span>
              <h3 className="font-bold text-base text-slate-800 mt-2">Pesan dari Laut Lepas</h3>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 text-xs text-slate-700 italic leading-relaxed text-left relative">
              "{fishedBottle.content}"
              <div className="mt-3 pt-2 border-t border-amber-200/50 flex items-center justify-between text-[10px] text-slate-500 not-italic">
                <span className="font-medium text-slate-700">{fishedBottle.senderName}</span>
                <span>{formatTimestamp(fishedBottle.createdAt)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setFishedBottle(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                Hanyutkan Lagi
              </button>
              <button
                onClick={handleReplyToBottle}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Balas Pesan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
