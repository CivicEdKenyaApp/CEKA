
import { supabase } from '@/integrations/supabase/client';

export interface CommunityProfile {
  id?: string;
  full_name: string;
  email?: string;
  county?: string;
  bio?: string;
  interests?: string[];
  areas_of_interest?: string[];
  created_via?: string;
}

export class CommunityService {
  async createCommunityProfile(profileData: Omit<CommunityProfile, 'id' | 'created_via'>): Promise<string> {
    const { data, error } = await supabase.rpc('create_community_profile', {
      p_full_name: profileData.full_name,
      p_email: profileData.email || null,
      p_county: profileData.county || null,
      p_bio: profileData.bio || null,
      p_interests: profileData.interests ? JSON.stringify(profileData.interests) : null,
      p_areas_of_interest: profileData.areas_of_interest ? JSON.stringify(profileData.areas_of_interest) : null
    });

    if (error) throw error;
    return data;
  }

  async linkProfileToUser(profileId: string, userId: string): Promise<void> {
    const { error } = await supabase.rpc('link_community_profile', {
      p_profile_id: profileId,
      p_auth_user_id: userId
    });

    if (error) throw error;
  }

  async findAnonymousProfileByEmail(email: string): Promise<CommunityProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, county, bio, interests, areas_of_interest')
      .eq('email', email)
      .eq('created_via', 'join-community')
      .is('auth_user_id', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (!data) return null;
    
    return {
      id: data.id,
      full_name: data.full_name || '',
      email: data.email || undefined,
      county: data.county || undefined,
      bio: data.bio || undefined,
      interests: data.interests || undefined,
      areas_of_interest: data.areas_of_interest || undefined,
      created_via: 'join-community'
    };
  }
}

export const communityService = new CommunityService();
