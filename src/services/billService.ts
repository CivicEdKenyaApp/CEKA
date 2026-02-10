
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
  updated_at?: string;
  neural_summary?: string | null;
  text_content?: string | null;
  pdf_url?: string | null;
  views_count?: number;
  follow_count?: number;
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
      return (data || []) as unknown as Bill[];
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
      return data as unknown as Bill;
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
      return (data || []) as unknown as Bill[];
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
      return (data || []) as unknown as Bill[];
    } catch (error) {
      console.error('Error searching bills:', error);
      return [];
    }
  }

  async getBillStats(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('status, category');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        byStatus: {} as Record<string, number>,
        byCategory: {} as Record<string, number>
      };

      data?.forEach(bill => {
        const status = bill.status || 'Unknown';
        const category = bill.category || 'Uncategorized';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching bill stats:', error);
      return { total: 0, byStatus: {}, byCategory: {} };
    }
  }
}

export const billService = new BillService();
