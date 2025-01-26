import { supabase } from '../../lib/supabase/client';
import { useNotificationStore } from '../../lib/store';

class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  private constructor() {}

  public static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager();
    }
    return DatabaseConnectionManager.instance;
  }

  async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        if (this.retryCount < this.MAX_RETRIES) {
          this.retryCount++;
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * this.retryCount));
          return this.executeQuery(queryFn);
        }
        throw error;
      }

      this.retryCount = 0;
      return data as T;
    } catch (error) {
      console.error('Database query error:', error);
      useNotificationStore.getState().addNotification(
        'Failed to fetch data. Please try again.',
        'error'
      );
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase.from('users').select('count').single();
      return !error;
    } catch {
      return false;
    }
  }
}

export const dbConnectionManager = DatabaseConnectionManager.getInstance();