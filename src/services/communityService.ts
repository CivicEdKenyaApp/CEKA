
import { supabase } from '@/integrations/supabase/client';

export interface CommunityProfile {
  id?: string;
  full_name: string;
  email?: string;
  interests?: string[];
  location?: string;
  bio?: string;
  is_anonymous: boolean;
  created_via: string;
}

export class CommunityService {
  async createCommunityProfile(profileData: Omit<CommunityProfile, 'id' | 'is_anonymous' | 'created_via'>): Promise<string> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        ...profileData,
        is_anonymous: true,
        created_via: 'join-community',
        id: crypto.randomUUID() // Generate a temporary ID for anonymous profiles
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async linkProfileToUser(profileId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        id: userId,
        is_anonymous: false,
        created_via: 'auth',
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId);

    if (error) throw error;
  }

  async findAnonymousProfileByEmail(email: string): Promise<CommunityProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('is_anonymous', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}

export const communityService = new CommunityService();
