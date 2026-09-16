import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Gender } from '../types';
import { LovyChatIcon } from './LovyChatIcon';
import { 
  UserCheck, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  KeyRound, 
  CheckCircle2, 
  X, 
  Sparkles,
  UserPlus,
  AlertCircle,
  ArrowRight,
  Chrome
} from 'lucide-react';
import { getAuthErrorMessage } from '../utils/authErrors';

export const AuthModal: React.FC = () => {
  const { 
    loginWithEmail, 
    loginWithGoogle,
    registerWithEmail, 
    resetPassword, 
    savedAccounts, 
    removeSavedAccount 
  } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const deriveDisplayName = (input: string): string => {
    const raw = input.includes('@') ? input.split('@')[0] : input;
    const clean = raw.replace(/[._-]+/g, ' ').trim();
    if (!clean) return 'Pengguna LovyChat';
    return clean
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const isUnregisteredError = !!error && error.toLowerCase().includes('belum terdaftar');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    const cleanInput = emailOrId.trim();
    if (!cleanInput) {
      setError(isRegister ? 'Silakan masukkan alamat email Anda.' : 'Silakan masukkan alamat email atau ID LovyChat.');
      return;
    }

    if (!password) {
      setError('Silakan masukkan kata sandi.');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi harus terdiri dari minimal 6 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        const finalName = name.trim() || deriveDisplayName(cleanInput);
        await registerWithEmail(cleanInput, password, finalName, gender);
      } else {
        await loginWithEmail(cleanInput, password);
      }
    } catch (err: any) {
      console.warn('Authentication notice:', err?.message || err);
      const friendlyMsg = getAuthErrorMessage(err);
      setError(friendlyMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickRegisterNow = async () => {
    const cleanInput = emailOrId.trim();
    if (!cleanInput) {
      setError('Silakan masukkan alamat email.');
      return;
    }
    if (!password) {
      setIsRegister(true);
      setError('Silakan masukkan kata sandi minimal 6 karakter.');
      return;
    }
    if (password.length < 6) {
      setIsRegister(true);
      setError('Kata sandi harus terdiri dari minimal 6 karakter.');
      return;
    }

    const finalName = name.trim() || deriveDisplayName(cleanInput);
    setError(null);
    setSubmitting(true);
    try {
      await registerWithEmail(cleanInput, password, finalName, gender);
    } catch (err: any) {
      console.warn('Direct registration notice:', err?.message || err);
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessNotice(null);
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.warn('Google sign-in notice:', err?.message || err);
      setError(getAuthErrorMessage(err));
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleSelectSavedAccount = (accEmail: string) => {
    setEmailOrId(accEmail);
    setIsRegister(false);
    setError(null);
  };

  const handleSendResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = resetEmail.trim().toLowerCase();
    if (!clean) {
      setResetMessage({ text: 'Masukkan alamat email Anda.', isError: true });
      return;
    }

    setResetSubmitting(true);
    setResetMessage(null);
    try {
      await resetPassword(clean);
      setResetMessage({
        text: 'Tautan pemulihan kata sandi telah dikirim ke email Anda. Silakan periksa folder Masuk (Inbox) atau Spam.',
        isError: false
      });
    } catch (err: any) {
      setResetMessage({
        text: getAuthErrorMessage(err),
        isError: true
      });
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 p-5 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="w-16 h-16 mx-auto mb-2 shadow-lg rounded-2xl overflow-hidden flex items-center justify-center relative z-10">
            <LovyChatIcon size={64} withText={true} />
          </div>
          <h1 className="text-xl font-bold tracking-tight relative z-10">LovyChat</h1>
          <p className="text-emerald-100 text-xs mt-0.5 relative z-10">Obrolan Real-Time & Temukan Teman Baru</p>
        </div>

        <div className="p-4 sm:p-5 space-y-3.5">
          
          {/* Google Sign-In */}
          <button
            type="button"
            id="btn-google-sign-in"
            disabled={submitting || googleSubmitting}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-xs transition flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {googleSubmitting ? (
              <div className="w-4 h-4 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin shrink-0" />
            ) : (
              <Chrome className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{googleSubmitting ? 'Menghubungkan ke Akun Google...' : 'Masuk dengan Akun Google'}</span>
          </button>

          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2 text-[10px] uppercase font-bold text-slate-400 absolute">
              atau akun terdaftar
            </span>
          </div>

          {/* Saved accounts quick selector */}
          {savedAccounts && savedAccounts.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 px-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Akun Tersimpan di Perangkat:
                </span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {savedAccounts.slice(0, 3).map((acc) => (
                  <div
                    key={acc.email}
                    className="flex items-center justify-between p-1.5 hover:bg-white rounded-xl transition border border-transparent hover:border-slate-200 group text-left cursor-pointer"
                    onClick={() => handleSelectSavedAccount(acc.email)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={acc.avatarUrl}
                        alt={acc.displayName}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                          {acc.displayName}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {acc.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                        Pilih
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSavedAccount(acc.email);
                        }}
                        className="p-1 text-slate-300 hover:text-rose-500 rounded transition"
                        title="Hapus dari daftar ini"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Switcher: Masuk Email vs Daftar Baru */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              id="tab-login"
              onClick={() => { 
                setIsRegister(false); 
                setError(null); 
                setSuccessNotice(null); 
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                !isRegister ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              id="tab-register"
              onClick={() => { 
                setIsRegister(true); 
                setError(null); 
                setSuccessNotice(null);
                if (!name.trim() && emailOrId.trim()) {
                  setName(deriveDisplayName(emailOrId));
                }
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                isRegister ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar Baru
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            isUnregisteredError ? (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-950 text-xs space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900">Email Belum Terdaftar</p>
                    <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                      Akun dengan email <span className="font-semibold text-slate-900">{emailOrId}</span> belum terdaftar di sistem.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-amber-200/80">
                  <button
                    type="button"
                    id="btn-register-directly-now"
                    disabled={submitting}
                    onClick={handleQuickRegisterNow}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4 shrink-0" />
                    <span>{submitting ? 'Mendaftarkan Akun...' : 'Daftarkan Akun Ini Sekarang (1-Ketukan)'}</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegister(true);
                        setError(null);
                        if (!name.trim() && emailOrId.trim()) {
                          setName(deriveDisplayName(emailOrId));
                        }
                      }}
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Lengkapi Formulir Lengkap</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs space-y-2 animate-in fade-in duration-200">
                <p className="leading-relaxed font-medium">{error}</p>
                <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-rose-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setResetEmail(emailOrId.includes('@') ? emailOrId : '');
                      setResetMessage(null);
                    }}
                    className="text-[11px] font-bold text-rose-700 hover:underline flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Lupa Kata Sandi?</span>
                  </button>
                </div>
              </div>
            )
          )}

          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="leading-relaxed">{successNotice}</p>
            </div>
          )}

          {/* Primary Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap / Panggilan
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rina Anggraini"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-1.5 px-3 rounded-xl border text-xs font-medium transition ${
                        gender === 'female' 
                          ? 'bg-pink-50 border-pink-400 text-pink-700 font-semibold' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Perempuan ♀
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-1.5 px-3 rounded-xl border text-xs font-medium transition ${
                        gender === 'male' 
                          ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Laki-laki ♂
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isRegister ? 'Alamat Email' : 'Email atau ID LovyChat'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={isRegister ? 'email' : 'text'}
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  placeholder={isRegister ? 'nama@email.com' : 'nama@email.com atau ID'}
                  value={emailOrId}
                  onChange={(e) => {
                    setEmailOrId(e.target.value);
                    if (isRegister && !name.trim()) {
                      setName(deriveDisplayName(e.target.value));
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-emerald-500 transition"
                />
              </div>
              {!isRegister && (
                <p className="text-[10px] text-slate-400 mt-1 pl-1">
                  Bisa login dengan alamat email terdaftar atau LovyChat ID Anda.
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Kata Sandi
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setResetEmail(emailOrId.includes('@') ? emailOrId : '');
                      setResetMessage(null);
                    }}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Lupa Sandi?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 transition"
                  title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-auth-submit"
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition duration-150 disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
            >
              {isRegister ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{submitting ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>{submitting ? 'Memeriksa Akun...' : 'Masuk Sekarang'}</span>
                </>
              )}
            </button>

            {/* Quick helper toggle between login & register */}
            <div className="text-center pt-1">
              {!isRegister ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError(null);
                    if (!name.trim() && emailOrId.trim()) {
                      setName(deriveDisplayName(emailOrId));
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-emerald-700 transition"
                >
                  Belum punya akun? <span className="font-bold text-emerald-600 underline">Daftar di sini</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  className="text-xs text-slate-500 hover:text-emerald-700 transition"
                >
                  Sudah punya akun? <span className="font-bold text-emerald-600 underline">Masuk di sini</span>
                </button>
              )}
            </div>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Koneksi aman & terenkripsi end-to-end</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-2xl space-y-3 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <KeyRound className="w-4 h-4" />
                <span>Reset Kata Sandi</span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Masukkan alamat email Anda untuk menerima tautan pembuatan kata sandi baru.
            </p>

            {resetMessage && (
              <div className={`p-2.5 rounded-xl text-xs ${
                resetMessage.isError 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {resetMessage.text}
              </div>
            )}

            <form onSubmit={handleSendResetPassword} className="space-y-3">
              <div>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-emerald-500 transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {resetSubmitting ? 'Mengirim...' : 'Kirim Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
