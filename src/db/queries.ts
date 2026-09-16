import { db } from './index.ts';
import { users, messages, moments, bottles, conversations } from './schema.ts';
import { eq, or, desc, gte, lt } from 'drizzle-orm';
import { supabaseQueries } from './supabaseQueries.ts';

let supabaseTablesMissingWarned = false;

function isTableMissingError(err: any): boolean {
  return (
    err?.code === 'PGRST205' ||
    err?.message?.includes('schema cache') ||
    err?.message?.includes('does not exist')
  );
}

export async function getUserByEmailOrId(input: string) {
  try {
    const res = await supabaseQueries.getUserByEmailOrId(input);
    if (res) return res;
  } catch (err: any) {
    if (isTableMissingError(err)) {
      if (!supabaseTablesMissingWarned) {
        console.warn('[Supabase] Tables not created yet in Supabase. Run supabase_schema.sql in Supabase SQL Editor.');
        supabaseTablesMissingWarned = true;
      }
    } else {
      console.warn('[Supabase] getUserByEmailOrId notice:', err?.message);
    }
  }

  // Fallback to local DB
  try {
    const clean = input.trim();
    const cleanLower = clean.toLowerCase();
    
    const res = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, cleanLower),
          eq(users.email, clean),
          eq(users.michatId, clean),
          eq(users.michatId, cleanLower),
          eq(users.displayName, clean)
        )
      )
      .limit(1);

    if (res.length > 0) {
      return res[0];
    }

    const all = await db.select().from(users).limit(100);
    const matched = all.find(u => 
      u.email.toLowerCase() === cleanLower ||
      (u.michatId && u.michatId.toLowerCase() === cleanLower) ||
      u.displayName.toLowerCase() === cleanLower ||
      (cleanLower.includes('@') && u.email.toLowerCase().split('@')[0] === cleanLower.split('@')[0])
    );

    return matched || null;
  } catch (error) {
    console.error('Database getUserByEmailOrId failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const res = await supabaseQueries.getUserByUid(uid);
    if (res) return res;
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] getUserByUid notice:', err?.message);
    }
  }

  try {
    const res = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return res[0] || null;
  } catch (error) {
    console.error('Database getUserByUid failed:', error);
    throw new Error('Database query failed.', { cause: error });
  }
}

export async function createOrUpdateUser(userData: {
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
  let supabaseSuccess = false;
  let supabaseResult: any = null;

  try {
    supabaseResult = await supabaseQueries.createOrUpdateUser(userData);
    if (supabaseResult) {
      supabaseSuccess = true;
    }
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] createOrUpdateUser notice:', err?.message);
    }
  }

  try {
    const existing = await db.select().from(users).where(eq(users.uid, userData.uid)).limit(1);
    let blockedStr: string | undefined = undefined;
    if (userData.blockedUsers !== undefined) {
      blockedStr = Array.isArray(userData.blockedUsers)
        ? JSON.stringify(userData.blockedUsers)
        : userData.blockedUsers;
    }

    let localResult: any = null;
    if (existing.length > 0) {
      const updated = await db
        .update(users)
        .set({
          email: userData.email ?? existing[0].email,
          displayName: userData.displayName ?? existing[0].displayName,
          gender: userData.gender ?? existing[0].gender,
          bio: userData.bio ?? existing[0].bio,
          region: userData.region ?? existing[0].region,
          avatarUrl: userData.avatarUrl ?? existing[0].avatarUrl,
          passwordHash: userData.passwordHash ?? existing[0].passwordHash,
          michatId: userData.michatId ?? existing[0].michatId,
          isOnline: userData.isOnline ?? existing[0].isOnline,
          blockedUsers: blockedStr ?? existing[0].blockedUsers ?? '[]',
          lastSeen: new Date(),
        })
        .where(eq(users.uid, userData.uid))
        .returning();
      localResult = updated[0];
    } else {
      const inserted = await db
        .insert(users)
        .values({
          uid: userData.uid,
          email: userData.email || `${userData.uid}@lovychat.internal`,
          passwordHash: userData.passwordHash || null,
          displayName: userData.displayName || 'Pengguna LovyChat',
          michatId: userData.michatId || null,
          gender: userData.gender || 'female',
          bio: userData.bio || '',
          region: userData.region || 'Indonesia',
          avatarUrl: userData.avatarUrl || '',
          blockedUsers: blockedStr || '[]',
          isOnline: userData.isOnline ?? true,
          lastSeen: new Date(),
          createdAt: new Date(),
        })
        .returning();
      localResult = inserted[0];
    }

    return supabaseSuccess ? supabaseResult : localResult;
  } catch (error) {
    if (supabaseSuccess) return supabaseResult;
    console.error('Database createOrUpdateUser failed:', error);
    throw new Error('Failed to save user in database.', { cause: error });
  }
}

