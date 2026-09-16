import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  passwordHash: text('password_hash'),
  displayName: text('display_name').notNull(),
  michatId: text('michat_id').unique(),
  gender: text('gender').default('female'),
  bio: text('bio').default(''),
  region: text('region').default('Indonesia'),
  avatarUrl: text('avatar_url').default(''),
  blockedUsers: text('blocked_users').default('[]'),
  isOnline: boolean('is_online').default(true),
  lastSeen: timestamp('last_seen').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Conversations / Chats table
export const conversations = pgTable('conversations', {
  id: text('id').primaryKey(),
  participants: text('participants').notNull().default('[]'),
  participantDetails: text('participant_details').notNull().default('{}'),
  lastMessage: text('last_message').default(''),
  lastSenderId: text('last_sender_id').default(''),
  unreadCount: text('unread_count').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: text('conversation_id').notNull(),
  senderId: text('sender_id').notNull(),
  recipientId: text('recipient_id').notNull(),
  text: text('text').notNull(),
  status: text('status').default('sent'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Moments table
export const moments = pgTable('moments', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  authorName: text('author_name').notNull(),
  authorAvatar: text('author_avatar').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  location: text('location'),
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0),
  likes: text('likes').default('[]'),
  comments: text('comments').default('[]'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Drift Bottles table
export const bottles = pgTable('bottles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  authorName: text('author_name').notNull(),
  authorAvatar: text('author_avatar').notNull(),
  authorGender: text('author_gender').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  moments: many(moments),
  bottles: many(bottles),
}));

export const momentsRelations = relations(moments, ({ one }) => ({
  author: one(users, {
    fields: [moments.userId],
    references: [users.uid],
  }),
}));

export const bottlesRelations = relations(bottles, ({ one }) => ({
  author: one(users, {
    fields: [bottles.userId],
    references: [users.uid],
  }),
}));
