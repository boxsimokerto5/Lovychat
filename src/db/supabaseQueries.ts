import { supabase } from './supabaseClient.ts';

// Helper to format Supabase user row to standard user object
export function formatUserRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    uid: row.uid,
    email: row.email,
    passwordHash: row.password_hash,
    displayName: row.display_name,
    michatId: row.michat_id,
    gender: row.gender || 'female',
    bio: row.bio || '',
    region: row.region || 'Indonesia',
    avatarUrl: row.avatar_url || '',
    blockedUsers: row.blocked_users || '[]',
    isOnline: row.is_online ?? true,
    lastSeen: row.last_seen ? new Date(row.last_seen) : new Date(),
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

// Helper to format Supabase message row
export function formatMessageRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    text: row.text,
    status: row.status || 'sent',
    imageUrl: row.image_url || null,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

// Helper to format Supabase moment row
export function formatMomentRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    content: row.content,
    imageUrl: row.image_url || null,
    location: row.location || 'Indonesia',
    likesCount: Number(row.likes_count || 0),
    commentsCount: Number(row.comments_count || 0),
    likes: row.likes || '[]',
    comments: row.comments || '[]',
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

// Helper to format Supabase bottle row
export function formatBottleRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    authorGender: row.author_gender || 'female',
    content: row.content,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

// Helper to format Supabase conversation row
export function formatConversationRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    participants: row.participants || '[]',
    participantDetails: row.participant_details || '{}',
    lastMessage: row.last_message || '',
    lastSenderId: row.last_sender_id || '',
    unreadCount: row.unread_count || '{}',
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  };
}