export async function blockOrUnblockUser(userUid: string, targetUid: string, action: 'block' | 'unblock') {
  try {
    const res = await supabaseQueries.blockOrUnblockUser(userUid, targetUid, action);
    if (res) return res;
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] blockOrUnblockUser notice:', err?.message);
    }
  }

  try {
    const existing = await getUserByUid(userUid);
    if (!existing) {
      throw new Error('User not found');
    }

    let list: string[] = [];
    try {
      list = JSON.parse(existing.blockedUsers || '[]');
    } catch {
      list = [];
    }

    if (action === 'block') {
      if (!list.includes(targetUid)) {
        list.push(targetUid);
      }
    } else {
      list = list.filter(id => id !== targetUid);
    }

    const updated = await db
      .update(users)
      .set({
        blockedUsers: JSON.stringify(list),
        lastSeen: new Date(),
      })
      .where(eq(users.uid, userUid))
      .returning();

    return { success: true, blockedUsers: list, user: updated[0] };
  } catch (error) {
    console.error('Database blockOrUnblockUser failed:', error);
    throw new Error('Failed to update block list.', { cause: error });
  }
}

export async function getAllUsers() {
  try {
    const res = await supabaseQueries.getAllUsers();
    if (res && res.length > 0) return res;
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] getAllUsers notice:', err?.message);
    }
  }

  try {
    return await db.select().from(users).orderBy(desc(users.lastSeen)).limit(50);
  } catch (error) {
    console.error('Database getAllUsers failed:', error);
    throw new Error('Failed to fetch users from database.', { cause: error });
  }
}

export async function getConversationMessages(conversationId: string) {
  try {
    const res = await supabaseQueries.getConversationMessages(conversationId);
    if (res && res.length > 0) return res;
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] getConversationMessages notice:', err?.message);
    }
  }

  try {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt)
      .limit(100);
  } catch (error) {
    console.error('Database getConversationMessages failed:', error);
    throw new Error('Failed to fetch messages.', { cause: error });
  }
}

export async function insertMessage(msg: {
  conversationId: string;
  senderId: string;
  recipientId: string;
  text: string;
  imageUrl?: string | null;
}) {
  let supabaseResult: any = null;
  try {
    supabaseResult = await supabaseQueries.insertMessage(msg);
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] insertMessage notice:', err?.message);
    }
  }

  try {
    const res = await db
      .insert(messages)
      .values({
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        recipientId: msg.recipientId,
        text: msg.text,
        imageUrl: msg.imageUrl || null,
        status: 'sent',
        createdAt: new Date(),
      })
      .returning();
    return supabaseResult || res[0];
  } catch (error) {
    if (supabaseResult) return supabaseResult;
    console.error('Database insertMessage failed:', error);
    throw new Error('Failed to send message.', { cause: error });
  }
}

export async function clearUserMessagesOnLogout(userUid: string) {
  try {
    await supabaseQueries.clearUserMessagesOnLogout(userUid);
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] clearUserMessagesOnLogout notice:', err?.message);
    }
  }

  try {
    // Also delete from local fallback database
    await db.delete(messages).where(
      or(eq(messages.senderId, userUid), eq(messages.recipientId, userUid))
    );
    return { success: true };
  } catch (error) {
    console.error('Database clearUserMessagesOnLogout failed:', error);
    return { success: false };
  }
}

