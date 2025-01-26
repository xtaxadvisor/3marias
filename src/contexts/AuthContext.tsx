import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/config';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useNotificationStore } from '../lib/store';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: {
    name: string;
    role: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password');
        }
        throw error;
      }

      addNotification('Successfully logged in', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      addNotification(error instanceof Error ? error.message : 'Failed to log in', 'error');
      throw error;
    }
  };

  const register = async (email: string, password: string, userData: {
    name: string;
    role: string;
  }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            name: userData.name.trim(),
            role: userData.role
          }
        }
      });

      if (error) throw error;

      addNotification('Successfully registered. Please check your email.', 'success');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      addNotification(
        error instanceof Error ? error.message : 'Failed to register',
        'error'
      );
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      addNotification('Successfully logged out', 'success');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      addNotification(
        error instanceof Error ? error.message : 'Failed to log out',
        'error'
      );
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}