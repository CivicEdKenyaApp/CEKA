
import { supabase } from '@/integrations/supabase/client';

export interface CommunityProfile {
  id: string;
  full_name: string;
  email?: string;
  location?: string;
  bio?: string;
  interests?: string[];
  is_anonymous: boolean;
  created_via: string;
}

export interface CreateCommunityProfileData {
  full_name: string;
  email?: string;
  location?: string;
  bio?: string;
  interests?: string[];
}

class CommunityService {
  async createCommunityProfile(profileData: CreateCommunityProfileData): Promise<string> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        full_name: profileData.full_name,
        email: profileData.email || null,
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

    if (error) throw error;
    
    if (!data) return null;
    
    // Transform the database result to match our interface with default values
    return {
      id: data.id,
      full_name: data.full_name || '',
      email: data.email || undefined,
      interests: undefined, // Not stored in profiles table currently
      location: undefined, // Not stored in profiles table currently
      bio: undefined, // Not stored in profiles table currently
      is_anonymous: true, // Default for community profiles
      created_via: 'join-community' // Default value
    };
  }
}

export const communityService = new CommunityService();
