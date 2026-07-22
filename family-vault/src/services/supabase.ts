import { createClient, SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from '@react-native-async-storage/async-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Smart Docs] Supabase env vars missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase: SupabaseClient = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: AsyncStorage,
    },
    global: {
      // Increase default timeout for slow networks
      fetch: (url, options) => {
        return fetch(url, { ...options, signal: options?.signal || AbortSignal.timeout(60000) });
      },
    },
  }
);

export type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
};

export type FamilyMember = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type DocStatus = "expired" | "soon" | "safe";

export type DocumentRow = {
  id: string;
  user_id: string;
  family_member_id: string | null;
  name: string;
  category: string;
  expiry_date: string | null;
  upload_date: string;
  priority: boolean;
  status: DocStatus;
  file_url: string | null;
  source: string | null;
  created_at: string;
  tags?: string[] | null;
};
