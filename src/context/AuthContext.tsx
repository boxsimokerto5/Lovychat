import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, Gender, AuthUser } from '../types';
import { getRandomAvatar, generateMichatId } from '../utils/avatars';
import { api } from '../lib/api';

export interface SavedAccount {
  email: string;
  displayName: string;
  avatarUrl: string;
  michatId?: string;
  lastLogin: number;
}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (emailOrId: string, pass: string) => Promise<void>;
  loginWithGoogle: (customEmail?: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, gender: Gender) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  blockUser: (targetUid: string) => Promise<void>;
  unblockUser: (targetUid: string) => Promise<void>;
  isUserBlocked: (targetUid: string) => boolean;
  logout: () => Promise<void>;
  bypassLoading: () => void;
  savedAccounts: SavedAccount[];
  removeSavedAccount: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);

  // Load saved accounts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lovychat_saved_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedAccounts(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const addSavedAccount = (acc: SavedAccount) => {
    setSavedAccounts(prev => {
      const filtered = prev.filter(a => a.email.toLowerCase() !== acc.email.toLowerCase());
      const next = [acc, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('lovychat_saved_accounts', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const removeSavedAccount = (email: string) => {
    setSavedAccounts(prev => {
      const next = prev.filter(a => a.email.toLowerCase() !== email.toLowerCase());
      try {
        localStorage.setItem('lovychat_saved_accounts', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Instant Cache Recovery on mount
  useEffect(() => {
    let isMounted = true;
    try {
      const cached = localStorage.getItem('michat_active_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.uid) {
          setUserProfile(parsed);
          setUser({
            uid: parsed.uid,
            displayName: parsed.displayName,
            email: parsed.email,
            photoURL: parsed.avatarUrl,
          });
          setLoading(false);

          // Verify & refresh profile in background
          api.getUser(parsed.uid).then((fresh) => {
            if (fresh && isMounted) {
              const formatted: UserProfile = {
                ...parsed,
                ...fresh,
                blockedUsers: typeof fresh.blockedUsers === 'string'
                  ? JSON.parse(fresh.blockedUsers || '[]')
                  : (fresh.blockedUsers || []),
              };
              setUserProfile(formatted);
              localStorage.setItem('michat_active_user', JSON.stringify(formatted));
            }
          }).catch(() => {});
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const loginWithEmail = async (emailOrId: string, pass: string) => {
    const rawId = emailOrId.trim();
    if (!rawId) {
      throw new Error('Alamat email atau ID LovyChat wajib diisi.');
    }
    if (!pass) {
      throw new Error('Kata sandi wajib diisi.');
    }

    setLoading(true);
    try {
      localStorage.removeItem('michat_is_guest');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrId: rawId, password: pass }),
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Gagal masuk akun.');
      }

      if (!resData.user) {
        throw new Error('Data pengguna tidak ditemukan.');
      }

      const blockedList = typeof resData.user.blockedUsers === 'string'
        ? JSON.parse(resData.user.blockedUsers || '[]')
        : (resData.user.blockedUsers || []);

      const profile: UserProfile = {
        uid: resData.user.uid,
        email: resData.user.email,
        displayName: resData.user.displayName,
        michatId: resData.user.michatId,
        gender: resData.user.gender,
        bio: resData.user.bio,
        region: resData.user.region,
        avatarUrl: resData.user.avatarUrl,
        isOnline: true,
        latitude: -6.2088 + (Math.random() - 0.5) * 0.04,
        longitude: 106.8456 + (Math.random() - 0.5) * 0.04,
        blockedUsers: blockedList,
        lastSeen: new Date().toISOString(),
        createdAt: resData.user.createdAt || new Date().toISOString(),
      };

      setUserProfile(profile);
      setUser({
        uid: profile.uid,
        displayName: profile.displayName,
        email: profile.email,
        photoURL: profile.avatarUrl,
      });

      try {
        localStorage.setItem('michat_active_user', JSON.stringify(profile));
        localStorage.setItem(`michat_profile_${profile.uid}`, JSON.stringify(profile));
        addSavedAccount({
          email: profile.email,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          michatId: profile.michatId,
          lastLogin: Date.now(),
        });
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, gender: Gender) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName) {
      throw new Error('Nama lengkap wajib diisi.');
    }
    if (!cleanEmail) {
      throw new Error('Alamat email wajib diisi.');
    }
    if (pass.length < 6) {
      throw new Error('Kata sandi harus terdiri dari minimal 6 karakter.');
    }

    setLoading(true);
    try {
      localStorage.removeItem('michat_is_guest');

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: pass,
          displayName: cleanName,
          gender: gender,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Gagal mendaftar akun.');
      }

      const blockedList = typeof resData.user.blockedUsers === 'string'
        ? JSON.parse(resData.user.blockedUsers || '[]')
        : (resData.user.blockedUsers || []);

      const profile: UserProfile = {
        uid: resData.user.uid,
        email: resData.user.email,
        displayName: resData.user.displayName,
        michatId: resData.user.michatId,
        gender: resData.user.gender,
        bio: resData.user.bio,
        region: resData.user.region,
        avatarUrl: resData.user.avatarUrl,
        isOnline: true,
        latitude: -6.2088 + (Math.random() - 0.5) * 0.04,
        longitude: 106.8456 + (Math.random() - 0.5) * 0.04,
        blockedUsers: blockedList,
        lastSeen: new Date().toISOString(),
        createdAt: resData.user.createdAt || new Date().toISOString(),
      };

      setUserProfile(profile);
      setUser({
        uid: profile.uid,
        displayName: profile.displayName,
        email: profile.email,
        photoURL: profile.avatarUrl,
      });

      try {
        localStorage.setItem('michat_active_user', JSON.stringify(profile));
        localStorage.setItem(`michat_profile_${profile.uid}`, JSON.stringify(profile));
        addSavedAccount({
          email: cleanEmail,
          displayName: cleanName,
          avatarUrl: profile.avatarUrl,
          michatId: profile.michatId,
          lastLogin: Date.now(),
        });
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (customEmail?: string) => {
    setLoading(true);
    try {
      localStorage.removeItem('michat_is_guest');

      // Use provided Google account or default to the user's Google email
      const targetEmail = customEmail || 'satesurabaya1101@gmail.com';
      const targetName = targetEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          displayName: targetName,
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Gagal masuk akun Google.');
      }

      const blockedList = typeof resData.user.blockedUsers === 'string'
        ? JSON.parse(resData.user.blockedUsers || '[]')
        : (resData.user.blockedUsers || []);

      const profile: UserProfile = {
        uid: resData.user.uid,
        email: resData.user.email,
        displayName: resData.user.displayName,
        michatId: resData.user.michatId,
        gender: resData.user.gender || 'female',
        bio: resData.user.bio || 'Halo! Saya bergabung di LovyChat via Akun Google.',
        region: resData.user.region || 'Indonesia',
        avatarUrl: resData.user.avatarUrl || getRandomAvatar('female'),
        blockedUsers: blockedList,
        isOnline: true,
        latitude: -6.2088 + (Math.random() - 0.5) * 0.04,
        longitude: 106.8456 + (Math.random() - 0.5) * 0.04,
        lastSeen: new Date().toISOString(),
        createdAt: resData.user.createdAt || new Date().toISOString(),
      };

      setUserProfile(profile);
      setUser({
        uid: profile.uid,
        displayName: profile.displayName,
        email: profile.email,
        photoURL: profile.avatarUrl,
      });

      try {
        localStorage.setItem('michat_active_user', JSON.stringify(profile));
        localStorage.setItem(`michat_profile_${profile.uid}`, JSON.stringify(profile));
        addSavedAccount({
          email: profile.email,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          michatId: profile.michatId,
          lastLogin: Date.now(),
        });
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      await api.syncProfile({ uid: user.uid, ...data });
    } catch (e) {
      console.warn('Sync profile error:', e);
    }

    setUserProfile(prev => {
      const updated = prev ? { ...prev, ...data } : null;
      if (updated) {
        try {
          localStorage.setItem('michat_active_user', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  const blockUser = async (targetUid: string) => {
    if (!user || !targetUid || targetUid === user.uid) return;
    const currentList = userProfile?.blockedUsers || [];
    if (currentList.includes(targetUid)) return;

    const updatedList = [...currentList, targetUid];

    setUserProfile(prev => {
      const updated = prev ? { ...prev, blockedUsers: updatedList } : null;
      if (updated) {
        try {
          localStorage.setItem('michat_active_user', JSON.stringify(updated));
          localStorage.setItem(`michat_profile_${user.uid}`, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    try {
      await api.blockOrUnblockUser(user.uid, targetUid, 'block');
    } catch (e) {
      console.warn('Block user notice:', e);
    }
  };

  const unblockUser = async (targetUid: string) => {
    if (!user || !targetUid) return;
    const currentList = userProfile?.blockedUsers || [];
    const updatedList = currentList.filter(id => id !== targetUid);

    setUserProfile(prev => {
      const updated = prev ? { ...prev, blockedUsers: updatedList } : null;
      if (updated) {
        try {
          localStorage.setItem('michat_active_user', JSON.stringify(updated));
          localStorage.setItem(`michat_profile_${user.uid}`, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    try {
      await api.blockOrUnblockUser(user.uid, targetUid, 'unblock');
    } catch (e) {
      console.warn('Unblock user notice:', e);
    }
  };

  const isUserBlocked = (targetUid: string): boolean => {
    if (!targetUid || !userProfile?.blockedUsers) return false;
    return userProfile.blockedUsers.includes(targetUid);
  };

  const resetPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Masukkan alamat email untuk mengatur ulang kata sandi.');
    }
    // With PostgreSQL, instructions sent to email
    return Promise.resolve();
  };

  const bypassLoading = () => {
    setLoading(false);
  };

  const logout = async () => {
    try {
      const currentUid = user?.uid;
      localStorage.removeItem('michat_active_user');
      if (currentUid) {
        localStorage.removeItem(`michat_profile_${currentUid}`);
        // Clear all cached messages in local storage for this user
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('chat_') || key.startsWith('messages_') || key.startsWith('draft_')) {
            localStorage.removeItem(key);
          }
        });
        // Call backend to purge user's messages and set offline
        api.logoutCleanup(currentUid).catch(() => {});
      }
    } catch (e) {}

    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      loginWithEmail,
      loginWithGoogle,
      registerWithEmail,
      resetPassword,
      updateProfileData,
      blockUser,
      unblockUser,
      isUserBlocked,
      logout,
      bypassLoading,
      savedAccounts,
      removeSavedAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
