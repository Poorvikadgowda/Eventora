import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const envUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Validate if environment variables are actual configured values and not blank or placeholders
const isValidSupabaseConfig = Boolean(
  envUrl &&
  envKey &&
  envUrl.startsWith('https://') &&
  !envUrl.includes('placeholder') &&
  !envUrl.includes('your-project') &&
  envKey.length > 20
);

// Global Demo Mode Flag
export const DEMO_MODE: boolean = !isValidSupabaseConfig;
export const isDemoMode: boolean = DEMO_MODE;

// Safe dummy placeholders to prevent runtime initialization crashes if env vars are missing
const dummyUrl = 'https://placeholder.supabase.co';
const dummyKey = 'placeholder-anon-key-prevent-crash';

const supabaseUrl = isValidSupabaseConfig ? envUrl! : dummyUrl;
const supabaseAnonKey = isValidSupabaseConfig ? envKey! : dummyKey;

// Create Supabase Client with Auth Persistence in localStorage
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export default supabase;