export async function cleanupExpiredMoments() {
  try {
    await supabaseQueries.cleanupExpiredMoments();
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] cleanupExpiredMoments notice:', err?.message);
    }
  }

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await db.delete(moments).where(lt(moments.createdAt, twentyFourHoursAgo));
    return { success: true };
  } catch (error) {
    console.error('Database cleanupExpiredMoments failed:', error);
    return { success: false };
  }
}

export async function getAllMoments() {
  try {
    const res = await supabaseQueries.getAllMoments();
    if (res && res.length > 0) return res;
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] getAllMoments notice:', err?.message);
    }
  }

  try {
    // Only return moments within 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return await db
      .select()
      .from(moments)
      .where(gte(moments.createdAt, twentyFourHoursAgo))
      .orderBy(desc(moments.createdAt))
      .limit(50);
  } catch (error) {
    console.error('Database getAllMoments failed:', error);
    throw new Error('Failed to fetch moments.', { cause: error });
  }
}

export async function insertMoment(momentData: {
  userId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string | null;
  location?: string | null;
}) {
  let supabaseResult: any = null;
  try {
    supabaseResult = await supabaseQueries.insertMoment(momentData);
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] insertMoment notice:', err?.message);
    }
  }

  try {
    const res = await db
      .insert(moments)
      .values({
        userId: momentData.userId,
        authorName: momentData.authorName,
        authorAvatar: momentData.authorAvatar,
        content: momentData.content,
        imageUrl: momentData.imageUrl || null,
        location: momentData.location || 'Indonesia',
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
      })
      .returning();
    return supabaseResult || res[0];
  } catch (error) {
    if (supabaseResult) return supabaseResult;
    console.error('Database insertMoment failed:', error);
    throw new Error('Failed to create moment.', { cause: error });
  }
}

export async function getAllBottles() {
  try {
    const res = await supabaseQueries.getAllBottles();
    if (res && res.length > 0) return res;
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] getAllBottles notice:', err?.message);
    }
  }

  try {
    return await db.select().from(bottles).orderBy(desc(bottles.createdAt)).limit(50);
  } catch (error) {
    console.error('Database getAllBottles failed:', error);
    throw new Error('Failed to fetch drift bottles.', { cause: error });
  }
}

export async function insertBottle(bottleData: {
  userId: string;
  authorName: string;
  authorAvatar: string;
  authorGender: string;
  content: string;
}) {
  let supabaseResult: any = null;
  try {
    supabaseResult = await supabaseQueries.insertBottle(bottleData);
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] insertBottle notice:', err?.message);
    }
  }

  try {
    const res = await db
      .insert(bottles)
      .values({
        userId: bottleData.userId,
        authorName: bottleData.authorName,
        authorAvatar: bottleData.authorAvatar,
        authorGender: bottleData.authorGender,
        content: bottleData.content,
        createdAt: new Date(),
      })
      .returning();
    return supabaseResult || res[0];
  } catch (error) {
    if (supabaseResult) return supabaseResult;
    console.error('Database insertBottle failed:', error);
    throw new Error('Failed to throw drift bottle.', { cause: error });
  }
}

export async function getUserConversations(userUid: string) {
  try {
    const res = await supabaseQueries.getUserConversations(userUid);
    if (res && res.length > 0) return res;
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] getUserConversations notice:', err?.message);
    }
  }

  try {
    const all = await db.select().from(conversations).orderBy(desc(conversations.updatedAt)).limit(100);
    return all.filter((c) => {
      try {
        const parts = JSON.parse(c.participants || '[]');
        return Array.isArray(parts) && parts.includes(userUid);
      } catch {
        return false;
      }
    });
  } catch (error) {
    console.error('Database getUserConversations failed:', error);
    throw new Error('Failed to fetch user conversations.', { cause: error });
  }
}

