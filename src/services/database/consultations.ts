import { DatabaseService } from './index';
import type { Database } from '../../lib/supabase/types';

type Consultation = Database['public']['Tables']['consultations']['Row'];

class ConsultationService extends DatabaseService<'consultations'> {
  constructor() {
    super('consultations');
  }

  async getUpcoming(userId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select(`
        *,
        clients (
          id,
          user_id,
          status
        ),
        professionals (
          id,
          user_id,
          title
        )
      `)
      .or(`clients.user_id.eq.${userId},professionals.user_id.eq.${userId}`)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  }

  async updateStatus(consultationId: string, status: Consultation['status']) {
    return this.update(consultationId, {
      status,
      updated_at: new Date().toISOString()
    });
  }
}

export const consultationService = new ConsultationService();