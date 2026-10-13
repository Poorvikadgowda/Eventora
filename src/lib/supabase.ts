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

// Safe fallback URL and Anon Key to prevent runtime initialization crashes when unconfigured
const fallbackUrl = 'https://buznsltebeqmzilreeak.supabase.co';
const fallbackKey = 'sb_publishable_YMiJNAApHXijfMatUvqy0A_XJVV933v';

const supabaseUrl = isValidSupabaseConfig ? envUrl! : fallbackUrl;
const supabaseAnonKey = isValidSupabaseConfig ? envKey! : fallbackKey;

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
