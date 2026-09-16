-- =========================================================================
-- LovyChat - Supabase Schema Migration
-- Jalankan query ini di Supabase SQL Editor:
-- Masuk ke https://supabase.com/dashboard/project/guccrttvdzegmqxhrvgp/sql
-- Paste script ini dan klik RUN
-- =========================================================================

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  password_hash TEXT,
  display_name TEXT NOT NULL,
  michat_id TEXT UNIQUE,
  gender TEXT DEFAULT 'female',
  bio TEXT DEFAULT '',
  region TEXT DEFAULT 'Indonesia',
  avatar_url TEXT DEFAULT '',
  blocked_users TEXT DEFAULT '[]',
  is_online BOOLEAN DEFAULT true,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  participants TEXT NOT NULL DEFAULT '[]',
  participant_details TEXT NOT NULL DEFAULT '{}',
  last_message TEXT DEFAULT '',
  last_sender_id TEXT DEFAULT '',
  unread_count TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  text TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Moments
CREATE TABLE IF NOT EXISTS public.moments (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  location TEXT DEFAULT 'Indonesia',
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  likes TEXT DEFAULT '[]',
  comments TEXT DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Drift Bottles
CREATE TABLE IF NOT EXISTS public.bottles (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  author_gender TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing untuk performa pencarian cepat
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_uid ON public.users(uid);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_moments_created ON public.moments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bottles_created ON public.bottles(created_at DESC);

-- Enable Row Level Security (RLS) dengan akses publik/anon untuk aplikasi web
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bottles ENABLE ROW LEVEL SECURITY;

-- Policy Users
DROP POLICY IF EXISTS "Public select users" ON public.users;
CREATE POLICY "Public select users" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert users" ON public.users;
CREATE POLICY "Public insert users" ON public.users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update users" ON public.users;
CREATE POLICY "Public update users" ON public.users FOR UPDATE USING (true);

-- Policy Conversations
DROP POLICY IF EXISTS "Public select conversations" ON public.conversations;
CREATE POLICY "Public select conversations" ON public.conversations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert conversations" ON public.conversations;
CREATE POLICY "Public insert conversations" ON public.conversations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update conversations" ON public.conversations;
CREATE POLICY "Public update conversations" ON public.conversations FOR UPDATE USING (true);

-- Policy Messages
DROP POLICY IF EXISTS "Public select messages" ON public.messages;
CREATE POLICY "Public select messages" ON public.messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert messages" ON public.messages;
CREATE POLICY "Public insert messages" ON public.messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update messages" ON public.messages;
CREATE POLICY "Public update messages" ON public.messages FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete messages" ON public.messages;
CREATE POLICY "Public delete messages" ON public.messages FOR DELETE USING (true);

-- Policy Moments
DROP POLICY IF EXISTS "Public select moments" ON public.moments;
CREATE POLICY "Public select moments" ON public.moments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert moments" ON public.moments;
CREATE POLICY "Public insert moments" ON public.moments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update moments" ON public.moments;
CREATE POLICY "Public update moments" ON public.moments FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete moments" ON public.moments;
CREATE POLICY "Public delete moments" ON public.moments FOR DELETE USING (true);

-- Policy Bottles
DROP POLICY IF EXISTS "Public select bottles" ON public.bottles;
CREATE POLICY "Public select bottles" ON public.bottles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert bottles" ON public.bottles;
CREATE POLICY "Public insert bottles" ON public.bottles FOR INSERT WITH CHECK (true);

-- =========================================================================
-- OPTIONAL AUTOMATION: Cron Job untuk Hapus Momen > 24 Jam Otomatis
-- (Bila pg_cron diaktifkan di Supabase Dashboard -> Extensions):
-- SELECT cron.schedule('cleanup_expired_moments', '0 * * * *',
--   $$DELETE FROM public.moments WHERE created_at < NOW() - INTERVAL '24 HOURS'$$
-- );
-- =========================================================================
