import { useSupabase } from '../contexts/SupabaseContext';

export function useAuth() {
  const { user, loading, signIn, signUp, signOut } = useSupabase();

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login: signIn,
    register: signUp,
    logout: signOut
  };
}