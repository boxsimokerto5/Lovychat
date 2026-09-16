import { ChatConversation, ChatMessage, MomentPost, BottleMessage, UserProfile } from '../types';

const LIVE_BACKEND_URL = 'https://ais-pre-qv5xunkuvf5tmbxnxj5xj7-854045254855.asia-southeast1.run.app';

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // When running inside Capacitor native Android/iOS app or local filesystem
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:'
    ) {
      return LIVE_BACKEND_URL;
    }
  }
  return '';
};

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
  return await fetch(url, options);
}

export const api = {
  // Users
  async getUsers(): Promise<UserProfile[]> {
    try {
      const res = await apiFetch('/api/users');
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getUser(uid: string): Promise<UserProfile | null> {
    const res = await apiFetch(`/api/users/${encodeURIComponent(uid)}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Gagal memuat detail pengguna.');
    }
    return res.json();
  },

  async syncProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const res = await apiFetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Gagal sinkronisasi profil.');
    const data = await res.json();
    return data.user;
  },

  async blockOrUnblockUser(userUid: string, targetUid: string, action: 'block' | 'unblock') {
    const res = await apiFetch('/api/auth/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userUid, targetUid, action }),
    });
    if (!res.ok) throw new Error('Gagal memproses blokir.');
    return res.json();
  },

  async logoutCleanup(uid: string) {
    try {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });
    } catch (e) {
      console.warn('Logout cleanup notice:', e);
    }
  },

  // Chats / Conversations
  async getChats(userUid: string): Promise<ChatConversation[]> {
    if (!userUid || typeof userUid !== 'string' || !userUid.trim() || userUid === 'undefined' || userUid === 'null') {
      return [];
    }
    try {
      const res = await apiFetch(`/api/chats?userUid=${encodeURIComponent(userUid)}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createOrGetChat(data: {
    id?: string;
    participants: string[];
    participantDetails: Record<string, any>;
    lastMessage?: string;
    lastSenderId?: string;
  }): Promise<ChatConversation> {
    const res = await apiFetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal membuat percakapan.');
    return res.json();
  },

  async markChatRead(chatId: string, userUid: string) {
    try {
      await apiFetch(`/api/chats/${encodeURIComponent(chatId)}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userUid }),
      });
    } catch (e) {
      console.warn('markChatRead notice:', e);
    }
  },

  async getTypingStatus(chatId: string, excludeUid: string): Promise<{ isTyping: boolean; typingUserIds: string[] }> {
    try {
      const res = await apiFetch(`/api/chats/${encodeURIComponent(chatId)}/typing?excludeUid=${encodeURIComponent(excludeUid)}`);
      if (!res.ok) return { isTyping: false, typingUserIds: [] };
      return await res.json();
    } catch {
      return { isTyping: false, typingUserIds: [] };
    }
  },

  async setTypingStatus(chatId: string, userUid: string, isTyping: boolean): Promise<void> {
    try {
      await apiFetch(`/api/chats/${encodeURIComponent(chatId)}/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userUid, isTyping }),
      });
    } catch (e) {
      console.warn('setTypingStatus notice:', e);
    }
  },

  // Messages
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    if (!conversationId) return [];
    try {
      const res = await apiFetch(`/api/messages?conversationId=${encodeURIComponent(conversationId)}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    recipientId: string;
    text?: string;
    imageUrl?: string;
    senderName?: string;
    senderAvatar?: string;
  }): Promise<ChatMessage> {
    const res = await apiFetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal mengirim pesan.');
    return res.json();
  },

  // Moments
  async getMoments(): Promise<MomentPost[]> {
    try {
      const res = await apiFetch('/api/moments');
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createMoment(momentData: {
    userId: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    imageUrl?: string | null;
    location?: string | null;
  }): Promise<MomentPost> {
    const res = await apiFetch('/api/moments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(momentData),
    });
    if (!res.ok) throw new Error('Gagal membagikan Momen.');
    return res.json();
  },

  async deleteMoment(momentId: string | number, userUid: string) {
    const res = await apiFetch(`/api/moments/${momentId}?userUid=${encodeURIComponent(userUid)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Gagal menghapus Momen.');
    return res.json();
  },

  async likeMoment(momentId: string | number, userUid: string) {
    const res = await apiFetch(`/api/moments/${momentId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userUid }),
    });
    if (!res.ok) throw new Error('Gagal menyukai Momen.');
    return res.json();
  },

  async commentMoment(momentId: string | number, comment: {
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
  }) {
    const res = await apiFetch(`/api/moments/${momentId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });
    if (!res.ok) throw new Error('Gagal mengirim komentar.');
    return res.json();
  },

  // Drift Bottles
  async getBottles(): Promise<BottleMessage[]> {
    try {
      const res = await apiFetch('/api/bottles');
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async throwBottle(data: {
    senderId: string;
    senderName: string;
    senderAvatar: string;
    senderGender: string;
    content: string;
  }): Promise<BottleMessage> {
    const res = await apiFetch('/api/bottles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal melempar botol.');
    return res.json();
  },
};
