import { DatabaseService } from './index';
import type { Database } from '../../lib/supabase/types';

type Client = Database['public']['Tables']['clients']['Row'];

class ClientService extends DatabaseService<'clients'> {
  constructor() {
    super('clients');
  }

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateStatus(clientId: string, status: Client['status']) {
    return this.update(clientId, {
      status,
      updated_at: new Date().toISOString()
    });
  }
}

export const clientService = new ClientService();