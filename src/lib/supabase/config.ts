import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
function validateConfig() {
  const missing = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  
  if (missing.length > 0) {
    console.error('Missing Supabase environment variables:', missing);
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
  }

  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error('Invalid Supabase URL format');
  }
}

validateConfig();

export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage,
      storageKey: 'supabase.auth.token',
      flowType: 'pkce'
    },
    realtime: {
      enabled: true,
      presence: {
        key: 'userStatus'
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'protaxadvisors-web'
      }
    }
  }
};

export const supabase = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  supabaseConfig.options
);

// Add error handling for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    // Clear any cached data
    localStorage.removeItem('supabase.auth.token');
    // Clear any application state
    window.location.href = '/login';
  }
});