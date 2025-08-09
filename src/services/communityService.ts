
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
        full_name: profileData.full_name,
        email: profileData.email,
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
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId);

    if (error) throw error;
  }

  async findAnonymousProfileByEmail(email: string): Promise<CommunityProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (!data) return null;
    
    // Transform the database result to match our interface with default values
    return {
      id: data.id,
      full_name: data.full_name || '',
      email: data.email || undefined,
      interests: undefined, // Not stored in profiles table
      location: undefined, // Not stored in profiles table
      bio: undefined, // Not stored in profiles table
      is_anonymous: true, // Default for community profiles
      created_via: 'join-community' // Default value
    };
  }
}

export const communityService = new CommunityService();
