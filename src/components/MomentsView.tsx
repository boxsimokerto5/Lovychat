import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { MomentPost } from '../types';
import { formatTimestamp, MOMENT_PHOTO_PRESETS } from '../utils/avatars';
import { uploadImageToImgBB } from '../utils/imgbb';
import { 
  Heart, 
  MessageSquare, 
  Plus, 
  X, 
  Trash2, 
  Send, 
  Image as ImageIcon,
  Share2,
  Upload,
  Loader2,
  Clock
} from 'lucide-react';

export const MomentsView: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [moments, setMoments] = useState<MomentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [content, setContent] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [activeCommentMomentId, setActiveCommentMomentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleUploadPhoto = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingPhoto(true);
    try {
      const res = await uploadImageToImgBB(file, { maxWidth: 900, maxHeight: 900, quality: 0.8 });
      setSelectedPhoto(res.url);
    } catch (err) {
      console.error('Failed to process image:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const loadMoments = useCallback(async () => {
    try {
      const list = await api.getMoments();
      setMoments(list);
    } catch (err) {
      console.error('Error fetching moments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll moments periodically
  useEffect(() => {
    if (!user) return;
    loadMoments();
    const interval = setInterval(loadMoments, 4000);
    return () => clearInterval(interval);
  }, [user, loadMoments]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user || !userProfile) return;

    try {
      await api.createMoment({
        userId: user.uid,
        authorName: userProfile.displayName,
        authorAvatar: userProfile.avatarUrl,
        content: content.trim(),
        imageUrl: selectedPhoto || null,
      });

      setContent('');
      setSelectedPhoto(null);
      setIsPosting(false);
      await loadMoments();
    } catch (err) {
      console.error('Failed to post moment:', err);
    }
  };

  const handleToggleLike = async (moment: MomentPost) => {
    if (!user) return;
    const isLiked = moment.likes?.includes(user.uid);
    const newLikes = isLiked
      ? moment.likes.filter((id) => id !== user.uid)
      : [...(moment.likes || []), user.uid];

    // Optimistic UI update
    setMoments((prev) =>
      prev.map((m) => (m.id === moment.id ? { ...m, likes: newLikes } : m))
    );

    try {
      await api.likeMoment(moment.id, user.uid);
    } catch (err) {
      console.error('Failed to toggle like:', err);
      await loadMoments();
    }
  };

  const handleSendComment = async (momentId: string) => {
    if (!commentText.trim() || !user || !userProfile) return;
    const textToSend = commentText.trim();
    setCommentText('');

    try {
      await api.commentMoment(momentId, {
        userId: user.uid,
        userName: userProfile.displayName,
        userAvatar: userProfile.avatarUrl,
        text: textToSend,
      });
      await loadMoments();
    } catch (err) {
      console.error('Failed to send comment:', err);
    }
  };

  const handleDeleteMoment = async (momentId: string) => {
    if (!confirm('Hapus postingan momen ini?') || !user) return;
    try {
      await api.deleteMoment(momentId, user.uid);
      setMoments((prev) => prev.filter((m) => m.id !== momentId));
    } catch (err) {
      console.error('Failed to delete moment:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 pb-20">
      {/* Cover Header */}
      <div className="relative h-44 bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-800 flex items-end p-4 shadow-md">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <img
              src={userProfile?.avatarUrl}
              alt={userProfile?.displayName}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-md"
            />
            <div className="text-white">
              <h2 className="text-sm font-bold truncate">{userProfile?.displayName}</h2>
              <p className="text-[11px] text-emerald-100">ID: {userProfile?.michatId}</p>
            </div>
          </div>

          <button
            onClick={() => setIsPosting(true)}
            className="p-2.5 bg-white text-emerald-700 hover:bg-emerald-50 rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-1 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Posting Momen</span>
          </button>
        </div>
      </div>

      {/* Moments List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Ephemeral Info Banner */}
        <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl text-[11px] text-emerald-800">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Momen Cerita Otomatis Aktif 24 Jam</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full">
            Hemat Database
          </span>
        </div>
        {(() => {
          const blockedUids = userProfile?.blockedUsers || [];
          const visibleMoments = moments.filter(m => !blockedUids.includes(m.authorId));

          if (loading) {
            return (
              <div className="py-16 text-center text-xs text-slate-400">
                Memuat linimasa momen...
              </div>
            );
          }

          if (visibleMoments.length === 0) {
            return (
              <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/80">
                <p className="text-xs font-bold text-slate-700">Belum Ada Momen Dibagikan</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Jadilah yang pertama mengunggah cerita hari ini atau foto menarik!
                </p>
                <button
                  onClick={() => setIsPosting(true)}
                  className="mt-3 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Posting Sekarang
                </button>
              </div>
            );
          }

          return visibleMoments.map((item) => {
            const isLiked = user && item.likes?.includes(user.uid);
            const isMine = user && item.authorId === user.uid;
            const comments = (item as any).comments || [];

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3"
              >
                {/* Author Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.authorAvatar}
                      alt={item.authorName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{item.authorName}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>{formatTimestamp(item.createdAt)}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> 24j
                        </span>
                      </div>
                    </div>
                  </div>

                  {isMine && (
                    <button
                      onClick={() => handleDeleteMoment(item.id)}
                      className="text-slate-300 hover:text-rose-500 p-1 transition"
                      title="Hapus Momen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </p>

                {/* Attached Photo */}
                {item.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-100 max-h-72">
                    <img
                      src={item.imageUrl}
                      alt="Moment"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                {/* Interactions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleLike(item)}
                      className={`flex items-center gap-1.5 transition ${
                        isLiked ? 'text-rose-500 font-bold' : 'hover:text-slate-700'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                      <span>{item.likes?.length || 0}</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentMomentId(activeCommentMomentId === item.id ? null : item.id)}
                      className="flex items-center gap-1.5 hover:text-slate-700 transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{item.commentsCount || 0}</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {activeCommentMomentId === item.id && (
                  <div className="pt-2 space-y-2 border-t border-slate-100">
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {comments.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">Belum ada komentar. Jadilah yang pertama berkomentar!</p>
                      ) : (
                        comments.map((c) => (
                          <div key={c.id} className="bg-slate-50 p-2 rounded-xl text-xs flex items-start gap-2">
                            <img src={c.authorAvatar} alt="" className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-800 mr-1.5">{c.authorName}:</span>
                              <span className="text-slate-600">{c.text}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Tulis komentar..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendComment(item.id);
                          }
                        }}
                        className="flex-1 py-1.5 px-3 bg-slate-100 rounded-xl text-xs border border-slate-200 focus:bg-white focus:outline-emerald-500 transition"
                      />
                      <button
                        onClick={() => handleSendComment(item.id)}
                        disabled={!commentText.trim()}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>

      {/* Modal: Posting Momen Baru */}
      {isPosting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Buat Momen Baru</h3>
              <button onClick={() => setIsPosting(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Apa cerita atau aktivitas seru hari ini?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:bg-white focus:outline-emerald-500 resize-none transition"
              />

              {/* Photo presets selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Foto Momen (Unggah atau Pilih):
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadPhoto(file);
                    e.target.value = '';
                  }}
                />

                <div className="grid grid-cols-6 gap-1.5">
                  {/* Upload button */}
                  <button
                    type="button"
                    disabled={uploadingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleUploadPhoto(file);
                    }}
                    className="flex flex-col items-center justify-center h-12 rounded-lg border-2 border-dashed border-emerald-400 hover:bg-emerald-50 text-emerald-700 transition p-1 text-center"
                    title="Unggah dari HP / galeri"
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 mb-0.5" />
                        <span className="text-[8px] font-bold">Foto</span>
                      </>
                    )}
                  </button>

                  {/* Preset photos */}
                  {MOMENT_PHOTO_PRESETS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedPhoto(selectedPhoto === url ? null : url)}
                      className={`relative rounded-lg overflow-hidden border-2 transition ${
                        selectedPhoto === url ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-transparent'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-12 object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {selectedPhoto && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200">
                  <img src={selectedPhoto} alt="Selected" className="w-full h-28 object-cover" />
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={!content.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Bagikan ke Momen
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
