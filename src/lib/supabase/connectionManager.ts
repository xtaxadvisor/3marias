import { supabase } from './client';
import { useNotificationStore } from '../store';

class SupabaseConnectionManager {
  private static instance: SupabaseConnectionManager;
  private isConnected: boolean = false;
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  private constructor() {
    this.setupConnectionMonitoring();
  }

  public static getInstance(): SupabaseConnectionManager {
    if (!SupabaseConnectionManager.instance) {
      SupabaseConnectionManager.instance = new SupabaseConnectionManager();
    }
    return SupabaseConnectionManager.instance;
  }

  private setupConnectionMonitoring() {
    setInterval(async () => {
      await this.checkConnection();
    }, 30000); // Check every 30 seconds
  }

  async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
        .single();

      this.isConnected = !error;
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Supabase connection error:', error);
      this.isConnected = false;
      
      useNotificationStore.getState().addNotification(
        'Database connection error. Retrying...',
        'error'
      );

      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        setTimeout(() => this.checkConnection(), this.RETRY_DELAY * this.retryCount);
      }

      return false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  resetRetryCount(): void {
    this.retryCount = 0;
  }
}

export const supabaseConnectionManager = SupabaseConnectionManager.getInstance();