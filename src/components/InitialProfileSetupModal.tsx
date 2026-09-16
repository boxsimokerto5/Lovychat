import React, { useState, useRef } from 'react';
import { UserProfile, Gender } from '../types';
import { useAuth } from '../context/AuthContext';
import { AVATAR_PRESETS } from '../utils/avatars';
import { Sparkles, Check, Upload, Loader2, Camera, MapPin, User } from 'lucide-react';
import { uploadImageToImgBB } from '../utils/imgbb';

interface InitialProfileSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const InitialProfileSetupModal: React.FC<InitialProfileSetupModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const { userProfile, updateProfileData } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [gender, setGender] = useState<Gender>(() => {
    if (userProfile?.gender && (userProfile.gender === 'female' || userProfile.gender === 'male')) {
      return userProfile.gender;
    }
    return 'female';
  });

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [region, setRegion] = useState(userProfile?.region || 'Indonesia');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl || AVATAR_PRESETS[0]);
  const [bio, setBio] = useState(userProfile?.bio || 'Hai, salam kenal di LovyChat!');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !userProfile) return null;

  const handleUploadAvatar = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Format file harus berupa gambar (JPG, PNG, WebP).');
      return;
    }
    setUploadingAvatar(true);
    setErrorMsg(null);
    try {
      const uploadedUrl = await uploadImageToImgBB(file);
      setAvatarUrl(uploadedUrl);
    } catch (err: any) {
      console.warn('Gagal mengunggah foto profil, gunakan preset:', err);
      // Fallback local reader
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender || (gender !== 'female' && gender !== 'male')) {
      setErrorMsg('Silakan pilih jenis kelamin Anda terlebih dahulu.');
      return;
    }

    if (!displayName.trim()) {
      setErrorMsg('Nama profil tidak boleh kosong.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      await updateProfileData({
        gender,
        displayName: displayName.trim(),
        avatarUrl,
        region: region.trim() || 'Indonesia',
        bio: bio.trim(),
      });

      // Mark that gender and initial profile have been chosen and confirmed
      try {
        localStorage.setItem(`lovy_gender_confirmed_${userProfile.uid}`, 'true');
        localStorage.removeItem('lovy_just_google_logged_in');
      } catch (e) {}

      onComplete();
    } catch (err: any) {
      console.error('Gagal menyimpan profil awal:', err);
      setErrorMsg(err?.message || 'Gagal menyimpan profil. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="initial-profile-setup-modal"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header with LovyChat gradient bar */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white px-5 pt-5 pb-4 text-center relative shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-[11px] font-semibold mb-1 backdrop-blur-xs border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Pengaturan Akun Baru</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Lengkapi Profil Anda
          </h2>
          <p className="text-xs text-emerald-100/90 max-w-xs mx-auto mt-0.5 leading-relaxed">
            Pilih jenis kelamin Anda agar radar teman sekitar dapat mencocokkan profil dengan tepat.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* 1. GENDER SELECTION (Primary Feature) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Pilih Jenis Kelamin <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Jenis kelamin akan digunakan untuk filter radar pencarian teman sekitar.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Option: Perempuan */}
              <button
                type="button"
                id="select-gender-female"
                onClick={() => {
                  setGender('female');
                  // If current avatar is default male, gently recommend female preset if user hasn't uploaded custom photo
                  if (!userProfile.avatarUrl?.includes('googleusercontent.com') && !avatarUrl.startsWith('data:')) {
                    setAvatarUrl(AVATAR_PRESETS[0]);
                  }
                }}
                className={`relative p-3.5 rounded-2xl border-2 text-left transition flex flex-col items-center gap-2 text-center group ${
                  gender === 'female'
                    ? 'border-pink-500 bg-pink-50/70 text-pink-900 shadow-sm ring-2 ring-pink-200'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-xs transition ${
                  gender === 'female'
                    ? 'bg-pink-500 text-white shadow-pink-200'
                    : 'bg-white text-pink-600 border border-slate-200'
                }`}>
                  ♀
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">Perempuan</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Wanita</p>
                </div>
                {gender === 'female' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* Option: Laki-laki */}
              <button
                type="button"
                id="select-gender-male"
                onClick={() => {
                  setGender('male');
                  // If current avatar is default female, gently recommend male preset if user hasn't uploaded custom photo
                  if (!userProfile.avatarUrl?.includes('googleusercontent.com') && !avatarUrl.startsWith('data:')) {
                    setAvatarUrl(AVATAR_PRESETS[1]);
                  }
                }}
                className={`relative p-3.5 rounded-2xl border-2 text-left transition flex flex-col items-center gap-2 text-center group ${
                  gender === 'male'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-sm ring-2 ring-blue-200'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-xs transition ${
                  gender === 'male'
                    ? 'bg-blue-600 text-white shadow-blue-200'
                    : 'bg-white text-blue-600 border border-slate-200'
                }`}>
                  ♂
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">Laki-laki</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pria</p>
                </div>
                {gender === 'male' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* 2. AVATAR & PHOTO SELECTION */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800">
              Foto Profil
            </label>

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md ring-2 ring-emerald-100">
                  <img
                    src={avatarUrl}
                    alt="Foto Profil"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 transition"
                  title="Ganti Foto Profil"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
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
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50 text-xs font-semibold text-slate-700 hover:text-emerald-800 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>{uploadingAvatar ? 'Mengunggah...' : 'Unggah Foto dari HP'}</span>
                </button>
                <p className="text-[10px] text-slate-400 mt-1">
                  Atau pilih avatar bawaan di bawah ini:
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 overflow-x-auto py-1.5 no-scrollbar">
              {AVATAR_PRESETS.slice(0, 6).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(preset)}
                  className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 transition ${
                    avatarUrl === preset
                      ? 'border-emerald-600 ring-2 ring-emerald-300 scale-105'
                      : 'border-slate-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* 3. DISPLAY NAME & REGION */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nama Panggilan / Tampilan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Masukkan nama panggilan Anda"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Kota / Wilayah
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Misal: Jakarta, Surabaya, Bandung..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Status / Bio Singkat (Opsional)
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Misal: Hai, salam kenal di LovyChat!"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              id="btn-save-initial-profile"
              disabled={saving}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Profil...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Simpan & Mulai Cari Teman</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
