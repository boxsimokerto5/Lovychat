import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import { calculateDistanceKm, formatDistance } from '../utils/avatars';
import { 
  Compass, 
  MapPin, 
  MessageCircle, 
  RefreshCw,
  Users,
  SlidersHorizontal
} from 'lucide-react';
import { OtherUserProfileModal } from './OtherUserProfileModal';

interface NearbyViewProps {
  onStartChat: (targetUser: UserProfile) => void;
}

interface NearbyUserItem extends UserProfile {
  distanceKm: number;
}

export const NearbyView: React.FC<NearbyViewProps> = ({ onStartChat }) => {
  const { user, userProfile } = useAuth();
  const [users, setUsers] = useState<NearbyUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [sayingHiTo, setSayingHiTo] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const fetchNearby = async () => {
    if (!user || !userProfile) return;
    setLoading(true);
    try {
      const allUsers = await api.getUsers();
      const list: NearbyUserItem[] = [];

      const myLat = userProfile.latitude || -6.2088;
      const myLng = userProfile.longitude || 106.8456;
      const blockedUids = userProfile.blockedUsers || [];

      allUsers.forEach((u) => {
        if (u.uid !== user.uid && !blockedUids.includes(u.uid)) {
          const uLat = u.latitude || (-6.2088 + (Math.random() - 0.5) * 0.04);
          const uLng = u.longitude || (106.8456 + (Math.random() - 0.5) * 0.04);
          const distance = calculateDistanceKm(myLat, myLng, uLat, uLng);
          list.push({
            ...u,
            distanceKm: distance
          });
        }
      });

      // Sort by nearest distance first
      list.sort((a, b) => a.distanceKm - b.distanceKm);
      setUsers(list);
    } catch (err) {
      console.error('Failed to load nearby users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, [user, userProfile]);

  const femaleCount = users.filter((u) => u.gender === 'female').length;
  const maleCount = users.filter((u) => u.gender === 'male').length;

  const filteredUsers = users.filter((u) => {
    if (genderFilter === 'all') return true;
    return u.gender === genderFilter;
  });

  const handleSayHi = async (targetUser: UserProfile) => {
    setSayingHiTo(targetUser.uid);
    try {
      await onStartChat(targetUser);
    } finally {
      setSayingHiTo(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Sub-header controls */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-200/80 shrink-0 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-800 truncate max-w-[140px]">{userProfile?.region || 'Sekitar Saya'}</span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {filteredUsers.length} ditemukan
            </span>
          </div>

          <button
            onClick={fetchNearby}
            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 text-xs"
            title="Pindai Ulang Radar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="text-[11px] font-medium hidden sm:inline">Pindai</span>
          </button>
        </div>

        {/* Gender Filter Buttons: Keduanya, Perempuan, Laki-laki */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter:</span>
          </div>

          <div className="flex bg-slate-100/90 p-1 rounded-xl text-xs gap-1 flex-1 max-w-sm justify-end">
            <button
              type="button"
              id="filter-gender-all"
              onClick={() => setGenderFilter('all')}
              className={`flex-1 py-1 px-2.5 rounded-lg font-semibold text-center transition flex items-center justify-center gap-1 text-[11px] ${
                genderFilter === 'all'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Keduanya</span>
              <span className="text-[10px] text-slate-400 font-normal">({users.length})</span>
            </button>

            <button
              type="button"
              id="filter-gender-female"
              onClick={() => setGenderFilter('female')}
              className={`flex-1 py-1 px-2.5 rounded-lg font-semibold text-center transition flex items-center justify-center gap-1 text-[11px] ${
                genderFilter === 'female'
                  ? 'bg-pink-50 text-pink-700 shadow-xs border border-pink-200'
                  : 'text-slate-600 hover:text-pink-600'
              }`}
            >
              <span className="text-pink-600 font-bold text-xs">♀</span>
              <span>Perempuan</span>
              <span className="text-[10px] text-pink-400 font-normal">({femaleCount})</span>
            </button>

            <button
              type="button"
              id="filter-gender-male"
              onClick={() => setGenderFilter('male')}
              className={`flex-1 py-1 px-2.5 rounded-lg font-semibold text-center transition flex items-center justify-center gap-1 text-[11px] ${
                genderFilter === 'male'
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              <span className="text-blue-600 font-bold text-xs">♂</span>
              <span>Laki-laki</span>
              <span className="text-[10px] text-blue-400 font-normal">({maleCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Radar List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Memindai pengguna di sekitar lokasi Anda...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 px-6 space-y-3">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <Compass className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">
                {users.length > 0
                  ? `Tidak Ditemukan Pengguna ${genderFilter === 'female' ? 'Perempuan' : 'Laki-laki'}`
                  : 'Belum Ada Pengguna Lain di Sekitar'}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                {users.length > 0
                  ? `Tidak ada pengguna ${genderFilter === 'female' ? 'perempuan' : 'laki-laki'} di area ini saat ini. Anda bisa mengganti filter ke "Keduanya" untuk melihat semua orang.`
                  : 'Belum ada pengguna lain yang aktif di area ini. Bagikan tautan aplikasi agar teman Anda dapat langsung bergabung di radar!'}
              </p>
            </div>
            {users.length > 0 && genderFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => setGenderFilter('all')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
              >
                Tampilkan Keduanya ({users.length})
              </button>
            ) : (
              <button
                type="button"
                onClick={fetchNearby}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
              >
                Pindai Ulang Radar
              </button>
            )}
          </div>
        ) : (
          filteredUsers.map((item) => (
            <div
              key={item.uid}
              className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex items-center justify-between gap-3"
            >
              <div
                onClick={() => setSelectedUser(item)}
                className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                title="Lihat Profil"
              >
                <div className="relative shrink-0">
                  <img
                    src={item.avatarUrl}
                    alt={item.displayName}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  {item.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="text-xs font-bold text-slate-800 truncate hover:text-emerald-700 transition">{item.displayName}</h3>
                    {item.gender === 'female' ? (
                      <span className="text-[10px] text-pink-600 font-bold">♀</span>
                    ) : item.gender === 'male' ? (
                      <span className="text-[10px] text-blue-600 font-bold">♂</span>
                    ) : null}
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mb-1">
                    {item.bio || 'Hai, salam kenal di LovyChat!'}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                      {formatDistance(item.distanceKm)}
                    </span>
                    <span>•</span>
                    <span className="truncate">{item.region || 'Sekitar Anda'}</span>
                  </div>
                </div>
              </div>

              <button
                disabled={sayingHiTo === item.uid}
                onClick={() => handleSayHi(item)}
                className="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{sayingHiTo === item.uid ? 'Menghubungkan...' : 'Sapa'}</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Other User Profile Modal with Block Option */}
      <OtherUserProfileModal
        user={selectedUser}
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        onStartChat={(target) => {
          setSelectedUser(null);
          onStartChat(target);
        }}
        onUserBlocked={() => {
          setSelectedUser(null);
          fetchNearby();
        }}
      />
    </div>
  );
};
