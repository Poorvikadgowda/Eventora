import { supabase as clientInstance, isDemoMode } from '../lib/supabase';

export const isSupabaseConfigured = !isDemoMode;

export const supabase = clientInstance;

export const getSupabaseStatus = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || 'https://buznsltebeqmzilreeak.supabase.co';
  return {
    configured: isSupabaseConfigured,
    mode: isSupabaseConfigured ? 'Supabase Live' : 'Demo Local Mode',
    url: url.replace(/^(https?:\/\/[^/]+).*/, '$1'),
  };
};

export default supabase;
