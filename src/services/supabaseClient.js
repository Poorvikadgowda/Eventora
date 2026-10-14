import { supabase as clientInstance, isDemoMode } from '../lib/supabase';

export const isSupabaseConfigured = !isDemoMode;

export const supabase = clientInstance;

export const getSupabaseStatus = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  return {
    configured: isSupabaseConfigured,
    mode: isSupabaseConfigured ? 'Supabase Live' : 'Demo Local Mode',
    url: url ? url.replace(/^(https?:\/\/[^/]+).*/, '$1') : 'Unconfigured',
  };
};

export default supabase;
