import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Gender } from '../types';
import { AVATAR_PRESETS, compressImageFile } from '../utils/avatars';
import { 
  LogOut, 
  QrCode, 
  Copy, 
  Check, 
  ShieldCheck, 
  Edit3, 
  X, 
  Save,
  Share2,
  Sparkles,
  Upload,
  Loader2,
  UserX
} from 'lucide-react';
import { BlockedUsersModal } from './BlockedUsersModal';

export const ProfileView: React.FC = () => {
  const { userProfile, updateProfileData, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  // Edit state
  const [editName, setEditName] = useState(userProfile?.displayName || '');
  const [editBio, setEditBio] = useState(userProfile?.bio || '');
  const [editRegion, setEditRegion] = useState(userProfile?.region || '');
  const [editGender, setEditGender] = useState<Gender>(userProfile?.gender || 'unspecified');
  const [editAvatar, setEditAvatar] = useState(userProfile?.avatarUrl || AVATAR_PRESETS[0]);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadAvatar = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingAvatar(true);
    try {
      const dataUrl = await compressImageFile(file, 400, 400, 0.8);
      setEditAvatar(dataUrl);
    } catch (err) {
      console.error('Failed to compress avatar:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCopyId = () => {
    if (!userProfile) return;
    navigator.clipboard.writeText(userProfile.michatId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenEdit = () => {
    if (userProfile) {
      setEditName(userProfile.displayName);
      setEditBio(userProfile.bio);
      setEditRegion(userProfile.region);
      setEditGender(userProfile.gender);
      setEditAvatar(userProfile.avatarUrl);
    }
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfileData({
        displayName: editName.trim(),
        bio: editBio.trim(),
        region: editRegion.trim(),
        gender: editGender,
        avatarUrl: editAvatar
      });
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-y-auto">
      {/* Top Header */}
      <header className="bg-emerald-600 text-white px-4 py-3 sticky top-0 z-20 shadow-sm shrink-0">
        <h1 className="text-base font-bold tracking-tight">Profil Saya</h1>
      </header>

      <div className="p-3.5 space-y-3 flex-1">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={userProfile?.avatarUrl}
                alt={userProfile?.displayName}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500/30 shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800 truncate">{userProfile?.displayName}</h2>
                {userProfile?.gender === 'female' ? (
                  <span className="text-xs text-pink-600 font-bold">♀</span>
                ) : userProfile?.gender === 'male' ? (
                  <span className="text-xs text-blue-600 font-bold">♂</span>
                ) : null}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 font-mono">ID: {userProfile?.michatId}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 text-slate-400 hover:text-emerald-600 transition"
                  title="Salin ID LovyChat"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                Wilayah: {userProfile?.region || 'Indonesia'}
              </p>
            </div>

            <button
              onClick={() => setShowQrModal(true)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 text-slate-600 transition shrink-0"
              title="Tampilkan Kode QR"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Biodata:
            </span>
            <p className="text-xs text-slate-700 italic">
              "{userProfile?.bio || 'Belum ada biodata.'}"
            </p>
          </div>

          <button
            onClick={handleOpenEdit}
            className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profil & Ganti Foto</span>
          </button>
        </div>

        {/* Action Shortcuts */}
        <div className="bg-white rounded-3xl p-2 border border-slate-200/80 shadow-2xs divide-y divide-slate-100">
          <button
            onClick={() => setShowQrModal(true)}
            className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 rounded-2xl transition"
          >
            <div className="flex items-center gap-2.5 text-slate-700">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Kode QR Profil Saya</span>
            </div>
            <span className="text-[10px] text-slate-400">Tampilkan</span>
          </button>

          <button
            onClick={handleCopyId}
            className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 rounded-2xl transition"
          >
            <div className="flex items-center gap-2.5 text-slate-700">
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Salin ID untuk Ditambahkan Teman</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600">
              {copied ? 'Tersalin!' : userProfile?.michatId}
            </span>
          </button>

          <button
            onClick={() => setShowBlockedModal(true)}
            className="w-full px-3 py-3 flex items-center justify-between text-xs hover:bg-slate-50 rounded-2xl transition group"
          >
            <div className="flex items-center gap-2.5 text-slate-700">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-100 transition">
                <UserX className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-semibold block text-slate-800">Privasi & Pengguna Diblokir</span>
                <span className="text-[10px] text-slate-400 block">Kelola kontak yang Anda blokir</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                (userProfile?.blockedUsers?.length || 0) > 0 
                  ? 'bg-rose-100 text-rose-700' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {userProfile?.blockedUsers?.length || 0} diblokir
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Buka</span>
            </div>
          </button>
        </div>

        {/* Security & Account Info */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs divide-y divide-slate-100 space-y-1">
          <div className="py-2 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Status Akun</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi Aman
            </span>
          </div>

          <div className="py-2 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Email Terdaftar</span>
            <span className="text-slate-500 font-mono text-[11px] truncate max-w-[180px]">{userProfile?.email}</span>
          </div>

          <div className="py-2 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Keamanan Jaringan</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Terenkripsi & Real-Time
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full py-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 rounded-3xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </button>
      </div>

      {/* Modal: QR Code */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Kode QR Profil LovyChat</span>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block">
              <div className="w-44 h-44 bg-white p-2 border border-slate-200 rounded-xl flex items-center justify-center relative">
                <div className="grid grid-cols-6 gap-1 w-full h-full opacity-80">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35
                          ? 'bg-slate-900'
                          : i % 5 === 0
                          ? 'bg-emerald-600'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={userProfile?.avatarUrl}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800">{userProfile?.displayName}</p>
              <p className="text-[11px] text-slate-400 font-mono">ID: {userProfile?.michatId}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Pindai kode QR ini untuk menambahkanku sebagai teman di LovyChat.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Profil */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Edit Profil</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              {/* Choose avatar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Foto Profil (Unggah atau Pilih):</label>
                
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadAvatar(file);
                    e.target.value = '';
                  }}
                />

                <div className="grid grid-cols-6 gap-2 items-center">
                  {/* Custom upload avatar */}
                  <button
                    type="button"
                    disabled={uploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleUploadAvatar(file);
                    }}
                    className="flex flex-col items-center justify-center w-11 h-11 rounded-full border-2 border-dashed border-emerald-500 hover:bg-emerald-50 text-emerald-700 transition"
                    title="Unggah foto profil dari HP/PC"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    ) : (
                      <Upload className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatar(url)}
                      className={`relative rounded-full overflow-hidden border-2 transition ${
                        editAvatar === url ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-transparent'
                      }`}
                    >
                      <img src={url} alt="" className="w-11 h-11 object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditGender('female')}
                    className={`py-1.5 px-3 rounded-xl border text-xs font-medium transition ${
                      editGender === 'female' ? 'bg-pink-50 border-pink-400 text-pink-700 font-semibold' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Perempuan ♀
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditGender('male')}
                    className={`py-1.5 px-3 rounded-xl border text-xs font-medium transition ${
                      editGender === 'male' ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Laki-laki ♂
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Wilayah / Kota</label>
                <input
                  type="text"
                  value={editRegion}
                  onChange={(e) => setEditRegion(e.target.value)}
                  placeholder="Contoh: Jakarta Selatan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Biodata</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-emerald-500 resize-none transition"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Blocked Users */}
      <BlockedUsersModal
        isOpen={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
      />
    </div>
  );
};