export async function getOrCreateConversation(data: {
  id?: string;
  participants: string[];
  participantDetails: Record<string, any>;
  lastMessage?: string;
  lastSenderId?: string;
}) {
  let supabaseResult: any = null;
  try {
    supabaseResult = await supabaseQueries.getOrCreateConversation(data);
    if (supabaseResult) return supabaseResult;
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] getOrCreateConversation notice:', err?.message);
    }
  }

  try {
    const all = await db.select().from(conversations).limit(200);
    const sortedTargetParts = [...data.participants].sort().join(':');

    const existing = all.find((c) => {
      if (data.id && c.id === data.id) return true;
      try {
        const parts = JSON.parse(c.participants || '[]');
        return [...parts].sort().join(':') === sortedTargetParts;
      } catch {
        return false;
      }
    });

    if (existing) {
      return existing;
    }

    const newId = data.id || ('chat_' + Math.random().toString(36).substring(2, 12));
    const inserted = await db
      .insert(conversations)
      .values({
        id: newId,
        participants: JSON.stringify(data.participants),
        participantDetails: JSON.stringify(data.participantDetails),
        lastMessage: data.lastMessage || 'Halo, salam kenal!',
        lastSenderId: data.lastSenderId || data.participants[0],
        unreadCount: JSON.stringify(
          data.participants.reduce((acc: any, uid: string) => {
            acc[uid] = uid === data.lastSenderId ? 0 : 1;
            return acc;
          }, {})
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database getOrCreateConversation failed:', error);
    throw new Error('Failed to create or retrieve conversation.', { cause: error });
  }
}

export async function markConversationRead(convId: string, userUid: string) {
  try {
    const res = await supabaseQueries.markConversationRead(convId, userUid);
    if (res) return res;
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] markConversationRead notice:', err?.message);
    }
  }

  try {
    const res = await db.select().from(conversations).where(eq(conversations.id, convId)).limit(1);
    if (res.length === 0) return null;

    const conv = res[0];
    let unread: Record<string, number> = {};
    try {
      unread = JSON.parse(conv.unreadCount || '{}');
    } catch {
      unread = {};
    }
    unread[userUid] = 0;

    const updated = await db
      .update(conversations)
      .set({
        unreadCount: JSON.stringify(unread),
      })
      .where(eq(conversations.id, convId))
      .returning();

    return updated[0];
  } catch (error) {
    console.error('Database markConversationRead failed:', error);
    return null;
  }
}

export async function deleteMomentById(momentId: number, userUid: string) {
  try {
    const res = await supabaseQueries.deleteMomentById(momentId, userUid);
    if (res) return res;
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] deleteMomentById notice:', err?.message);
    }
  }

  try {
    const res = await db.delete(moments).where(eq(moments.id, momentId)).returning();
    return res[0] || null;
  } catch (error) {
    console.error('Database deleteMomentById failed:', error);
    throw new Error('Failed to delete moment.', { cause: error });
  }
}

export async function toggleMomentLike(momentId: number, userUid: string) {
  try {
    const res = await supabaseQueries.toggleMomentLike(momentId, userUid);
    if (res) return res;
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] toggleMomentLike notice:', err?.message);
    }
  }

  try {
    const res = await db.select().from(moments).where(eq(moments.id, momentId)).limit(1);
    if (res.length === 0) throw new Error('Moment not found');
    const m = res[0];
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

    const updated = await db
      .update(moments)
      .set({
        likes: JSON.stringify(likes),
        likesCount: likes.length,
      })
      .where(eq(moments.id, momentId))
      .returning();

    return updated[0];
  } catch (error) {
    console.error('Database toggleMomentLike failed:', error);
    throw new Error('Failed to toggle like on moment.', { cause: error });
  }
}

export async function addMomentComment(momentId: number, comment: {
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
}) {
  try {
    const res = await supabaseQueries.addMomentComment(momentId, comment);
    if (res) return res;
  } catch (err: any) {
    if (!isTableMissingError(err)) {
      console.warn('[Supabase] addMomentComment notice:', err?.message);
    }
  }

  try {
    const res = await db.select().from(moments).where(eq(moments.id, momentId)).limit(1);
    if (res.length === 0) throw new Error('Moment not found');
    const m = res[0];
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

    const updated = await db
      .update(moments)
      .set({
        comments: JSON.stringify(comments),
        commentsCount: comments.length,
      })
      .where(eq(moments.id, momentId))
      .returning();

    return { moment: updated[0], comment: newComment };
  } catch (error) {
    console.error('Database addMomentComment failed:', error);
    throw new Error('Failed to add comment to moment.', { cause: error });
  }
}
