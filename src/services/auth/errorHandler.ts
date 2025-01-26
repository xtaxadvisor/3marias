import type { AuthError } from '@supabase/supabase-js';
import { useNotificationStore } from '../../lib/store';

export function handleAuthError(error: AuthError): string {
  // Map specific error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
    'invalid_grant': 'Invalid email or password. Please check your credentials and try again.',
    'user_not_found': 'No account found with this email address.',
    'email_taken': 'An account with this email already exists.',
    'weak_password': 'Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.',
    'expired_token': 'Your session has expired. Please sign in again.',
    'invalid_token': 'Invalid authentication token. Please sign in again.',
    'rate_limit_exceeded': 'Too many attempts. Please try again in a few minutes.'
  };

  const message = errorMessages[error.message] || error.message || 'An unexpected error occurred';
  useNotificationStore.getState().addNotification(message, 'error');
  return message;
}

export function isAuthError(error: any): error is AuthError {
  return error && typeof error === 'object' && '__isAuthError' in error;
}