export type Gender = 'male' | 'female' | 'unspecified';

export interface AuthUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

export interface UserProfile {
  uid: string;
  michatId: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  bio: string;
  gender: Gender;
  region: string;
  latitude?: number;
  longitude?: number;
  isOnline: boolean;
  lastSeen: any;
  createdAt: any;
  blockedUsers?: string[];
  passwordHash?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  imageUrl?: string;
  type: 'text' | 'image' | 'bottle_greeting' | 'sticker';
  readBy: string[];
  createdAt: any;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  participantDetails: Record<string, {
    displayName: string;
    avatarUrl: string;
    michatId: string;
    isOnline?: boolean;
  }>;
  lastMessage?: string;
  lastSenderId?: string;
  lastUpdated: any;
  unreadCount?: Record<string, number>;
  isGroup?: boolean;
  groupName?: string;
  createdAt: any;
}

export interface BottleMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderGender: Gender;
  senderRegion: string;
  content: string;
  createdAt: any;
  fishedCount?: number;
  repliesCount?: number;
}

export interface MomentPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorMichatId: string;
  content: string;
  imageUrl?: string;
  likes: string[]; // array of uids
  commentsCount: number;
  createdAt: any;
}

export interface MomentComment {
  id: string;
  momentId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: any;
}
