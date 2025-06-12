export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      advocacy_toolkit: {
        Row: {
          category: string
          content: string | null
          created_at: string | null
          description: string | null
          document_ids: string[] | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          document_ids?: string[] | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          document_ids?: string[] | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      app_changes: {
        Row: {
          affects_users: boolean
          change_type: string
          created_at: string
          description: string
          id: string
          processed: boolean
          severity: string
          technical_details: string
          updated_at: string
          user_friendly_message: string
        }
        Insert: {
          affects_users?: boolean
          change_type: string
          created_at?: string
          description: string
          id?: string
          processed?: boolean
          severity: string
          technical_details: string
          updated_at?: string
          user_friendly_message: string
        }
        Update: {
          affects_users?: boolean
          change_type?: string
          created_at?: string
          description?: string
          id?: string
          processed?: boolean
          severity?: string
          technical_details?: string
          updated_at?: string
          user_friendly_message?: string
        }
        Relationships: []
      }
      bill_follows: {
        Row: {
          bill_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          bill_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          bill_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_follows_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          category: string
          comments: Json | null
          constitutional_section: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          sponsor: string | null
          stages: Json | null
          status: string
          summary: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category: string
          comments?: Json | null
          constitutional_section?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          sponsor?: string | null
          stages?: Json | null
          status: string
          summary: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string
          comments?: Json | null
          constitutional_section?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          sponsor?: string | null
          stages?: Json | null
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          admin_notes: string | null
          author: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          id: string
          published_at: string | null
          rejection_reason: string | null
          scheduled_at: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          author?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          rejection_reason?: string | null
          scheduled_at?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          author?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          rejection_reason?: string | null
          scheduled_at?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      civic_education_providers: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          counties_served: string[] | null
          created_at: string | null
          description: string | null
          focus_areas: string[] | null
          id: string
          is_verified: boolean | null
          logo_url: string | null
          name: string
          submitted_by_user_id: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          counties_served?: string[] | null
          created_at?: string | null
          description?: string | null
          focus_areas?: string[] | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          submitted_by_user_id?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          counties_served?: string[] | null
          created_at?: string | null
          description?: string | null
          focus_areas?: string[] | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          submitted_by_user_id?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      civic_events: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          related_bill_id: string | null
          related_resource_id: string | null
          start_time: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          related_bill_id?: string | null
          related_resource_id?: string | null
          start_time?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          related_bill_id?: string | null
          related_resource_id?: string | null
          start_time?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "civic_events_related_bill_id_fkey"
            columns: ["related_bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "civic_events_related_resource_id_fkey"
            columns: ["related_resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_replies: {
        Row: {
          content: string
          created_at: string
          discussion_id: string
          id: string
          likes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          discussion_id: string
          id?: string
          likes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          discussion_id?: string
          id?: string
          likes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          likes: number | null
          replies: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          likes?: number | null
          replies?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          likes?: number | null
          replies?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          description: string | null
          file_type: Database["public"]["Enums"]["document_type"]
          file_url: string
          id: string
          is_approved: boolean | null
          mime_type: string
          size_bytes: number
          title: string
          updated_at: string | null
          user_id: string
          virus_scan_result: string | null
          virus_scanned: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_type: Database["public"]["Enums"]["document_type"]
          file_url: string
          id?: string
          is_approved?: boolean | null
          mime_type: string
          size_bytes: number
          title: string
          updated_at?: string | null
          user_id: string
          virus_scan_result?: string | null
          virus_scanned?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_type?: Database["public"]["Enums"]["document_type"]
          file_url?: string
          id?: string
          is_approved?: boolean | null
          mime_type?: string
          size_bytes?: number
          title?: string
          updated_at?: string | null
          user_id?: string
          virus_scan_result?: string | null
          virus_scanned?: boolean | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          message: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          message: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          message?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          related_entity_id: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          related_entity_id?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          related_entity_id?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      resource_views: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          resource_id: string
          resource_type: string
          user_agent: string | null
          user_id: string | null
          view_type: string
          viewed_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          resource_id: string
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
          view_type?: string
          viewed_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
          view_type?: string
          viewed_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          created_at: string
          description: string
          downloadUrl: string | null
          id: string
          is_downloadable: boolean | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string
          uploadedBy: string | null
          url: string
          user_id: string | null
          videoUrl: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          downloadUrl?: string | null
          id?: string
          is_downloadable?: boolean | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string
          uploadedBy?: string | null
          url: string
          user_id?: string | null
          videoUrl?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          downloadUrl?: string | null
          id?: string
          is_downloadable?: boolean | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string
          uploadedBy?: string | null
          url?: string
          user_id?: string | null
          videoUrl?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_contributions: {
        Row: {
          ai_summary: string | null
          ai_tags: string[] | null
          category: string | null
          content: string
          created_at: string
          document_url: string | null
          id: string
          status: string
          title: string
          updated_at: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          ai_summary?: string | null
          ai_tags?: string[] | null
          category?: string | null
          content: string
          created_at?: string
          document_url?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          ai_summary?: string | null
          ai_tags?: string[] | null
          category?: string | null
          content?: string
          created_at?: string
          document_url?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      volunteer_applications: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "volunteer_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_opportunities: {
        Row: {
          commitment: string
          created_at: string
          date: string
          description: string
          id: string
          location: string
          organization: string
          time: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          commitment: string
          created_at?: string
          date: string
          description: string
          id?: string
          location: string
          organization: string
          time: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          commitment?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          location?: string
          organization?: string
          time?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          bill_objective: string | null
          county: string | null
          created_at: string
          description: string | null
          download_url: string | null
          id: string
          is_downloadable: boolean | null
          status: string | null
          title: string | null
          updated_at: string | null
          uploaded_by: string | null
          url: string | null
        }
        Insert: {
          bill_objective?: string | null
          county?: string | null
          created_at?: string
          description?: string | null
          download_url?: string | null
          id?: string
          is_downloadable?: boolean | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          url?: string | null
        }
        Update: {
          bill_objective?: string | null
          county?: string | null
          created_at?: string
          description?: string | null
          download_url?: string | null
          id?: string
          is_downloadable?: boolean | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_for_volunteer_opportunity: {
        Args: { user_id: string; opportunity_id: string; motivation: string }
        Returns: undefined
      }
      create_discussion: {
        Args: {
          user_id: string
          resource_id: string
          topic: string
          content: string
        }
        Returns: undefined
      }
      create_event: {
        Args: {
          title: string
          description: string
          event_date: string
          start_time: string
          end_time: string
          category: string
        }
        Returns: undefined
      }
      delete_user_profile: {
        Args: { user_id: string; deactivate_user?: boolean }
        Returns: undefined
      }
      filter_resources_by_topic: {
        Args: { topic: string }
        Returns: {
          id: string
          title: string
          description: string
        }[]
      }
      follow_bill: {
        Args: { user_id: string; bill_id: string }
        Returns: undefined
      }
      get_advocacy_toolkit: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          description: string
        }[]
      }
      get_all_learning_materials: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          description: string
          type: string
        }[]
      }
      get_all_providers: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
        }[]
      }
      get_bill_details: {
        Args: { bill_id: string }
        Returns: {
          id: string
          title: string
          summary: string
          followed: boolean
        }[]
      }
      get_discussion_thread: {
        Args: { d_id: string }
        Returns: {
          discussion_id: string
          title: string
          content: string
          replies: Json
        }[]
      }
      get_followed_bills: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: {
          bill_id: string
          title: string
          summary: string
        }[]
      }
      get_my_volunteer_applications: {
        Args: { user_id: string }
        Returns: {
          opportunity_id: string
          status: string
          created_at: string
        }[]
      }
      get_resource_view_count: {
        Args: { p_resource_id: string; p_resource_type: string }
        Returns: number
      }
      get_upcoming_events: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          description: string
          event_date: string
          start_time: string
          end_time: string
        }[]
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: {
          id: string
          username: string
          full_name: string
          avatar_url: string
          email: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      list_open_volunteer_opportunities: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          organization: string
          description: string
        }[]
      }
      notify_users_about_bill_change: {
        Args: { bill_id: string }
        Returns: undefined
      }
      register_user_for_event: {
        Args: { event_id: string; user_id: string }
        Returns: undefined
      }
      reply_to_discussion: {
        Args: { discussion_id: string; user_id: string; reply_content: string }
        Returns: undefined
      }
      search_bills: {
        Args: { keyword: string }
        Returns: {
          id: string
          title: string
          summary: string
        }[]
      }
      search_providers_by_county_or_topic: {
        Args: { county: string; topic: string }
        Returns: {
          id: string
          name: string
          description: string
        }[]
      }
      submit_contribution: {
        Args: { user_id: string; type: string; content: string }
        Returns: undefined
      }
      submit_feedback: {
        Args: { user_id: string; subject: string; body: string }
        Returns: undefined
      }
      track_resource_view: {
        Args: {
          p_resource_id: string
          p_resource_type: string
          p_view_type?: string
          p_user_id?: string
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
      unfollow_bill: {
        Args: { user_id: string; bill_id: string }
        Returns: undefined
      }
      update_user_profile: {
        Args: { user_id: string; name: string; location: string; bio: string }
        Returns: undefined
      }
    }
    Enums: {
      document_type: "pdf" | "video" | "image" | "text" | "doc" | "docx"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      document_type: ["pdf", "video", "image", "text", "doc", "docx"],
    },
  },
} as const
