
import { supabase } from '@/integrations/supabase/client';

export interface Bill {
  id: string;
  title: string;
  summary: string;
  status: string;
  category: string;
  sponsor: string;
  date: string;
  stages?: any;
  description?: string;
  constitutional_section?: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

class BillService {
  async getFeaturedBills(limit: number = 3): Promise<Bill[]> {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching featured bills:', error);
      return [];
    }
  }

  async getBillById(id: string): Promise<Bill | null> {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching bill by id:', error);
      return null;
    }
  }

  async getAllBills(): Promise<Bill[]> {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all bills:', error);
      return [];
    }
  }

  async searchBills(query: string): Promise<Bill[]> {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%,sponsor.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching bills:', error);
      return [];
    }
  }
}

export const billService = new BillService();
