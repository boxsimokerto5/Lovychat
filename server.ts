import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { 
  getUserByEmailOrId, 
  getUserByUid, 
  createOrUpdateUser, 
  blockOrUnblockUser,
  getAllUsers, 
  getConversationMessages, 
  insertMessage, 
  getAllMoments, 
  insertMoment, 
  deleteMomentById,
  toggleMomentLike,
  addMomentComment,
  getAllBottles, 
  insertBottle,
  getUserConversations,
  getOrCreateConversation,
  markConversationRead,
  clearUserMessagesOnLogout,
  cleanupExpiredMoments
} from "./src/db/queries.ts";
import { hashPassword } from "./src/utils/security.ts";
import { generateMichatId, getRandomAvatar } from "./src/utils/avatars.ts";
import { checkSupabaseConnection, SUPABASE_URL } from "./src/db/supabaseClient.ts";
import { syncLocalDataToSupabase } from "./src/db/syncToSupabase.ts";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes

// Supabase Connection Status
app.get("/api/supabase/status", async (_req, res) => {
  try {
    const status = await checkSupabaseConnection();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// Trigger sync to Supabase
app.post("/api/supabase/sync", async (_req, res) => {
  try {
    const result = await syncLocalDataToSupabase();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Supabase SQL Schema Helper
app.get("/api/supabase/schema", (_req, res) => {
  try {
    const schemaPath = path.join(process.cwd(), "supabase_schema.sql");
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf-8");
      res.type("text/plain").send(sql);
    } else {
      res.status(404).send("-- File supabase_schema.sql tidak ditemukan");
    }
  } catch (err: any) {
    res.status(500).send(`-- Error: ${err.message}`);
  }
});

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ status: "ok", service: "active", userCount: users.length });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Register with Email
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
    const uid = 'usr_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    const michatId = generateMichatId();
    const avatarUrl = getRandomAvatar(gender || 'female');

    const newUser = await createOrUpdateUser({
      uid,
      email: cleanEmail,
      passwordHash: pHash,
      displayName: displayName || cleanEmail.split('@')[0],
      michatId,
      gender: gender || 'female',
      avatarUrl,
      bio: 'Halo! Saya menggunakan LovyChat.',
      region: 'Indonesia',
      isOnline: true,
    });

    // Don't return password hash to client
    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({ user: safeUser });
  } catch (error: any) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: error.message || "Gagal mendaftarkan akun." });
  }
});

