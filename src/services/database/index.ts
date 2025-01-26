import { supabase } from '../../lib/supabase/client';
import type { Database } from '../../lib/supabase/types';

type Tables = Database['public']['Tables'];

export class DatabaseService<T extends keyof Tables> {
  constructor(protected table: T) {}

  async getAll() {
    const { data, error } = await supabase
      .from(this.table)
      .select('*');

    if (error) throw error;
    return data;
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(data: Tables[T]['Insert']) {
    const { data: created, error } = await supabase
      .from(this.table)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return created;
  }

  async update(id: string, data: Tables[T]['Update']) {
    const { data: updated, error } = await supabase
      .from(this.table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  async delete(id: string) {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}