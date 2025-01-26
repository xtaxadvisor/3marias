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
    return false;
  }

  try {
    new URL(supabaseUrl);
    return true;
  } catch {
    console.error('Invalid Supabase URL format');
    return false;
  }
}

if (!validateConfig()) {
  console.error('Supabase configuration is invalid. Using fallback configuration for development.');
}

export const supabase = createClient<Database>(
  supabaseUrl!, 
  supabaseAnonKey!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Set up realtime channel
export const protaxChannel = supabase.channel('protax_channel')
  .on('presence', { event: 'sync' }, () => {
    console.log('Presence state synchronized');
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('New users joined:', newPresences);
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('Users left:', leftPresences);
  })
  .on('broadcast', { event: 'message' }, (payload) => {
    console.log('Received broadcast:', payload);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const presenceTrackStatus = await protaxChannel.track({
          online_at: new Date().toISOString(),
          user_id: user.id
        });
        console.log('Presence track status:', presenceTrackStatus);
      }
    }
  });

// Add error handling for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    localStorage.removeItem('supabase.auth.token');
  }
});