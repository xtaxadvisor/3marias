import { supabase } from '../../lib/supabase/config';
import { useNotificationStore } from '../../lib/store';
import { validatePassword } from './validation';
import type { AuthError } from '@supabase/supabase-js';

export class AuthService {
  private static readonly MAX_RETRIES = 3;
  private static retryCount = 0;

  static async signIn(email: string, password: string) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (error) {
        this.handleAuthError(error);
        return null;
      }

      this.retryCount = 0;
      return data;
    } catch (error) {
      this.handleAuthError(error as AuthError);
      return null;
    }
  }

  private static handleAuthError(error: AuthError) {
    const errorMessages: Record<string, string> = {
      'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
      'invalid_grant': 'Invalid email or password. Please check your credentials and try again.',
      'user_not_found': 'No account found with this email address.',
      'email_taken': 'An account with this email already exists.',
      'weak_password': 'Password must be at least 12 characters long and include uppercase, lowercase, numbers, and special characters.',
      'rate_limit_exceeded': 'Too many attempts. Please try again in a few minutes.',
      'expired_token': 'Your session has expired. Please sign in again.',
      'invalid_token': 'Invalid authentication token. Please sign in again.'
    };

    const message = errorMessages[error.message] || error.message || 'An unexpected error occurred';
    
    useNotificationStore.getState().addNotification(message, 'error');

    // Handle rate limiting with exponential backoff
    if (error.message === 'rate_limit_exceeded' && this.retryCount < this.MAX_RETRIES) {
      this.retryCount++;
      const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 10000);
      setTimeout(() => this.retryCount = 0, delay);
    }

    throw error;
  }
}