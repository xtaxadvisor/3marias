import { useState, useEffect } from 'react';
import { protaxChannel, supabase } from '../lib/supabase/client';
import { realtimeService } from '../services/realtime/realtimeService';
import { useNotificationStore } from '../lib/store';

export function useRealtime() {
  const [presence, setPresence] = useState<any>({});
  const [isConnected, setIsConnected] = useState(false);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    let mounted = true;

    const setupRealtime = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const subscription = protaxChannel
          .on('presence', { event: 'sync' }, () => {
            if (mounted) {
              setPresence(protaxChannel.presenceState());
              setIsConnected(true);
            }
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED' && user) {
              await protaxChannel.track({
                online_at: new Date().toISOString(),
                user_id: user.id
              });
            }
          });

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Realtime setup error:', error);
        addNotification('Failed to connect to realtime service', 'error');
      }
    };

    setupRealtime();
  }, [addNotification]);

  const sendMessage = async (message: string, data: any = {}) => {
    try {
      await realtimeService.sendMessage(message, data);
    } catch (error) {
      console.error('Failed to send message:', error);
      addNotification('Failed to send message', 'error');
    }
  };

  const updatePresence = async (data: any) => {
    try {
      await realtimeService.updatePresence(data);
    } catch (error) {
      console.error('Failed to update presence:', error);
      addNotification('Failed to update presence', 'error');
    }
  };

  return {
    presence,
    isConnected,
    sendMessage,
    updatePresence
  };
}