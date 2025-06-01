
import { supabase } from '@/integrations/supabase/client';

export interface BillFollow {
  id: string;
  user_id: string;
  bill_id: string;
  created_at: string;
}

export class BillFollowingService {
  async followBill(billId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('bill_follows')
      .insert({
        user_id: user.id,
        bill_id: billId
      });

    if (error) throw error;
  }

  async unfollowBill(billId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('bill_follows')
      .delete()
      .eq('user_id', user.id)
      .eq('bill_id', billId);

    if (error) throw error;
  }

  async isFollowingBill(billId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('bill_follows')
      .select('id')
      .eq('user_id', user.id)
      .eq('bill_id', billId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  async getFollowedBills(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('bill_follows')
      .select(`
        bill_id,
        bills (
          id,
          title,
          summary,
          status,
          category,
          date,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id);

    if (error) throw error;
    return data?.map(follow => follow.bills) || [];
  }

  async getFollowCount(billId: string): Promise<number> {
    const { count, error } = await supabase
      .from('bill_follows')
      .select('*', { count: 'exact', head: true })
      .eq('bill_id', billId);

    if (error) throw error;
    return count || 0;
  }
}

export const billFollowingService = new BillFollowingService();
