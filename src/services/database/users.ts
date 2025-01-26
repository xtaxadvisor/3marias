import { DatabaseService } from './index';
import type { Database } from '../../lib/supabase/types';

type User = Database['public']['Tables']['users']['Row'];

class UserService extends DatabaseService<'users'> {
  constructor() {
    super('users');
  }

  async getByAuthId(authId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('auth_id', authId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, profile: Partial<User>) {
    return this.update(userId, {
      ...profile,
      updated_at: new Date().toISOString()
    });
  }
}

export const userService = new UserService();