// Login with Email / ID
app.post("/api/auth/login", async (req, res) => {
  try {
    const { emailOrId, password } = req.body;
    if (!emailOrId || !password) {
      return res.status(400).json({ error: "Email/ID dan kata sandi wajib diisi." });
    }

    const found = await getUserByEmailOrId(emailOrId);
    if (!found) {
      // Smart Auto-Registration: If input is an email address and password has >= 6 characters,
      // seamlessly register and log the user in immediately!
      if (emailOrId.includes('@') && password && password.length >= 6) {
        const cleanEmail = emailOrId.trim().toLowerCase();
        const pHash = await hashPassword(password);
        const uid = 'usr_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        const michatId = generateMichatId();
        const derivedName = cleanEmail.split('@')[0]
          .replace(/[._-]+/g, ' ')
          .split(' ')
          .filter(Boolean)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ') || 'Pengguna LovyChat';
        const avatarUrl = getRandomAvatar('female');

        const newUser = await createOrUpdateUser({
          uid,
          email: cleanEmail,
          passwordHash: pHash,
          displayName: derivedName,
          michatId,
          gender: 'female',
          avatarUrl,
          bio: 'Halo! Saya menggunakan LovyChat.',
          region: 'Indonesia',
          isOnline: true,
        });

        const { passwordHash: _, ...safeUser } = newUser;
        return res.status(200).json({ 
          user: safeUser, 
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
      // If user had no password hash yet, set it now
      const newHash = await hashPassword(password);
      await createOrUpdateUser({
        uid: found.uid,
        email: found.email,
        passwordHash: newHash,
        displayName: found.displayName,
      });
    }

    const { passwordHash: _, ...safeUser } = found;
    return res.json({ user: safeUser });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message || "Gagal masuk akun." });
  }
});

// Google Sign-In Sync / Registration
app.post("/api/auth/google", async (req, res) => {
  try {
    const { uid, email, displayName, photoUrl } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email akun Google wajib disertakan." });
    }

    const cleanEmail = email.trim().toLowerCase();
    // Check if user already exists by email or uid
    let existing = await getUserByEmailOrId(cleanEmail);
    if (!existing && uid) {
      existing = await getUserByUid(uid);
    }

    if (existing) {
      const updated = await createOrUpdateUser({
        uid: existing.uid,
        email: cleanEmail,
        displayName: existing.displayName || displayName || cleanEmail.split('@')[0],
        avatarUrl: existing.avatarUrl || photoUrl || getRandomAvatar('female'),
        isOnline: true,
      });
      const { passwordHash: _, ...safeUser } = updated;
      return res.json({ user: safeUser, isNewAccount: false });
    }

    // New user via Google Sign-In
    const targetUid = uid || ('usr_g_' + Math.random().toString(36).substring(2, 10));
    const michatId = generateMichatId();
    const derivedName = displayName || cleanEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    const newUser = await createOrUpdateUser({
      uid: targetUid,
      email: cleanEmail,
      displayName: derivedName || 'Pengguna Google',
      michatId,
      gender: 'female',
      avatarUrl: photoUrl || getRandomAvatar('female'),
      bio: 'Halo! Saya bergabung di LovyChat via Akun Google.',
      region: 'Indonesia',
      isOnline: true,
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(200).json({ user: safeUser, isNewAccount: true });
  } catch (error: any) {
    console.error("Google auth endpoint error:", error);
    return res.status(500).json({ error: error.message || "Gagal memproses login Google." });
  }
});

// Sync / Update Profile
app.post("/api/auth/sync", async (req, res) => {
  try {
    const profile = req.body;
    if (!profile || !profile.uid) {
      return res.status(400).json({ error: "UID pengguna wajib disertakan." });
    }

    const updated = await createOrUpdateUser(profile);
    const { passwordHash: _, ...safeUser } = updated;
    return res.json({ user: safeUser });
  } catch (error: any) {
    console.error("Profile sync error:", error);
    return res.status(500).json({ error: error.message || "Gagal sinkronisasi profil." });
  }
});

// Ephemeral Messages Cleanup on Logout
app.post("/api/auth/logout", async (req, res) => {
  try {
    const { uid } = req.body;
    if (uid) {
      // Set offline and remove messages involving this user to drastically reduce database load
      await createOrUpdateUser({ uid, isOnline: false });
      await clearUserMessagesOnLogout(uid);
    }
    return res.json({ success: true, message: "Pesan berhasil dibersihkan saat logout." });
  } catch (error: any) {
    console.error("Logout cleanup error:", error);
    return res.status(500).json({ error: error.message || "Gagal memproses pembersihan saat logout." });
  }
});

// Block or Unblock user
app.post("/api/auth/block", async (req, res) => {
  try {
    const { userUid, targetUid, action } = req.body;
    if (!userUid || !targetUid) {
      return res.status(400).json({ error: "userUid and targetUid are required." });
    }
    const result = await blockOrUnblockUser(userUid, targetUid, action === 'unblock' ? 'unblock' : 'block');
    const { passwordHash: _, ...safeUser } = result.user;
    return res.json({ success: true, blockedUsers: result.blockedUsers, user: safeUser });
  } catch (error: any) {
    console.error("Block action error:", error);
    return res.status(500).json({ error: error.message || "Gagal mengubah status blokir." });
  }
});

// Users List
app.get("/api/users", async (_req, res) => {
  try {
    const all = await getAllUsers();
    const safeUsers = all.map(({ passwordHash: _, ...rest }) => rest);
    res.json(safeUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// User by UID
app.get("/api/users/:uid", async (req, res) => {
  try {
    const user = await getUserByUid(req.params.uid);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Chats / Conversations
app.get("/api/chats", async (req, res) => {
  try {
    const userUid = req.query.userUid as string;
    if (!userUid) {
      return res.status(400).json({ error: "userUid query param is required." });
    }
    const list = await getUserConversations(userUid);
    const formatted = list.map((c) => {
      let participants: string[] = [];
      let participantDetails: any = {};
      let unreadCount: any = {};
      try { participants = JSON.parse(c.participants || '[]'); } catch {}
      try { participantDetails = JSON.parse(c.participantDetails || '{}'); } catch {}
      try { unreadCount = JSON.parse(c.unreadCount || '{}'); } catch {}
      return {
        id: c.id,
        participants,
        participantDetails,
        lastMessage: c.lastMessage,
        lastSenderId: c.lastSenderId,
        unreadCount,
        createdAt: c.createdAt,
        lastUpdated: c.updatedAt,
      };
    });
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
      lastSenderId,
    });
    let parts: string[] = [];
    let pDetails: any = {};
    let unread: any = {};
    try { parts = JSON.parse(conv.participants || '[]'); } catch {}
    try { pDetails = JSON.parse(conv.participantDetails || '{}'); } catch {}
    try { unread = JSON.parse(conv.unreadCount || '{}'); } catch {}
    res.json({
      id: conv.id,
      participants: parts,
      participantDetails: pDetails,
      lastMessage: conv.lastMessage,
      lastSenderId: conv.lastSenderId,
      unreadCount: unread,
      createdAt: conv.createdAt,
      lastUpdated: conv.updatedAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chats/:id/read", async (req, res) => {
  try {
    const { userUid } = req.body;
    if (!userUid) return res.status(400).json({ error: "userUid is required" });
    const updated = await markConversationRead(req.params.id, userUid);
    res.json({ success: true, conversation: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Real-time Chat Typing Tracking
const conversationTypingMap = new Map<string, Map<string, number>>();

app.get("/api/chats/:id/typing", (req, res) => {
  try {
    const chatId = req.params.id;
    const excludeUid = (req.query.excludeUid as string) || '';
    const now = Date.now();
    const convMap = conversationTypingMap.get(chatId);

    if (!convMap) {
      return res.json({ isTyping: false, typingUserIds: [] });
    }

    // Cleanup expired typing (> 3500ms)
    for (const [uid, timestamp] of convMap.entries()) {
      if (now - timestamp > 3500) {
        convMap.delete(uid);
      }
    }

    const typingUserIds: string[] = [];
    for (const [uid] of convMap.entries()) {
      if (!excludeUid || uid !== excludeUid) {
        typingUserIds.push(uid);
      }
    }

    return res.json({
      isTyping: typingUserIds.length > 0,
      typingUserIds,
    });
  } catch (error: any) {
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
      conversationTypingMap.set(chatId, new Map());
    }

    const convMap = conversationTypingMap.get(chatId)!;
    if (isTyping) {
      convMap.set(userUid, Date.now());
    } else {
      convMap.delete(userUid);
    }

    return res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Moments
app.get("/api/moments", async (_req, res) => {
  try {
    const moments = await getAllMoments();
    const formatted = moments.map((m) => {
      let likes: string[] = [];
      let comments: any[] = [];
      try { likes = JSON.parse(m.likes || '[]'); } catch {}
      try { comments = JSON.parse(m.comments || '[]'); } catch {}
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
        createdAt: m.createdAt,
      };
    });
    res.json(formatted);
  } catch (error: any) {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/moments/:id", async (req, res) => {
  try {
    const momentId = parseInt(req.params.id, 10);
    const userUid = req.query.userUid as string;
    await deleteMomentById(momentId, userUid);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/moments/:id/like", async (req, res) => {
  try {
    const momentId = parseInt(req.params.id, 10);
    const { userUid } = req.body;
    if (!userUid) return res.status(400).json({ error: "userUid is required" });
    const updated = await toggleMomentLike(momentId, userUid);
    let likes: string[] = [];
    try { likes = JSON.parse(updated.likes || '[]'); } catch {}
    res.json({ success: true, likes, likesCount: updated.likesCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/moments/:id/comment", async (req, res) => {
  try {
    const momentId = parseInt(req.params.id, 10);
    const { userId, userName, userAvatar, text } = req.body;
    if (!userId || !text) return res.status(400).json({ error: "userId and text are required" });
    const result = await addMomentComment(momentId, {
      userId,
      userName: userName || 'Pengguna',
      userAvatar: userAvatar || '',
      text,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Drift Bottles
app.get("/api/bottles", async (_req, res) => {
  try {
    const bottles = await getAllBottles();
    const formatted = bottles.map((b) => ({
      id: String(b.id),
      senderId: b.userId,
      senderName: b.authorName,
      senderAvatar: b.authorAvatar,
      senderGender: b.authorGender,
      content: b.content,
      createdAt: b.createdAt,
    }));
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/bottles", async (req, res) => {
  try {
    const { senderId, senderName, senderAvatar, senderGender, content } = req.body;
    const bottle = await insertBottle({
      userId: senderId,
      authorName: senderName || 'Pengguna',
      authorAvatar: senderAvatar || '',
      authorGender: senderGender || 'female',
      content,
    });
    res.status(201).json({
      id: String(bottle.id),
      senderId: bottle.userId,
      senderName: bottle.authorName,
      senderAvatar: bottle.authorAvatar,
      senderGender: bottle.authorGender,
      content: bottle.content,
      createdAt: bottle.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Messages
app.get("/api/messages", async (req, res) => {
  try {
    const convId = req.query.conversationId as string;
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
      type: m.imageUrl ? 'image' : 'text',
      createdAt: m.createdAt,
    }));
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const { conversationId, senderId, recipientId, text, imageUrl, senderName, senderAvatar } = req.body;
    if (!conversationId || !senderId || (!text && !imageUrl)) {
      return res.status(400).json({ error: "Invalid message data" });
    }
    const msg = await insertMessage({
      conversationId,
      senderId,
      recipientId: recipientId || '',
      text: text || (imageUrl ? '📷 [Foto]' : ''),
      imageUrl,
    });

    // Clear typing status on message sent
    if (conversationTypingMap.has(conversationId)) {
      conversationTypingMap.get(conversationId)!.delete(senderId);
    }

    // Also update parent conversation
    try {
      await getOrCreateConversation({
        id: conversationId,
        participants: [senderId, recipientId].filter(Boolean),
        participantDetails: {
          [senderId]: { displayName: senderName || 'Pengguna', avatarUrl: senderAvatar || '' }
        },
        lastMessage: text || (imageUrl ? '📷 [Foto]' : ''),
        lastSenderId: senderId,
      });
    } catch {}

    res.status(201).json({
      id: String(msg.id),
      chatId: msg.conversationId,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      text: msg.text,
      imageUrl: msg.imageUrl,
      status: msg.status,
      type: msg.imageUrl ? 'image' : 'text',
      createdAt: msg.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite Middleware for Dev and Static Serving for Prod
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LovyChat server running on http://0.0.0.0:${PORT} with Supabase & PostgreSQL`);
    syncLocalDataToSupabase().catch((e) => console.warn("Supabase initial sync:", e?.message));
    
    // Auto cleanup expired moments (> 24 hours) on startup and periodically every 30 minutes
    cleanupExpiredMoments().catch((e) => console.warn("Initial moment cleanup:", e?.message));
    setInterval(() => {
      cleanupExpiredMoments().catch((e) => console.warn("Periodic moment cleanup:", e?.message));
    }, 30 * 60 * 1000);
  });
}

start();
