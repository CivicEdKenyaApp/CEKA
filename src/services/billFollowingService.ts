
import { supabase } from '@/integrations/supabase/client';

export interface BillFollow {
  id: string;
  user_id: string;
  bill_id: string;
  created_at: string;
}

export class BillFollowingService {
  async followBill(billId: string, signal?: AbortSignal): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (signal?.aborted) throw new Error('Aborted');
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('bill_follows')
      .insert({
        user_id: user.id,
        bill_id: billId
      })
      .abortSignal(signal as any);

    if (error && !signal?.aborted) throw error;
  }

  async unfollowBill(billId: string, signal?: AbortSignal): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (signal?.aborted) throw new Error('Aborted');
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('bill_follows')
      .delete()
      .eq('user_id', user.id)
      .eq('bill_id', billId)
      .abortSignal(signal as any);

    if (error && !signal?.aborted) throw error;
  }

  async isFollowingBill(billId: string, signal?: AbortSignal): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (signal?.aborted) return false;
    if (!user) return false;

    const { data, error } = await supabase
      .from('bill_follows')
      .select('id')
      .eq('user_id', user.id)
      .eq('bill_id', billId)
      .maybeSingle()
      .abortSignal(signal as any);

    if (error && !signal?.aborted) throw error;
    return !!data;
  }

  async getFollowedBills(signal?: AbortSignal): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (signal?.aborted) return [];
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
      .eq('user_id', user.id)
      .abortSignal(signal as any);

    if (error && !signal?.aborted) throw error;
    return data?.map(follow => follow.bills) || [];
  }

  async getFollowCount(billId: string, signal?: AbortSignal): Promise<number> {
    const { count, error } = await supabase
      .from('bill_follows')
      .select('*', { count: 'exact', head: true })
      .eq('bill_id', billId)
      .abortSignal(signal as any);

    if (error && !signal?.aborted) throw error;
    return count || 0;
  }
}

export const billFollowingService = new BillFollowingService();