export const supabaseQueries = {
  async getUserByEmailOrId(input: string) {
    const clean = input.trim();
    const cleanLower = clean.toLowerCase();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.${cleanLower},michat_id.ilike.${cleanLower},display_name.ilike.${clean}`)
      .limit(1);

    if (error) throw error;
    if (data && data.length > 0) {
      return formatUserRow(data[0]);
    }
    return null;
  },

  async getUserByUid(uid: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', uid)
      .maybeSingle();

    if (error) throw error;
    return formatUserRow(data);
  },

  async createOrUpdateUser(userData: {
    uid: string;
    email?: string;
    passwordHash?: string | null;
    displayName?: string;
    michatId?: string | null;
    gender?: string;
    bio?: string;
    region?: string;
    avatarUrl?: string;
    isOnline?: boolean;
    blockedUsers?: string[] | string;
  }) {
    let blockedStr = '[]';
    if (userData.blockedUsers !== undefined) {
      blockedStr = Array.isArray(userData.blockedUsers)
        ? JSON.stringify(userData.blockedUsers)
        : userData.blockedUsers;
    }

    const payload: any = {
      uid: userData.uid,
      last_seen: new Date().toISOString(),
    };

    if (userData.email !== undefined) payload.email = userData.email;
    if (userData.passwordHash !== undefined) payload.password_hash = userData.passwordHash;
    if (userData.displayName !== undefined) payload.display_name = userData.displayName;
    if (userData.michatId !== undefined) payload.michat_id = userData.michatId;
    if (userData.gender !== undefined) payload.gender = userData.gender;
    if (userData.bio !== undefined) payload.bio = userData.bio;
    if (userData.region !== undefined) payload.region = userData.region;
    if (userData.avatarUrl !== undefined) payload.avatar_url = userData.avatarUrl;
    if (userData.isOnline !== undefined) payload.is_online = userData.isOnline;
    if (userData.blockedUsers !== undefined) payload.blocked_users = blockedStr;

    const { data, error } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'uid' })
      .select()
      .single();

    if (error) throw error;
    return formatUserRow(data);
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('last_seen', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []).map(formatUserRow);
  },

  async blockOrUnblockUser(userUid: string, targetUid: string, action: 'block' | 'unblock') {
    const existing = await this.getUserByUid(userUid);
    if (!existing) throw new Error('User not found in Supabase');

    let list: string[] = [];
    try {
      list = JSON.parse(existing.blockedUsers || '[]');
    } catch {
      list = [];
    }

    if (action === 'block') {
      if (!list.includes(targetUid)) list.push(targetUid);
    } else {
      list = list.filter((id) => id !== targetUid);
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        blocked_users: JSON.stringify(list),
        last_seen: new Date().toISOString(),
      })
      .eq('uid', userUid)
      .select()
      .single();

    if (error) throw error;
    return { success: true, blockedUsers: list, user: formatUserRow(data) };
  },

  async getConversationMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw error;
    return (data || []).map(formatMessageRow);
  },

  async insertMessage(msg: {
    conversationId: string;
    senderId: string;
    recipientId: string;
    text: string;
    imageUrl?: string | null;
  }) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: msg.conversationId,
        sender_id: msg.senderId,
        recipient_id: msg.recipientId,
        text: msg.text,
        image_url: msg.imageUrl || null,
        status: 'sent',
      })
      .select()
      .single();

    if (error) throw error;
    return formatMessageRow(data);
  },

  async clearUserMessagesOnLogout(userUid: string) {
    // Ephemeral messages: delete messages involving this user upon logout to conserve database
    const { error: err1 } = await supabase
      .from('messages')
      .delete()
      .or(`sender_id.eq.${userUid},recipient_id.eq.${userUid}`);

    if (err1) {
      console.warn('[Supabase] Clear messages on logout notice:', err1.message);
    }
    return { success: !err1 };
  },

  async cleanupExpiredMoments() {
    // Delete moments older than 24 hours to keep database ultra-lean
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from('moments')
      .delete()
      .lt('created_at', twentyFourHoursAgo);

    if (error) {
      console.warn('[Supabase] Cleanup expired moments notice:', error.message);
    }
    return { success: !error };
  },

  async getAllMoments() {
    // Only fetch moments created within the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('moments')
      .select('*')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []).map(formatMomentRow);
  },

  async insertMoment(momentData: {
    userId: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    imageUrl?: string | null;
    location?: string | null;
  }) {
    const { data, error } = await supabase
      .from('moments')
      .insert({
        user_id: momentData.userId,
        author_name: momentData.authorName,
        author_avatar: momentData.authorAvatar,
        content: momentData.content,
        image_url: momentData.imageUrl || null,
        location: momentData.location || 'Indonesia',
        likes_count: 0,
        comments_count: 0,
        likes: '[]',
        comments: '[]',
      })
      .select()
      .single();

    if (error) throw error;
    return formatMomentRow(data);
  },

  async deleteMomentById(momentId: number, userUid: string) {
    const { data, error } = await supabase
      .from('moments')
      .delete()
      .eq('id', momentId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return formatMomentRow(data);
  },

  async toggleMomentLike(momentId: number, userUid: string) {
    const { data: m, error: fetchErr } = await supabase
      .from('moments')
      .select('*')
      .eq('id', momentId)
      .single();

    if (fetchErr || !m) throw new Error('Moment not found');

    let likes: string[] = [];
    try {
      likes = JSON.parse(m.likes || '[]');
    } catch {
      likes = [];
    }

    if (likes.includes(userUid)) {
      likes = likes.filter((id) => id !== userUid);
    } else {
      likes.push(userUid);
    }

    const { data, error } = await supabase
      .from('moments')
      .update({
        likes: JSON.stringify(likes),
        likes_count: likes.length,
      })
      .eq('id', momentId)
      .select()
      .single();

    if (error) throw error;
    return formatMomentRow(data);
  },

  async addMomentComment(momentId: number, comment: {
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
  }) {
    const { data: m, error: fetchErr } = await supabase
      .from('moments')
      .select('*')
      .eq('id', momentId)
      .single();

    if (fetchErr || !m) throw new Error('Moment not found');

    let comments: any[] = [];
    try {
      comments = JSON.parse(m.comments || '[]');
    } catch {
      comments = [];
    }

    const newComment = {
      id: 'cm_' + Math.random().toString(36).substring(2, 9),
      ...comment,
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);

    const { data, error } = await supabase
      .from('moments')
      .update({
        comments: JSON.stringify(comments),
        comments_count: comments.length,
      })
      .eq('id', momentId)
      .select()
      .single();

    if (error) throw error;
    return { moment: formatMomentRow(data), comment: newComment };
  },

  async getAllBottles() {
    const { data, error } = await supabase
      .from('bottles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []).map(formatBottleRow);
  },

  async insertBottle(bottleData: {
    userId: string;
    authorName: string;
    authorAvatar: string;
    authorGender: string;
    content: string;
  }) {
    const { data, error } = await supabase
      .from('bottles')
      .insert({
        user_id: bottleData.userId,
        author_name: bottleData.authorName,
        author_avatar: bottleData.authorAvatar,
        author_gender: bottleData.authorGender,
        content: bottleData.content,
      })
      .select()
      .single();

    if (error) throw error;
    return formatBottleRow(data);
  },

  async getUserConversations(userUid: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    const formatted = (data || []).map(formatConversationRow);
    return formatted.filter((c: any) => {
      try {
        const parts = JSON.parse(c.participants || '[]');
        return Array.isArray(parts) && parts.includes(userUid);
      } catch {
        return false;
      }
    });
  },

  async getOrCreateConversation(data: {
    id?: string;
    participants: string[];
    participantDetails: Record<string, any>;
    lastMessage?: string;
    lastSenderId?: string;
  }) {
    const { data: all, error } = await supabase
      .from('conversations')
      .select('*')
      .limit(200);

    if (error) throw error;

    const sortedTargetParts = [...data.participants].sort().join(':');
    const existing = (all || []).find((c: any) => {
      if (data.id && c.id === data.id) return true;
      try {
        const parts = JSON.parse(c.participants || '[]');
        return [...parts].sort().join(':') === sortedTargetParts;
      } catch {
        return false;
      }
    });

    if (existing) {
      return formatConversationRow(existing);
    }

    const newId = data.id || ('chat_' + Math.random().toString(36).substring(2, 12));
    const { data: inserted, error: insErr } = await supabase
      .from('conversations')
      .insert({
        id: newId,
        participants: JSON.stringify(data.participants),
        participant_details: JSON.stringify(data.participantDetails),
        last_message: data.lastMessage || 'Halo, salam kenal!',
        last_sender_id: data.lastSenderId || data.participants[0],
        unread_count: JSON.stringify(
          data.participants.reduce((acc: any, uid: string) => {
            acc[uid] = uid === data.lastSenderId ? 0 : 1;
            return acc;
          }, {})
        ),
      })
      .select()
      .single();

    if (insErr) throw insErr;
    return formatConversationRow(inserted);
  },

  async markConversationRead(convId: string, userUid: string) {
    const { data: conv, error: fetchErr } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', convId)
      .single();

    if (fetchErr || !conv) return null;

    let unread: Record<string, number> = {};
    try {
      unread = JSON.parse(conv.unread_count || '{}');
    } catch {
      unread = {};
    }
    unread[userUid] = 0;

    const { data, error } = await supabase
      .from('conversations')
      .update({
        unread_count: JSON.stringify(unread),
      })
      .eq('id', convId)
      .select()
      .single();

    if (error) return null;
    return formatConversationRow(data);
  },
};
