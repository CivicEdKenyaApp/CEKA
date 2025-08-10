
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

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

// Helper function to safely parse Json arrays to string arrays
const parseJsonArray = (jsonValue: Json | null | undefined): string[] => {
  if (!jsonValue) return [];
  
  if (Array.isArray(jsonValue)) {
    return jsonValue.filter((item): item is string => typeof item === 'string');
  }
  
  if (typeof jsonValue === 'string') {
    try {
      const parsed = JSON.parse(jsonValue);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string');
      }
    } catch {
      // If parsing fails, return empty array
    }
  }
  
  return [];
};

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
      interests: parseJsonArray(data.interests),
      areas_of_interest: parseJsonArray(data.areas_of_interest),
      created_via: 'join-community'
    };
  }
}

export const communityService = new CommunityService();
