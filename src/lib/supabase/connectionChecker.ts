import { supabase } from './client';
import { useNotificationStore } from '../store';

export async function checkSupabaseConnection() {
  try {
    // Test with a simple query that doesn't require special functions
    const { data, error } = await supabase
      .from('public_data')
      .select('count')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export async function validateSupabaseConfig() {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.error('Missing Supabase environment variables:', missingVars);
    return false;
  }

  // Validate URL format
  try {
    new URL(import.meta.env.VITE_SUPABASE_URL);
  } catch {
    console.error('Invalid Supabase URL format');
    return false;
  }

  return true;
}

export async function testRLSPolicies() {
  try {
    // Test authenticated access to users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine
      console.error('RLS test failed:', userError);
      return false;
    }

    // Test public data access
    const { error: publicError } = await supabase
      .from('public_data')
      .select('count')
      .limit(1)
      .single();

    if (publicError && publicError.code !== 'PGRST116') {
      console.error('Public data access test failed:', publicError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('RLS test failed:', error);
    return false;
  }
}