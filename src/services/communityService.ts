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

/** Parse value that may be a JSON string, an array, or another shape into string[] | undefined */
function parseJsonArray(value: unknown): string[] | undefined {
  if (value == null) return undefined;

  // If it's already an array, map elements to strings
  if (Array.isArray(value)) {
    return value.map((v) => (v === null || v === undefined ? '' : String(v)));
  }

  // If value is a string, attempt to parse JSON
  if (typeof value === 'string') {
    // Fast path: check if it looks like JSON array before parsing
    const trimmed = value.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((v) => String(v));
      } catch {
        // malformed JSON string -> return undefined (non-destructive)
        return undefined;
      }
    }
    // Not a JSON array string; treat as single string element
    return [value];
  }

  // If it's an object (JSONB stored as object), extract string values
  if (typeof value === 'object') {
    try {
      const obj = value as Record<string, unknown>;
      // If it's array-like (has numeric keys), convert to array
      if ((obj as any).length && typeof (obj as any).length === 'number') {
        return Array.from(obj as any).map(String);
      }
      // Otherwise, take values as strings
      return Object.values(obj).map((v) => String(v));
    } catch {
      return undefined;
    }
  }

  // Numbers/booleans -> single-element array
  if (typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)];
  }

  return undefined;
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
      interests: parseJsonArray(data.interests), // string[] | undefined
      areas_of_interest: parseJsonArray(data.areas_of_interest), // string[] | undefined
      created_via: 'join-community'
    };
  }
}

export const communityService = new CommunityService();
