import { db } from './index.ts';
import { users, messages, moments, bottles, conversations } from './schema.ts';
import { supabase } from './supabaseClient.ts';

export async function syncLocalDataToSupabase() {
  const report: {
    usersSynced: number;
    momentsSynced: number;
    bottlesSynced: number;
    messagesSynced: number;
    conversationsSynced: number;
  } = {
    usersSynced: 0,
    momentsSynced: 0,
    bottlesSynced: 0,
    messagesSynced: 0,
    conversationsSynced: 0,
  };

  try {
    // 1. Sync Users
    const localUsers = await db.select().from(users);
    for (const u of localUsers) {
      const { error } = await supabase.from('users').upsert(
        {
          uid: u.uid,
          email: u.email,
          password_hash: u.passwordHash,
          display_name: u.displayName,
          michat_id: u.michatId,
          gender: u.gender || 'female',
          bio: u.bio || '',
          region: u.region || 'Indonesia',
          avatar_url: u.avatarUrl || '',
          blocked_users: u.blockedUsers || '[]',
          is_online: u.isOnline ?? true,
          last_seen: u.lastSeen ? new Date(u.lastSeen).toISOString() : new Date().toISOString(),
          created_at: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
        },
        { onConflict: 'uid' }
      );
      if (!error) report.usersSynced++;
    }

    // 2. Sync Moments
    const localMoments = await db.select().from(moments);
    for (const m of localMoments) {
      const { error } = await supabase.from('moments').upsert(
        {
          id: m.id,
          user_id: m.userId,
          author_name: m.authorName,
          author_avatar: m.authorAvatar,
          content: m.content,
          image_url: m.imageUrl || null,
          location: m.location || 'Indonesia',
          likes_count: m.likesCount || 0,
          comments_count: m.commentsCount || 0,
          likes: '[]',
          comments: '[]',
          created_at: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (!error) report.momentsSynced++;
    }

    // 3. Sync Bottles
    const localBottles = await db.select().from(bottles);
    for (const b of localBottles) {
      const { error } = await supabase.from('bottles').upsert(
        {
          id: b.id,
          user_id: b.userId,
          author_name: b.authorName,
          author_avatar: b.authorAvatar,
          author_gender: b.authorGender || 'female',
          content: b.content,
          created_at: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (!error) report.bottlesSynced++;
    }

    // 4. Sync Conversations
    const localConvs = await db.select().from(conversations);
    for (const c of localConvs) {
      const { error } = await supabase.from('conversations').upsert(
        {
          id: c.id,
          participants: c.participants || '[]',
          participant_details: c.participantDetails || '{}',
          last_message: c.lastMessage || '',
          last_sender_id: c.lastSenderId || '',
          unread_count: c.unreadCount || '{}',
          created_at: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
          updated_at: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (!error) report.conversationsSynced++;
    }

    // 5. Sync Messages
    const localMsgs = await db.select().from(messages);
    for (const msg of localMsgs) {
      const { error } = await supabase.from('messages').upsert(
        {
          id: msg.id,
          conversation_id: msg.conversationId,
          sender_id: msg.senderId,
          recipient_id: msg.recipientId,
          text: msg.text,
          status: msg.status || 'sent',
          image_url: msg.imageUrl || null,
          created_at: msg.createdAt ? new Date(msg.createdAt).toISOString() : new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (!error) report.messagesSynced++;
    }

    console.log('[Supabase Sync] Report:', report);
    return { success: true, report };
  } catch (error: any) {
    console.error('[Supabase Sync] Error:', error);
    return { success: false, error: error.message, report };
  }
}
