import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.SUPABASE_URL || 'https://guccrttvdzegmqxhrvgp.supabase.co/rest/v1/';
export const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
export const SUPABASE_ANON_KEY = 
  process.env.SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Y2NydHR2ZHplZ21xeGhydmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTQyODMsImV4cCI6MjEwNDk5MDI4M30.lIB_zUGhd4pXbCbjOMw1tuTQrg-T41Dr5DnH-_zXr7M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

let isSupabaseTested = false;
let isSupabaseAvailable = false;

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  url: string;
  projectRef: string;
  tablesReady: boolean;
  message: string;
}> {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (!error) {
      isSupabaseTested = true;
      isSupabaseAvailable = true;
      return {
        connected: true,
        url: SUPABASE_URL,
        projectRef: 'guccrttvdzegmqxhrvgp',
        tablesReady: true,
        message: 'Terkoneksi ke Supabase dan tabel siap digunakan.',
      };
    }

    if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
      isSupabaseTested = true;
      isSupabaseAvailable = false;
      return {
        connected: true,
        url: SUPABASE_URL,
        projectRef: 'guccrttvdzegmqxhrvgp',
        tablesReady: false,
        message: 'Koneksi ke Supabase berhasil! Namun tabel database belum dibuat di Supabase SQL Editor.',
      };
    }

    return {
      connected: false,
      url: SUPABASE_URL,
      projectRef: 'guccrttvdzegmqxhrvgp',
      tablesReady: false,
      message: error.message || 'Gagal menghubungi Supabase.',
    };
  } catch (err: any) {
    return {
      connected: false,
      url: SUPABASE_URL,
      projectRef: 'guccrttvdzegmqxhrvgp',
      tablesReady: false,
      message: err?.message || 'Error koneksi Supabase',
    };
  }
}
