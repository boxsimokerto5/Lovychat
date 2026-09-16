var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");

// src/db/index.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = require("pg");

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  bottles: () => bottles,
  bottlesRelations: () => bottlesRelations,
  conversations: () => conversations,
  messages: () => messages,
  moments: () => moments,
  momentsRelations: () => momentsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
var import_drizzle_orm = require("drizzle-orm");
var import_pg_core = require("drizzle-orm/pg-core");
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  uid: (0, import_pg_core.text)("uid").notNull().unique(),
  email: (0, import_pg_core.text)("email").notNull(),
  passwordHash: (0, import_pg_core.text)("password_hash"),
  displayName: (0, import_pg_core.text)("display_name").notNull(),
  michatId: (0, import_pg_core.text)("michat_id").unique(),
  gender: (0, import_pg_core.text)("gender").default("female"),
  bio: (0, import_pg_core.text)("bio").default(""),
  region: (0, import_pg_core.text)("region").default("Indonesia"),
  avatarUrl: (0, import_pg_core.text)("avatar_url").default(""),
  blockedUsers: (0, import_pg_core.text)("blocked_users").default("[]"),
  isOnline: (0, import_pg_core.boolean)("is_online").default(true),
  lastSeen: (0, import_pg_core.timestamp)("last_seen").defaultNow(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var conversations = (0, import_pg_core.pgTable)("conversations", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  participants: (0, import_pg_core.text)("participants").notNull().default("[]"),
  participantDetails: (0, import_pg_core.text)("participant_details").notNull().default("{}"),
  lastMessage: (0, import_pg_core.text)("last_message").default(""),
  lastSenderId: (0, import_pg_core.text)("last_sender_id").default(""),
  unreadCount: (0, import_pg_core.text)("unread_count").default("{}"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var messages = (0, import_pg_core.pgTable)("messages", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  conversationId: (0, import_pg_core.text)("conversation_id").notNull(),
  senderId: (0, import_pg_core.text)("sender_id").notNull(),
  recipientId: (0, import_pg_core.text)("recipient_id").notNull(),
  text: (0, import_pg_core.text)("text").notNull(),
  status: (0, import_pg_core.text)("status").default("sent"),
  imageUrl: (0, import_pg_core.text)("image_url"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var moments = (0, import_pg_core.pgTable)("moments", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.text)("user_id").notNull(),
  authorName: (0, import_pg_core.text)("author_name").notNull(),
  authorAvatar: (0, import_pg_core.text)("author_avatar").notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  imageUrl: (0, import_pg_core.text)("image_url"),
  location: (0, import_pg_core.text)("location"),
  likesCount: (0, import_pg_core.integer)("likes_count").default(0),
  commentsCount: (0, import_pg_core.integer)("comments_count").default(0),
  likes: (0, import_pg_core.text)("likes").default("[]"),
  comments: (0, import_pg_core.text)("comments").default("[]"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var bottles = (0, import_pg_core.pgTable)("bottles", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.text)("user_id").notNull(),
  authorName: (0, import_pg_core.text)("author_name").notNull(),
  authorAvatar: (0, import_pg_core.text)("author_avatar").notNull(),
  authorGender: (0, import_pg_core.text)("author_gender").notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var usersRelations = (0, import_drizzle_orm.relations)(users, ({ many }) => ({
  moments: many(moments),
  bottles: many(bottles)
}));
var momentsRelations = (0, import_drizzle_orm.relations)(moments, ({ one }) => ({
  author: one(users, {
    fields: [moments.userId],
    references: [users.uid]
  })
}));
var bottlesRelations = (0, import_drizzle_orm.relations)(bottles, ({ one }) => ({
  author: one(users, {
    fields: [bottles.userId],
    references: [users.uid]
  })
}));

// src/db/index.ts
var createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new import_pg.Pool({
      host: process.env.SQL_HOST,
      port: 5432,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: 15e3
    });
    global._postgresPool.on("error", (err) => {
      console.error("Unexpected error on idle SQL pool client:", err);
    });
  }
  return global._postgresPool;
};
var pool = createPool();
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// src/db/queries.ts
var import_drizzle_orm2 = require("drizzle-orm");

// src/db/supabaseClient.ts
var import_supabase_js = require("@supabase/supabase-js");
var rawUrl = process.env.SUPABASE_URL || "https://guccrttvdzegmqxhrvgp.supabase.co/rest/v1/";
var SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
var SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Y2NydHR2ZHplZ21xeGhydmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTQyODMsImV4cCI6MjEwNDk5MDI4M30.lIB_zUGhd4pXbCbjOMw1tuTQrg-T41Dr5DnH-_zXr7M";
var supabase = (0, import_supabase_js.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
var isSupabaseTested = false;
var isSupabaseAvailable = false;
async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("users").select("id").limit(1);
    if (!error) {
      isSupabaseTested = true;
      isSupabaseAvailable = true;
      return {
        connected: true,
        url: SUPABASE_URL,
        projectRef: "guccrttvdzegmqxhrvgp",
        tablesReady: true,
        message: "Terkoneksi ke Supabase dan tabel siap digunakan."
      };
    }
    if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
      isSupabaseTested = true;
      isSupabaseAvailable = false;
      return {
        connected: true,
        url: SUPABASE_URL,
        projectRef: "guccrttvdzegmqxhrvgp",
        tablesReady: false,
        message: "Koneksi ke Supabase berhasil! Namun tabel database belum dibuat di Supabase SQL Editor."
      };
    }
    return {
      connected: false,
      url: SUPABASE_URL,
      projectRef: "guccrttvdzegmqxhrvgp",
      tablesReady: false,
      message: error.message || "Gagal menghubungi Supabase."
    };
  } catch (err) {
    return {
      connected: false,
      url: SUPABASE_URL,
      projectRef: "guccrttvdzegmqxhrvgp",
      tablesReady: false,
      message: err?.message || "Error koneksi Supabase"
    };
  }
}

// src/db/supabaseQueries.ts
function formatUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    uid: row.uid,
    email: row.email,
    passwordHash: row.password_hash,
    displayName: row.display_name,
    michatId: row.michat_id,
    gender: row.gender || "female",
    bio: row.bio || "",
    region: row.region || "Indonesia",
    avatarUrl: row.avatar_url || "",
    blockedUsers: row.blocked_users || "[]",
    isOnline: row.is_online ?? true,
    lastSeen: row.last_seen ? new Date(row.last_seen) : /* @__PURE__ */ new Date(),
    createdAt: row.created_at ? new Date(row.created_at) : /* @__PURE__ */ new Date()
  };
}
function formatMessageRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    text: row.text,
    status: row.status || "sent",
    imageUrl: row.image_url || null,
    createdAt: row.created_at ? new Date(row.created_at) : /* @__PURE__ */ new Date()
  };
}
function formatMomentRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    content: row.content,
    imageUrl: row.image_url || null,
    location: row.location || "Indonesia",
    likesCount: Number(row.likes_count || 0),
    commentsCount: Number(row.comments_count || 0),
    likes: row.likes || "[]",
    comments: row.comments || "[]",
    createdAt: row.created_at ? new Date(row.created_at) : /* @__PURE__ */ new Date()
  };
}
function formatBottleRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    authorGender: row.author_gender || "female",
    content: row.content,
    createdAt: row.created_at ? new Date(row.created_at) : /* @__PURE__ */ new Date()
  };
}
function formatConversationRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    participants: row.participants || "[]",
    participantDetails: row.participant_details || "{}",
    lastMessage: row.last_message || "",
    lastSenderId: row.last_sender_id || "",
    unreadCount: row.unread_count || "{}",
    createdAt: row.created_at ? new Date(row.created_at) : /* @__PURE__ */ new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : /* @__PURE__ */ new Date()
  };
}
var supabaseQueries = {
  async getUserByEmailOrId(input) {
    const clean = input.trim();
    const cleanLower = clean.toLowerCase();
    const { data, error } = await supabase.from("users").select("*").or(`email.ilike.${cleanLower},michat_id.ilike.${cleanLower},display_name.ilike.${clean}`).limit(1);
    if (error) throw error;
    if (data && data.length > 0) {
      return formatUserRow(data[0]);
    }
    return null;
  },
  async getUserByUid(uid) {
    const { data, error } = await supabase.from("users").select("*").eq("uid", uid).maybeSingle();
    if (error) throw error;
    return formatUserRow(data);
  },
  async createOrUpdateUser(userData) {
    let blockedStr = "[]";
    if (userData.blockedUsers !== void 0) {
      blockedStr = Array.isArray(userData.blockedUsers) ? JSON.stringify(userData.blockedUsers) : userData.blockedUsers;
    }
    const payload = {
      uid: userData.uid,
      last_seen: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (userData.email !== void 0) payload.email = userData.email;
    if (userData.passwordHash !== void 0) payload.password_hash = userData.passwordHash;
    if (userData.displayName !== void 0) payload.display_name = userData.displayName;
    if (userData.michatId !== void 0) payload.michat_id = userData.michatId;
    if (userData.gender !== void 0) payload.gender = userData.gender;
    if (userData.bio !== void 0) payload.bio = userData.bio;
    if (userData.region !== void 0) payload.region = userData.region;
    if (userData.avatarUrl !== void 0) payload.avatar_url = userData.avatarUrl;
    if (userData.isOnline !== void 0) payload.is_online = userData.isOnline;
    if (userData.blockedUsers !== void 0) payload.blocked_users = blockedStr;
    const { data, error } = await supabase.from("users").upsert(payload, { onConflict: "uid" }).select().single();
    if (error) throw error;
    return formatUserRow(data);
  },
  async getAllUsers() {
    const { data, error } = await supabase.from("users").select("*").order("last_seen", { ascending: false }).limit(50);
    if (error) throw error;
    return (data || []).map(formatUserRow);
  },
  async blockOrUnblockUser(userUid, targetUid, action) {
    const existing = await this.getUserByUid(userUid);
    if (!existing) throw new Error("User not found in Supabase");
    let list = [];
    try {
      list = JSON.parse(existing.blockedUsers || "[]");
    } catch {
      list = [];
    }
    if (action === "block") {
      if (!list.includes(targetUid)) list.push(targetUid);
    } else {
      list = list.filter((id) => id !== targetUid);
    }
    const { data, error } = await supabase.from("users").update({
      blocked_users: JSON.stringify(list),
      last_seen: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("uid", userUid).select().single();
    if (error) throw error;
    return { success: true, blockedUsers: list, user: formatUserRow(data) };
  },
  async getConversationMessages(conversationId) {
    const { data, error } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(100);
    if (error) throw error;
    return (data || []).map(formatMessageRow);
  },
  async insertMessage(msg) {
    const { data, error } = await supabase.from("messages").insert({
      conversation_id: msg.conversationId,
      sender_id: msg.senderId,
      recipient_id: msg.recipientId,
      text: msg.text,
      image_url: msg.imageUrl || null,
      status: "sent"
    }).select().single();
    if (error) throw error;
    return formatMessageRow(data);
  },
  async clearUserMessagesOnLogout(userUid) {
    const { error: err1 } = await supabase.from("messages").delete().or(`sender_id.eq.${userUid},recipient_id.eq.${userUid}`);
    if (err1) {
      console.warn("[Supabase] Clear messages on logout notice:", err1.message);
    }
    return { success: !err1 };
  },
  async cleanupExpiredMoments() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString();
    const { error } = await supabase.from("moments").delete().lt("created_at", twentyFourHoursAgo);
    if (error) {
      console.warn("[Supabase] Cleanup expired moments notice:", error.message);
    }
    return { success: !error };
  },
  async getAllMoments() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString();
    const { data, error } = await supabase.from("moments").select("*").gte("created_at", twentyFourHoursAgo).order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return (data || []).map(formatMomentRow);
  },
  async insertMoment(momentData) {
    const { data, error } = await supabase.from("moments").insert({
      user_id: momentData.userId,
      author_name: momentData.authorName,
      author_avatar: momentData.authorAvatar,
      content: momentData.content,
      image_url: momentData.imageUrl || null,
      location: momentData.location || "Indonesia",
      likes_count: 0,
      comments_count: 0,
      likes: "[]",
      comments: "[]"
    }).select().single();
    if (error) throw error;
    return formatMomentRow(data);
  },
  async deleteMomentById(momentId, userUid) {
    const { data, error } = await supabase.from("moments").delete().eq("id", momentId).select().maybeSingle();
    if (error) throw error;
    return formatMomentRow(data);
  },
  async toggleMomentLike(momentId, userUid) {
    const { data: m, error: fetchErr } = await supabase.from("moments").select("*").eq("id", momentId).single();
    if (fetchErr || !m) throw new Error("Moment not found");
    let likes = [];
    try {
      likes = JSON.parse(m.likes || "[]");
    } catch {
      likes = [];
    }
    if (likes.includes(userUid)) {
      likes = likes.filter((id) => id !== userUid);
    } else {
      likes.push(userUid);
    }
    const { data, error } = await supabase.from("moments").update({
      likes: JSON.stringify(likes),
      likes_count: likes.length
    }).eq("id", momentId).select().single();
    if (error) throw error;
    return formatMomentRow(data);
  },
  async addMomentComment(momentId, comment) {
    const { data: m, error: fetchErr } = await supabase.from("moments").select("*").eq("id", momentId).single();
    if (fetchErr || !m) throw new Error("Moment not found");
    let comments = [];
    try {
      comments = JSON.parse(m.comments || "[]");
    } catch {
      comments = [];
    }
    const newComment = {
      id: "cm_" + Math.random().toString(36).substring(2, 9),
      ...comment,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    comments.push(newComment);
    const { data, error } = await supabase.from("moments").update({
      comments: JSON.stringify(comments),
      comments_count: comments.length
    }).eq("id", momentId).select().single();
    if (error) throw error;
    return { moment: formatMomentRow(data), comment: newComment };
  },
  async getAllBottles() {
    const { data, error } = await supabase.from("bottles").select("*").order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return (data || []).map(formatBottleRow);
  },
  async insertBottle(bottleData) {
    const { data, error } = await supabase.from("bottles").insert({
      user_id: bottleData.userId,
      author_name: bottleData.authorName,
      author_avatar: bottleData.authorAvatar,
      author_gender: bottleData.authorGender,
      content: bottleData.content
    }).select().single();
    if (error) throw error;
    return formatBottleRow(data);
  },
  async getUserConversations(userUid) {
    const { data, error } = await supabase.from("conversations").select("*").order("updated_at", { ascending: false }).limit(100);
    if (error) throw error;
    const formatted = (data || []).map(formatConversationRow);
    return formatted.filter((c) => {
      try {
        const parts = JSON.parse(c.participants || "[]");
        return Array.isArray(parts) && parts.includes(userUid);
      } catch {
        return false;
      }
    });
  },
  async getOrCreateConversation(data) {
    const { data: all, error } = await supabase.from("conversations").select("*").limit(200);
    if (error) throw error;
    const sortedTargetParts = [...data.participants].sort().join(":");
    const existing = (all || []).find((c) => {
      if (data.id && c.id === data.id) return true;
      try {
        const parts = JSON.parse(c.participants || "[]");
        return [...parts].sort().join(":") === sortedTargetParts;
      } catch {
        return false;
      }
    });
    if (existing) {
      return formatConversationRow(existing);
    }
    const newId = data.id || "chat_" + Math.random().toString(36).substring(2, 12);
    const { data: inserted, error: insErr } = await supabase.from("conversations").insert({
      id: newId,
      participants: JSON.stringify(data.participants),
      participant_details: JSON.stringify(data.participantDetails),
      last_message: data.lastMessage || "Halo, salam kenal!",
      last_sender_id: data.lastSenderId || data.participants[0],
      unread_count: JSON.stringify(
        data.participants.reduce((acc, uid) => {
          acc[uid] = uid === data.lastSenderId ? 0 : 1;
          return acc;
        }, {})
      )
    }).select().single();
    if (insErr) throw insErr;
    return formatConversationRow(inserted);
  },
  async markConversationRead(convId, userUid) {
    const { data: conv, error: fetchErr } = await supabase.from("conversations").select("*").eq("id", convId).single();
    if (fetchErr || !conv) return null;
    let unread = {};
    try {
      unread = JSON.parse(conv.unread_count || "{}");
    } catch {
      unread = {};
    }
    unread[userUid] = 0;
    const { data, error } = await supabase.from("conversations").update({
      unread_count: JSON.stringify(unread)
    }).eq("id", convId).select().single();
    if (error) return null;
    return formatConversationRow(data);
  }
};

// src/db/queries.ts
var supabaseTablesMissingWarned = false;
function isTableMissingError(err) {
  return err?.code === "PGRST205" || err?.message?.includes("schema cache") || err?.message?.includes("does not exist");
}
async function getUserByEmailOrId(input) {
  try {
    const res = await supabaseQueries.getUserByEmailOrId(input);
    if (res) return res;
  } catch (err) {
    if (isTableMissingError(err)) {
      if (!supabaseTablesMissingWarned) {
        console.warn("[Supabase] Tables not created yet in Supabase. Run supabase_schema.sql in Supabase SQL Editor.");
        supabaseTablesMissingWarned = true;
      }
    } else {
      console.warn("[Supabase] getUserByEmailOrId notice:", err?.message);
    }
  }
  try {
    const clean = input.trim();
    const cleanLower = clean.toLowerCase();
    const res = await db.select().from(users).where(
      (0, import_drizzle_orm2.or)(
        (0, import_drizzle_orm2.eq)(users.email, cleanLower),
        (0, import_drizzle_orm2.eq)(users.email, clean),
        (0, import_drizzle_orm2.eq)(users.michatId, clean),
        (0, import_drizzle_orm2.eq)(users.michatId, cleanLower),
        (0, import_drizzle_orm2.eq)(users.displayName, clean)
      )
    ).limit(1);
    if (res.length > 0) {
      return res[0];
    }
    const all = await db.select().from(users).limit(100);
    const matched = all.find(
      (u) => u.email.toLowerCase() === cleanLower || u.michatId && u.michatId.toLowerCase() === cleanLower || u.displayName.toLowerCase() === cleanLower || cleanLower.includes("@") && u.email.toLowerCase().split("@")[0] === cleanLower.split("@")[0]
    );
    return matched || null;
  } catch (error) {
    console.error("Database getUserByEmailOrId failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}
async function getUserByUid(uid) {
  try {
    const res = await supabaseQueries.getUserByUid(uid);
    if (res) return res;
  } catch (err) {
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] getUserByUid notice:", err?.message);
    }
  }
  try {
    const res = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.uid, uid)).limit(1);
    return res[0] || null;
  } catch (error) {
    console.error("Database getUserByUid failed:", error);
    throw new Error("Database query failed.", { cause: error });
  }
}
async function createOrUpdateUser(userData) {
  let supabaseSuccess = false;
  let supabaseResult = null;
  try {
    supabaseResult = await supabaseQueries.createOrUpdateUser(userData);
    if (supabaseResult) {
      supabaseSuccess = true;
    }
  } catch (err) {
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] createOrUpdateUser notice:", err?.message);
    }
  }
  try {
    const existing = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.uid, userData.uid)).limit(1);
    let blockedStr = void 0;
    if (userData.blockedUsers !== void 0) {
      blockedStr = Array.isArray(userData.blockedUsers) ? JSON.stringify(userData.blockedUsers) : userData.blockedUsers;
    }
    let localResult = null;
    if (existing.length > 0) {
      const updated = await db.update(users).set({
        email: userData.email ?? existing[0].email,
        displayName: userData.displayName ?? existing[0].displayName,
        gender: userData.gender ?? existing[0].gender,
        bio: userData.bio ?? existing[0].bio,
        region: userData.region ?? existing[0].region,
        avatarUrl: userData.avatarUrl ?? existing[0].avatarUrl,
        passwordHash: userData.passwordHash ?? existing[0].passwordHash,
        michatId: userData.michatId ?? existing[0].michatId,
        isOnline: userData.isOnline ?? existing[0].isOnline,
        blockedUsers: blockedStr ?? existing[0].blockedUsers ?? "[]",
        lastSeen: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm2.eq)(users.uid, userData.uid)).returning();
      localResult = updated[0];
    } else {
      const inserted = await db.insert(users).values({
        uid: userData.uid,
        email: userData.email || `${userData.uid}@lovychat.internal`,
        passwordHash: userData.passwordHash || null,
        displayName: userData.displayName || "Pengguna LovyChat",
        michatId: userData.michatId || null,
        gender: userData.gender || "female",
        bio: userData.bio || "",
        region: userData.region || "Indonesia",
        avatarUrl: userData.avatarUrl || "",
        blockedUsers: blockedStr || "[]",
        isOnline: userData.isOnline ?? true,
        lastSeen: /* @__PURE__ */ new Date(),
        createdAt: /* @__PURE__ */ new Date()
      }).returning();
      localResult = inserted[0];
    }
    return supabaseSuccess ? supabaseResult : localResult;
  } catch (error) {
    if (supabaseSuccess) return supabaseResult;
    console.error("Database createOrUpdateUser failed:", error);
    throw new Error("Failed to save user in database.", { cause: error });
  }
}
async function blockOrUnblockUser(userUid, targetUid, action) {
  try {
    const res = await supabaseQueries.blockOrUnblockUser(userUid, targetUid, action);
    if (res) return res;
  } catch (err) {
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] blockOrUnblockUser notice:", err?.message);
    }
  }
  try {
    const existing = await getUserByUid(userUid);
    if (!existing) {
      throw new Error("User not found");
    }
    let list = [];
    try {
      list = JSON.parse(existing.blockedUsers || "[]");
    } catch {
      list = [];
    }
    if (action === "block") {
      if (!list.includes(targetUid)) {
        list.push(targetUid);
      }
    } else {
      list = list.filter((id) => id !== targetUid);
    }
    const updated = await db.update(users).set({
      blockedUsers: JSON.stringify(list),
      lastSeen: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm2.eq)(users.uid, userUid)).returning();
    return { success: true, blockedUsers: list, user: updated[0] };
  } catch (error) {
    console.error("Database blockOrUnblockUser failed:", error);
    throw new Error("Failed to update block list.", { cause: error });
  }
}
async function getAllUsers() {
  let supabaseFailed = false;
  try {
    const res = await supabaseQueries.getAllUsers();
    if (Array.isArray(res)) return res;
  } catch (err) {
    supabaseFailed = true;
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] getAllUsers notice:", err?.message);
    }
  }
  if (!supabaseFailed) return [];
  try {
    return await db.select().from(users).orderBy((0, import_drizzle_orm2.desc)(users.lastSeen)).limit(50);
  } catch (error) {
    console.warn("Local database getAllUsers notice:", error);
    return [];
  }
}
async function getConversationMessages(conversationId) {
  let supabaseFailed = false;
  try {
    const res = await supabaseQueries.getConversationMessages(conversationId);
    if (Array.isArray(res)) return res;
  } catch (err) {
    supabaseFailed = true;
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] getConversationMessages notice:", err?.message);
    }
  }
  if (!supabaseFailed) return [];
  try {
    return await db.select().from(messages).where((0, import_drizzle_orm2.eq)(messages.conversationId, conversationId)).orderBy(messages.createdAt).limit(100);
  } catch (error) {
    console.warn("Local database getConversationMessages notice:", error);
    return [];
  }
}
async function insertMessage(msg) {
  let supabaseResult = null;
  try {
    supabaseResult = await supabaseQueries.insertMessage(msg);
  } catch (err) {
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] insertMessage notice:", err?.message);
    }
  }
  try {
    const res = await db.insert(messages).values({
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      text: msg.text,
      imageUrl: msg.imageUrl || null,
      status: "sent",
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return supabaseResult || res[0];
  } catch (error) {
    if (supabaseResult) return supabaseResult;
    console.error("Database insertMessage failed:", error);
    throw new Error("Failed to send message.", { cause: error });
  }
}
async function clearUserMessagesOnLogout(userUid) {
  try {
    await supabaseQueries.clearUserMessagesOnLogout(userUid);
  } catch (err) {
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] clearUserMessagesOnLogout notice:", err?.message);
    }
  }
  try {
    await db.delete(messages).where(
      (0, import_drizzle_orm2.or)((0, import_drizzle_orm2.eq)(messages.senderId, userUid), (0, import_drizzle_orm2.eq)(messages.recipientId, userUid))
    );
    return { success: true };
  } catch (error) {
    console.error("Database clearUserMessagesOnLogout failed:", error);
    return { success: false };
  }
}
async function cleanupExpiredMoments() {
  try {
    await supabaseQueries.cleanupExpiredMoments();
  } catch (err) {
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] cleanupExpiredMoments notice:", err?.message);
    }
  }
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
    await db.delete(moments).where((0, import_drizzle_orm2.lt)(moments.createdAt, twentyFourHoursAgo));
    return { success: true };
  } catch (error) {
    console.error("Database cleanupExpiredMoments failed:", error);
    return { success: false };
  }
}
async function getAllMoments() {
  let supabaseFailed = false;
  try {
    const res = await supabaseQueries.getAllMoments();
    if (Array.isArray(res)) return res;
  } catch (err) {
    supabaseFailed = true;
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] getAllMoments notice:", err?.message);
    }
  }
  if (!supabaseFailed) return [];
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
    return await db.select().from(moments).where((0, import_drizzle_orm2.gte)(moments.createdAt, twentyFourHoursAgo)).orderBy((0, import_drizzle_orm2.desc)(moments.createdAt)).limit(50);
  } catch (error) {
    console.warn("Local database getAllMoments notice:", error);
    return [];
  }
}
async function insertMoment(momentData) {
  let supabaseResult = null;
  try {
    supabaseResult = await supabaseQueries.insertMoment(momentData);
  } catch (err) {
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] insertMoment notice:", err?.message);
    }
  }
  try {
    const res = await db.insert(moments).values({
      userId: momentData.userId,
      authorName: momentData.authorName,
      authorAvatar: momentData.authorAvatar,
      content: momentData.content,
      imageUrl: momentData.imageUrl || null,
      location: momentData.location || "Indonesia",
      likesCount: 0,
      commentsCount: 0,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return supabaseResult || res[0];
  } catch (error) {
    if (supabaseResult) return supabaseResult;
    console.error("Database insertMoment failed:", error);
    throw new Error("Failed to create moment.", { cause: error });
  }
}
async function getAllBottles() {
  let supabaseFailed = false;
  try {
    const res = await supabaseQueries.getAllBottles();
    if (Array.isArray(res)) return res;
  } catch (err) {
    supabaseFailed = true;
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] getAllBottles notice:", err?.message);
    }
  }
  if (!supabaseFailed) return [];
  try {
    return await db.select().from(bottles).orderBy((0, import_drizzle_orm2.desc)(bottles.createdAt)).limit(50);
  } catch (error) {
    console.warn("Local database getAllBottles notice:", error);
    return [];
  }
}
async function insertBottle(bottleData) {
  let supabaseResult = null;
  try {
    supabaseResult = await supabaseQueries.insertBottle(bottleData);
  } catch (err) {
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] insertBottle notice:", err?.message);
    }
  }
  try {
    const res = await db.insert(bottles).values({
      userId: bottleData.userId,
      authorName: bottleData.authorName,
      authorAvatar: bottleData.authorAvatar,
      authorGender: bottleData.authorGender,
      content: bottleData.content,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return supabaseResult || res[0];
  } catch (error) {
    if (supabaseResult) return supabaseResult;
    console.error("Database insertBottle failed:", error);
    throw new Error("Failed to throw drift bottle.", { cause: error });
  }
}
async function getUserConversations(userUid) {
  let supabaseFailed = false;
  try {
    const res = await supabaseQueries.getUserConversations(userUid);
    if (Array.isArray(res)) return res;
  } catch (err) {
    supabaseFailed = true;
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] getUserConversations notice:", err?.message);
    }
  }
  if (!supabaseFailed) return [];
  try {
    const all = await db.select().from(conversations).orderBy((0, import_drizzle_orm2.desc)(conversations.updatedAt)).limit(100);
    return all.filter((c) => {
      try {
        const parts = JSON.parse(c.participants || "[]");
        return Array.isArray(parts) && parts.includes(userUid);
      } catch {
        return false;
      }
    });
  } catch (error) {
    console.warn("Local database getUserConversations notice:", error);
    return [];
  }
}
async function getOrCreateConversation(data) {
  let supabaseResult = null;
  try {
    supabaseResult = await supabaseQueries.getOrCreateConversation(data);
    if (supabaseResult) return supabaseResult;
  } catch (err) {
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] getOrCreateConversation notice:", err?.message);
    }
  }
  try {
    const all = await db.select().from(conversations).limit(200);
    const sortedTargetParts = [...data.participants].sort().join(":");
    const existing = all.find((c) => {
      if (data.id && c.id === data.id) return true;
      try {
        const parts = JSON.parse(c.participants || "[]");
        return [...parts].sort().join(":") === sortedTargetParts;
      } catch {
        return false;
      }
    });
    if (existing) {
      return existing;
    }
    const newId = data.id || "chat_" + Math.random().toString(36).substring(2, 12);
    const inserted = await db.insert(conversations).values({
      id: newId,
      participants: JSON.stringify(data.participants),
      participantDetails: JSON.stringify(data.participantDetails),
      lastMessage: data.lastMessage || "Halo, salam kenal!",
      lastSenderId: data.lastSenderId || data.participants[0],
      unreadCount: JSON.stringify(
        data.participants.reduce((acc, uid) => {
          acc[uid] = uid === data.lastSenderId ? 0 : 1;
          return acc;
        }, {})
      ),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return inserted[0];
  } catch (error) {
    console.error("Database getOrCreateConversation failed:", error);
    throw new Error("Failed to create or retrieve conversation.", { cause: error });
  }
}
async function markConversationRead(convId, userUid) {
  try {
    const res = await supabaseQueries.markConversationRead(convId, userUid);
    if (res) return res;
  } catch (err) {
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] markConversationRead notice:", err?.message);
    }
  }
  try {
    const res = await db.select().from(conversations).where((0, import_drizzle_orm2.eq)(conversations.id, convId)).limit(1);
    if (res.length === 0) return null;
    const conv = res[0];
    let unread = {};
    try {
      unread = JSON.parse(conv.unreadCount || "{}");
    } catch {
      unread = {};
    }
    unread[userUid] = 0;
    const updated = await db.update(conversations).set({
      unreadCount: JSON.stringify(unread)
    }).where((0, import_drizzle_orm2.eq)(conversations.id, convId)).returning();
    return updated[0];
  } catch (error) {
    console.error("Database markConversationRead failed:", error);
    return null;
  }
}
async function deleteMomentById(momentId, userUid) {
  try {
    const res = await supabaseQueries.deleteMomentById(momentId, userUid);
    if (res) return res;
  } catch (err) {
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] deleteMomentById notice:", err?.message);
    }
  }
  try {
    const res = await db.delete(moments).where((0, import_drizzle_orm2.eq)(moments.id, momentId)).returning();
    return res[0] || null;
  } catch (error) {
    console.error("Database deleteMomentById failed:", error);
    throw new Error("Failed to delete moment.", { cause: error });
  }
}
async function toggleMomentLike(momentId, userUid) {
  try {
    const res = await supabaseQueries.toggleMomentLike(momentId, userUid);
    if (res) return res;
  } catch (err) {
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] toggleMomentLike notice:", err?.message);
    }
  }
  try {
    const res = await db.select().from(moments).where((0, import_drizzle_orm2.eq)(moments.id, momentId)).limit(1);
    if (res.length === 0) throw new Error("Moment not found");
    const m = res[0];
    let likes = [];
    try {
      likes = JSON.parse(m.likes || "[]");
    } catch {
      likes = [];
    }
    if (likes.includes(userUid)) {
      likes = likes.filter((id) => id !== userUid);
    } else {
      likes.push(userUid);
    }
    const updated = await db.update(moments).set({
      likes: JSON.stringify(likes),
      likesCount: likes.length
    }).where((0, import_drizzle_orm2.eq)(moments.id, momentId)).returning();
    return updated[0];
  } catch (error) {
    console.error("Database toggleMomentLike failed:", error);
    throw new Error("Failed to toggle like on moment.", { cause: error });
  }
}
async function addMomentComment(momentId, comment) {
  try {
    const res = await supabaseQueries.addMomentComment(momentId, comment);
    if (res) return res;
  } catch (err) {
    if (!isTableMissingError(err)) {
      console.warn("[Supabase] addMomentComment notice:", err?.message);
    }
  }
  try {
    const res = await db.select().from(moments).where((0, import_drizzle_orm2.eq)(moments.id, momentId)).limit(1);
    if (res.length === 0) throw new Error("Moment not found");
    const m = res[0];
    let comments = [];
    try {
      comments = JSON.parse(m.comments || "[]");
    } catch {
      comments = [];
    }
    const newComment = {
      id: "cm_" + Math.random().toString(36).substring(2, 9),
      ...comment,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    comments.push(newComment);
    const updated = await db.update(moments).set({
      comments: JSON.stringify(comments),
      commentsCount: comments.length
    }).where((0, import_drizzle_orm2.eq)(moments.id, momentId)).returning();
    return { moment: updated[0], comment: newComment };
  } catch (error) {
    console.error("Database addMomentComment failed:", error);
    throw new Error("Failed to add comment to moment.", { cause: error });
  }
}

// src/utils/security.ts
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "_lovychat_secure_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// src/utils/avatars.ts
var AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80"
];
function getRandomAvatar(gender) {
  return AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)];
}
function generateMichatId() {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  let result = "lovy_";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// src/db/syncToSupabase.ts
async function syncLocalDataToSupabase() {
  const report = {
    usersSynced: 0,
    momentsSynced: 0,
    bottlesSynced: 0,
    messagesSynced: 0,
    conversationsSynced: 0
  };
  try {
    const localUsers = await db.select().from(users);
    for (const u of localUsers) {
      const { error } = await supabase.from("users").upsert(
        {
          uid: u.uid,
          email: u.email,
          password_hash: u.passwordHash,
          display_name: u.displayName,
          michat_id: u.michatId,
          gender: u.gender || "female",
          bio: u.bio || "",
          region: u.region || "Indonesia",
          avatar_url: u.avatarUrl || "",
          blocked_users: u.blockedUsers || "[]",
          is_online: u.isOnline ?? true,
          last_seen: u.lastSeen ? new Date(u.lastSeen).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
          created_at: u.createdAt ? new Date(u.createdAt).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
        },
        { onConflict: "uid" }
      );
      if (!error) report.usersSynced++;
    }
    const localMoments = await db.select().from(moments);
    for (const m of localMoments) {
      const { error } = await supabase.from("moments").upsert(
        {
          id: m.id,
          user_id: m.userId,
          author_name: m.authorName,
          author_avatar: m.authorAvatar,
          content: m.content,
          image_url: m.imageUrl || null,
          location: m.location || "Indonesia",
          likes_count: m.likesCount || 0,
          comments_count: m.commentsCount || 0,
          likes: "[]",
          comments: "[]",
          created_at: m.createdAt ? new Date(m.createdAt).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
        },
        { onConflict: "id" }
      );
      if (!error) report.momentsSynced++;
    }
    const localBottles = await db.select().from(bottles);
    for (const b of localBottles) {
      const { error } = await supabase.from("bottles").upsert(
        {
          id: b.id,
          user_id: b.userId,
          author_name: b.authorName,
          author_avatar: b.authorAvatar,
          author_gender: b.authorGender || "female",
          content: b.content,
          created_at: b.createdAt ? new Date(b.createdAt).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
        },
        { onConflict: "id" }
      );
      if (!error) report.bottlesSynced++;
    }
    const localConvs = await db.select().from(conversations);
    for (const c of localConvs) {
      const { error } = await supabase.from("conversations").upsert(
        {
          id: c.id,
          participants: c.participants || "[]",
          participant_details: c.participantDetails || "{}",
          last_message: c.lastMessage || "",
          last_sender_id: c.lastSenderId || "",
          unread_count: c.unreadCount || "{}",
          created_at: c.createdAt ? new Date(c.createdAt).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: c.updatedAt ? new Date(c.updatedAt).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
        },
        { onConflict: "id" }
      );
      if (!error) report.conversationsSynced++;
    }
    const localMsgs = await db.select().from(messages);
    for (const msg of localMsgs) {
      const { error } = await supabase.from("messages").upsert(
        {
          id: msg.id,
          conversation_id: msg.conversationId,
          sender_id: msg.senderId,
          recipient_id: msg.recipientId,
          text: msg.text,
          status: msg.status || "sent",
          image_url: msg.imageUrl || null,
          created_at: msg.createdAt ? new Date(msg.createdAt).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
        },
        { onConflict: "id" }
      );
      if (!error) report.messagesSynced++;
    }
    console.log("[Supabase Sync] Report:", report);
    return { success: true, report };
  } catch (error) {
    console.error("[Supabase Sync] Error:", error);
    return { success: false, error: error.message, report };
  }
}

// server.ts
var import_fs = __toESM(require("fs"), 1);
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
app.get("/api/supabase/status", async (_req, res) => {
  try {
    const status = await checkSupabaseConnection();
    res.json(status);
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});
app.post("/api/supabase/sync", async (_req, res) => {
  try {
    const result = await syncLocalDataToSupabase();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/supabase/schema", (_req, res) => {
  try {
    const schemaPath = import_path.default.join(process.cwd(), "supabase_schema.sql");
    if (import_fs.default.existsSync(schemaPath)) {
      const sql = import_fs.default.readFileSync(schemaPath, "utf-8");
      res.type("text/plain").send(sql);
    } else {
      res.status(404).send("-- File supabase_schema.sql tidak ditemukan");
    }
  } catch (err) {
    res.status(500).send(`-- Error: ${err.message}`);
  }
});
app.get("/api/health", async (_req, res) => {
  try {
    const users2 = await getAllUsers();
    res.json({ status: "ok", service: "active", userCount: users2.length });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, displayName, gender } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email dan kata sandi wajib diisi." });
    }
    const cleanEmail = email.trim().toLowerCase();
    const existing = await getUserByEmailOrId(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: "Email sudah terdaftar. Silakan gunakan tab Masuk." });
    }
    const pHash = await hashPassword(password);
    const uid = "usr_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    const michatId = generateMichatId();
    const avatarUrl = getRandomAvatar(gender || "female");
    const newUser = await createOrUpdateUser({
      uid,
      email: cleanEmail,
      passwordHash: pHash,
      displayName: displayName || cleanEmail.split("@")[0],
      michatId,
      gender: gender || "female",
      avatarUrl,
      bio: "Halo! Saya menggunakan LovyChat.",
      region: "Indonesia",
      isOnline: true
    });
    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({ user: safeUser });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: error.message || "Gagal mendaftarkan akun." });
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { emailOrId, password } = req.body;
    if (!emailOrId || !password) {
      return res.status(400).json({ error: "Email/ID dan kata sandi wajib diisi." });
    }
    const found = await getUserByEmailOrId(emailOrId);
    if (!found) {
      if (emailOrId.includes("@") && password && password.length >= 6) {
        const cleanEmail = emailOrId.trim().toLowerCase();
        const pHash = await hashPassword(password);
        const uid = "usr_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        const michatId = generateMichatId();
        const derivedName = cleanEmail.split("@")[0].replace(/[._-]+/g, " ").split(" ").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Pengguna LovyChat";
        const avatarUrl = getRandomAvatar("female");
        const newUser = await createOrUpdateUser({
          uid,
          email: cleanEmail,
          passwordHash: pHash,
          displayName: derivedName,
          michatId,
          gender: "female",
          avatarUrl,
          bio: "Halo! Saya menggunakan LovyChat.",
          region: "Indonesia",
          isOnline: true
        });
        const { passwordHash: _2, ...safeUser2 } = newUser;
        return res.status(200).json({
          user: safeUser2,
          isNewAccount: true,
          message: `Selamat datang! Akun untuk ${cleanEmail} telah otomatis dibuat.`
        });
      }
      return res.status(404).json({
        error: `Akun dengan email atau ID "${emailOrId}" belum terdaftar. Silakan pilih tab "Daftar Baru" untuk mendaftar akun.`
      });
    }
    if (found.passwordHash) {
      const inputHash = await hashPassword(password);
      if (found.passwordHash !== inputHash) {
        return res.status(401).json({ error: "Kata sandi yang Anda masukkan salah. Periksa kembali huruf besar/kecil." });
      }
    } else {
      const newHash = await hashPassword(password);
      await createOrUpdateUser({
        uid: found.uid,
        email: found.email,
        passwordHash: newHash,
        displayName: found.displayName
      });
    }
    const { passwordHash: _, ...safeUser } = found;
    return res.json({ user: safeUser });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message || "Gagal masuk akun." });
  }
});
app.post("/api/auth/google", async (req, res) => {
  try {
    const { uid, email, displayName, photoUrl } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email akun Google wajib disertakan." });
    }
    const cleanEmail = email.trim().toLowerCase();
    let existing = await getUserByEmailOrId(cleanEmail);
    if (!existing && uid) {
      existing = await getUserByUid(uid);
    }
    if (existing) {
      const updated = await createOrUpdateUser({
        uid: existing.uid,
        email: cleanEmail,
        displayName: existing.displayName || displayName || cleanEmail.split("@")[0],
        avatarUrl: existing.avatarUrl || photoUrl || getRandomAvatar("female"),
        isOnline: true
      });
      const { passwordHash: _2, ...safeUser2 } = updated;
      return res.json({ user: safeUser2, isNewAccount: false });
    }
    const targetUid = uid || "usr_g_" + Math.random().toString(36).substring(2, 10);
    const michatId = generateMichatId();
    const derivedName = displayName || cleanEmail.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    const newUser = await createOrUpdateUser({
      uid: targetUid,
      email: cleanEmail,
      displayName: derivedName || "Pengguna Google",
      michatId,
      gender: "female",
      avatarUrl: photoUrl || getRandomAvatar("female"),
      bio: "Halo! Saya bergabung di LovyChat via Akun Google.",
      region: "Indonesia",
      isOnline: true
    });
    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(200).json({ user: safeUser, isNewAccount: true });
  } catch (error) {
    console.error("Google auth endpoint error:", error);
    return res.status(500).json({ error: error.message || "Gagal memproses login Google." });
  }
});
app.post("/api/auth/sync", async (req, res) => {
  try {
    const profile = req.body;
    if (!profile || !profile.uid) {
      return res.status(400).json({ error: "UID pengguna wajib disertakan." });
    }
    const updated = await createOrUpdateUser(profile);
    const { passwordHash: _, ...safeUser } = updated;
    return res.json({ user: safeUser });
  } catch (error) {
    console.error("Profile sync error:", error);
    return res.status(500).json({ error: error.message || "Gagal sinkronisasi profil." });
  }
});
app.post("/api/auth/logout", async (req, res) => {
  try {
    const { uid } = req.body;
    if (uid) {
      await createOrUpdateUser({ uid, isOnline: false });
      await clearUserMessagesOnLogout(uid);
    }
    return res.json({ success: true, message: "Pesan berhasil dibersihkan saat logout." });
  } catch (error) {
    console.error("Logout cleanup error:", error);
    return res.status(500).json({ error: error.message || "Gagal memproses pembersihan saat logout." });
  }
});
app.post("/api/auth/block", async (req, res) => {
  try {
    const { userUid, targetUid, action } = req.body;
    if (!userUid || !targetUid) {
      return res.status(400).json({ error: "userUid and targetUid are required." });
    }
    const result = await blockOrUnblockUser(userUid, targetUid, action === "unblock" ? "unblock" : "block");
    const { passwordHash: _, ...safeUser } = result.user;
    return res.json({ success: true, blockedUsers: result.blockedUsers, user: safeUser });
  } catch (error) {
    console.error("Block action error:", error);
    return res.status(500).json({ error: error.message || "Gagal mengubah status blokir." });
  }
});
app.get("/api/users", async (_req, res) => {
  try {
    const all = await getAllUsers();
    const safeUsers = all.map(({ passwordHash: _, ...rest }) => rest);
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/users/:uid", async (req, res) => {
  try {
    const user = await getUserByUid(req.params.uid);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/chats", async (req, res) => {
  try {
    const userUid = req.query.userUid;
    if (!userUid || typeof userUid !== "string" || !userUid.trim() || userUid === "undefined" || userUid === "null") {
      return res.json([]);
    }
    const list = await getUserConversations(userUid);
    const formatted = (list || []).map((c) => {
      let participants = [];
      let participantDetails = {};
      let unreadCount = {};
      try {
        participants = JSON.parse(c.participants || "[]");
      } catch {
      }
      try {
        participantDetails = JSON.parse(c.participantDetails || "{}");
      } catch {
      }
      try {
        unreadCount = JSON.parse(c.unreadCount || "{}");
      } catch {
      }
      return {
        id: c.id,
        participants,
        participantDetails,
        lastMessage: c.lastMessage,
        lastSenderId: c.lastSenderId,
        unreadCount,
        createdAt: c.createdAt,
        lastUpdated: c.updatedAt
      };
    });
    res.json(formatted);
  } catch (error) {
    console.warn("/api/chats notice:", error?.message);
    res.json([]);
  }
});
app.post("/api/chats", async (req, res) => {
  try {
    const { id, participants, participantDetails, lastMessage, lastSenderId } = req.body;
    if (!participants || !Array.isArray(participants)) {
      return res.status(400).json({ error: "participants array is required." });
    }
    const conv = await getOrCreateConversation({
      id,
      participants,
      participantDetails: participantDetails || {},
      lastMessage,
      lastSenderId
    });
    let parts = [];
    let pDetails = {};
    let unread = {};
    try {
      parts = JSON.parse(conv.participants || "[]");
    } catch {
    }
    try {
      pDetails = JSON.parse(conv.participantDetails || "{}");
    } catch {
    }
    try {
      unread = JSON.parse(conv.unreadCount || "{}");
    } catch {
    }
    res.json({
      id: conv.id,
      participants: parts,
      participantDetails: pDetails,
      lastMessage: conv.lastMessage,
      lastSenderId: conv.lastSenderId,
      unreadCount: unread,
      createdAt: conv.createdAt,
      lastUpdated: conv.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/chats/:id/read", async (req, res) => {
  try {
    const { userUid } = req.body;
    if (!userUid) return res.status(400).json({ error: "userUid is required" });
    const updated = await markConversationRead(req.params.id, userUid);
    res.json({ success: true, conversation: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var conversationTypingMap = /* @__PURE__ */ new Map();
app.get("/api/chats/:id/typing", (req, res) => {
  try {
    const chatId = req.params.id;
    const excludeUid = req.query.excludeUid || "";
    const now = Date.now();
    const convMap = conversationTypingMap.get(chatId);
    if (!convMap) {
      return res.json({ isTyping: false, typingUserIds: [] });
    }
    for (const [uid, timestamp2] of convMap.entries()) {
      if (now - timestamp2 > 3500) {
        convMap.delete(uid);
      }
    }
    const typingUserIds = [];
    for (const [uid] of convMap.entries()) {
      if (!excludeUid || uid !== excludeUid) {
        typingUserIds.push(uid);
      }
    }
    return res.json({
      isTyping: typingUserIds.length > 0,
      typingUserIds
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/chats/:id/typing", (req, res) => {
  try {
    const chatId = req.params.id;
    const { userUid, isTyping } = req.body;
    if (!userUid) {
      return res.status(400).json({ error: "userUid is required" });
    }
    if (!conversationTypingMap.has(chatId)) {
      conversationTypingMap.set(chatId, /* @__PURE__ */ new Map());
    }
    const convMap = conversationTypingMap.get(chatId);
    if (isTyping) {
      convMap.set(userUid, Date.now());
    } else {
      convMap.delete(userUid);
    }
    return res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/moments", async (_req, res) => {
  try {
    const moments2 = await getAllMoments();
    const formatted = moments2.map((m) => {
      let likes = [];
      let comments = [];
      try {
        likes = JSON.parse(m.likes || "[]");
      } catch {
      }
      try {
        comments = JSON.parse(m.comments || "[]");
      } catch {
      }
      return {
        id: String(m.id),
        userId: m.userId,
        authorName: m.authorName,
        authorAvatar: m.authorAvatar,
        content: m.content,
        imageUrl: m.imageUrl,
        location: m.location,
        likesCount: m.likesCount || likes.length,
        commentsCount: m.commentsCount || comments.length,
        likes,
        comments,
        createdAt: m.createdAt
      };
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/moments", async (req, res) => {
  try {
    const moment = await insertMoment(req.body);
    res.status(201).json({
      id: String(moment.id),
      ...moment,
      likes: [],
      comments: []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/moments/:id", async (req, res) => {
  try {
    const momentId = parseInt(req.params.id, 10);
    const userUid = req.query.userUid;
    await deleteMomentById(momentId, userUid);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/moments/:id/like", async (req, res) => {
  try {
    const momentId = parseInt(req.params.id, 10);
    const { userUid } = req.body;
    if (!userUid) return res.status(400).json({ error: "userUid is required" });
    const updated = await toggleMomentLike(momentId, userUid);
    let likes = [];
    try {
      likes = JSON.parse(updated.likes || "[]");
    } catch {
    }
    res.json({ success: true, likes, likesCount: updated.likesCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/moments/:id/comment", async (req, res) => {
  try {
    const momentId = parseInt(req.params.id, 10);
    const { userId, userName, userAvatar, text: text2 } = req.body;
    if (!userId || !text2) return res.status(400).json({ error: "userId and text are required" });
    const result = await addMomentComment(momentId, {
      userId,
      userName: userName || "Pengguna",
      userAvatar: userAvatar || "",
      text: text2
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/bottles", async (_req, res) => {
  try {
    const bottles2 = await getAllBottles();
    const formatted = bottles2.map((b) => ({
      id: String(b.id),
      senderId: b.userId,
      senderName: b.authorName,
      senderAvatar: b.authorAvatar,
      senderGender: b.authorGender,
      content: b.content,
      createdAt: b.createdAt
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/bottles", async (req, res) => {
  try {
    const { senderId, senderName, senderAvatar, senderGender, content } = req.body;
    const bottle = await insertBottle({
      userId: senderId,
      authorName: senderName || "Pengguna",
      authorAvatar: senderAvatar || "",
      authorGender: senderGender || "female",
      content
    });
    res.status(201).json({
      id: String(bottle.id),
      senderId: bottle.userId,
      senderName: bottle.authorName,
      senderAvatar: bottle.authorAvatar,
      senderGender: bottle.authorGender,
      content: bottle.content,
      createdAt: bottle.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/messages", async (req, res) => {
  try {
    const convId = req.query.conversationId;
    if (!convId) {
      return res.status(400).json({ error: "conversationId query param is required." });
    }
    const msgs = await getConversationMessages(convId);
    const formatted = msgs.map((m) => ({
      id: String(m.id),
      chatId: m.conversationId,
      senderId: m.senderId,
      recipientId: m.recipientId,
      text: m.text,
      imageUrl: m.imageUrl,
      status: m.status,
      type: m.imageUrl ? "image" : "text",
      createdAt: m.createdAt
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/messages", async (req, res) => {
  try {
    const { conversationId, senderId, recipientId, text: text2, imageUrl, senderName, senderAvatar } = req.body;
    if (!conversationId || !senderId || !text2 && !imageUrl) {
      return res.status(400).json({ error: "Invalid message data" });
    }
    const msg = await insertMessage({
      conversationId,
      senderId,
      recipientId: recipientId || "",
      text: text2 || (imageUrl ? "\u{1F4F7} [Foto]" : ""),
      imageUrl
    });
    if (conversationTypingMap.has(conversationId)) {
      conversationTypingMap.get(conversationId).delete(senderId);
    }
    try {
      await getOrCreateConversation({
        id: conversationId,
        participants: [senderId, recipientId].filter(Boolean),
        participantDetails: {
          [senderId]: { displayName: senderName || "Pengguna", avatarUrl: senderAvatar || "" }
        },
        lastMessage: text2 || (imageUrl ? "\u{1F4F7} [Foto]" : ""),
        lastSenderId: senderId
      });
    } catch {
    }
    res.status(201).json({
      id: String(msg.id),
      chatId: msg.conversationId,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      text: msg.text,
      imageUrl: msg.imageUrl,
      status: msg.status,
      type: msg.imageUrl ? "image" : "text",
      createdAt: msg.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LovyChat server running on http://0.0.0.0:${PORT} with Supabase & PostgreSQL`);
    syncLocalDataToSupabase().catch((e) => console.warn("Supabase initial sync:", e?.message));
    cleanupExpiredMoments().catch((e) => console.warn("Initial moment cleanup:", e?.message));
    setInterval(() => {
      cleanupExpiredMoments().catch((e) => console.warn("Periodic moment cleanup:", e?.message));
    }, 30 * 60 * 1e3);
  });
}
start();
//# sourceMappingURL=server.cjs.map
