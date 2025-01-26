import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useNotificationStore } from '../lib/store';

export function useAuthStatus() {
  const [status, setStatus] = useState({
    isAuthenticated: false,
    isLoading: true,
    lastChecked: null as Date | null
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setStatus({
          isAuthenticated: !!session,
          isLoading: false,
          lastChecked: new Date()
        });
      } catch (error) {
        console.error('Auth status check failed:', error);
        useNotificationStore.getState().addNotification(
          'Failed to verify authentication status',
          'error'
        );
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          lastChecked: new Date()
        }));
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setStatus({
          isAuthenticated: !!session,
          isLoading: false,
          lastChecked: new Date()
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return status;
}