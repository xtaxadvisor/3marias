import { useState, useEffect } from 'react';
import { checkSupabaseConnection, validateSupabaseConfig } from '../connectionChecker';

export function useSupabaseStatus() {
  const [status, setStatus] = useState<{
    isConnected: boolean;
    isConfigValid: boolean;
    lastChecked: Date | null;
  }>({
    isConnected: false,
    isConfigValid: false,
    lastChecked: null
  });

  useEffect(() => {
    async function checkStatus() {
      const isConfigValid = await validateSupabaseConfig();
      const isConnected = isConfigValid && await checkSupabaseConnection();

      setStatus({
        isConnected,
        isConfigValid,
        lastChecked: new Date()
      });
    }

    checkStatus();
    
    // Recheck connection every 5 minutes
    const interval = setInterval(checkStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return status;
}