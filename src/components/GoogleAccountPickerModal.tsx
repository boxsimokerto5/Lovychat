import React, { useState } from 'react';
import { SavedAccount } from '../context/AuthContext';
import { Check, Plus, User, X, ChevronRight, Sparkles } from 'lucide-react';

interface GoogleAccountPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, displayName: string, photoUrl?: string) => Promise<void>;
  savedAccounts: SavedAccount[];
}

export const GoogleAccountPickerModal: React.FC<GoogleAccountPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  savedAccounts,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddOther, setShowAddOther] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Primary detected device Google account
  const defaultGoogleAccount = {
    email: 'satesurabaya1101@gmail.com',
    displayName: 'Sate Surabaya',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  };

  // Additional Gmail accounts from saved history
  const otherGmailAccounts = savedAccounts.filter(
    acc => acc.email.toLowerCase().endsWith('@gmail.com') && 
           acc.email.toLowerCase() !== defaultGoogleAccount.email.toLowerCase()
  );

  const handlePickAccount = async (email: string, name: string, photo?: string) => {
    if (isProcessing) return;
    setSelectedEmail(email);
    setIsProcessing(true);
    setInputError(null);
    try {
      await onSelectAccount(email, name, photo);
      onClose();
    } catch (err: any) {
      console.warn('Google account selection notice:', err);
      setInputError(err?.message || 'Gagal masuk dengan akun Google.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customEmail.trim().toLowerCase();
    if (!clean) {
      setInputError('Silakan masukkan alamat email Google Anda.');
      return;
    }
    const finalEmail = clean.includes('@') ? clean : `${clean}@gmail.com`;
    const derivedName = customName.trim() || finalEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    handlePickAccount(finalEmail, derivedName);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={e => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div 
        id="google-account-picker-sheet"
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all duration-200 max-h-[90vh] flex flex-col"
      >
        {/* Android bottom sheet drag handle */}
        <div className="w-full pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Header with Google Multicolor Brand Logo */}
        <div className="px-6 pt-4 pb-3 flex items-start justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            {/* Google Multicolor "G" Logo */}
            <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center p-2 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Pilih akun Google</h2>
              <p className="text-xs text-slate-500">untuk melanjutkan ke <span className="font-semibold text-emerald-600">LovyChat</span></p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-google-picker"
            disabled={isProcessing}
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account List */}
        <div className="p-4 space-y-2 overflow-y-auto flex-1">
          {inputError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium animate-in fade-in">
              {inputError}
            </div>
          )}

          {/* Primary Device Account */}
          <button
            type="button"
            id="google-account-primary"
            disabled={isProcessing}
            onClick={() => handlePickAccount(defaultGoogleAccount.email, defaultGoogleAccount.displayName, defaultGoogleAccount.photoUrl)}
            className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 active:bg-slate-100 transition flex items-center justify-between group disabled:opacity-50"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-xs shrink-0 overflow-hidden ring-2 ring-blue-100">
                {defaultGoogleAccount.photoUrl ? (
                  <img 
                    src={defaultGoogleAccount.photoUrl} 
                    alt={defaultGoogleAccount.displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  defaultGoogleAccount.displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-700">
                  {defaultGoogleAccount.displayName}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {defaultGoogleAccount.email}
                </p>
              </div>
            </div>

            {selectedEmail === defaultGoogleAccount.email && isProcessing ? (
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center shrink-0 transition">
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
              </div>
            )}
          </button>

          {/* Additional saved accounts */}
          {otherGmailAccounts.map((acc, index) => (
            <button
              key={acc.email || index}
              type="button"
              id={`google-account-saved-${index}`}
              disabled={isProcessing}
              onClick={() => handlePickAccount(acc.email, acc.displayName, acc.avatarUrl)}
              className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 active:bg-slate-100 transition flex items-center justify-between group disabled:opacity-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold text-base flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                  {acc.avatarUrl ? (
                    <img 
                      src={acc.avatarUrl} 
                      alt={acc.displayName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    acc.displayName?.charAt(0).toUpperCase() || <User className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-700">
                    {acc.displayName || acc.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {acc.email}
                  </p>
                </div>
              </div>

              {selectedEmail === acc.email && isProcessing ? (
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center shrink-0 transition">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                </div>
              )}
            </button>
          ))}

          {/* Option to use another Google account */}
          {!showAddOther ? (
            <button
              type="button"
              id="btn-use-other-google-account"
              disabled={isProcessing}
              onClick={() => setShowAddOther(true)}
              className="w-full text-left p-3 rounded-2xl border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-slate-50 transition flex items-center gap-3 text-slate-700 disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Gunakan akun Google lain</span>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in fade-in">
              <p className="text-xs font-bold text-slate-700">Masukkan Akun Google Baru</p>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Email Google (@gmail.com)</label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  placeholder="nama.anda@gmail.com"
                  autoFocus
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Nama Tampilan (Opsional)</label>
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddOther(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !customEmail.trim()}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isProcessing ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  <span>Lanjutkan</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Google Security & Privacy Terms Footnote */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
          <p>
            Untuk melanjutkan, Google akan membagikan nama, alamat email, dan foto profil Anda kepada LovyChat. Sebelum menggunakan aplikasi ini, tinjau <span className="text-emerald-600 font-semibold cursor-pointer">Kebijakan Privasi</span> dan <span className="text-emerald-600 font-semibold cursor-pointer">Persyaratan Layanan</span> LovyChat.
          </p>
        </div>
      </div>
    </div>
  );
};
