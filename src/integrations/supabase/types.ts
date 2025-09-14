export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
      admin_sessions: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          is_active: boolean
          last_active: string
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          is_active?: boolean
          last_active?: string
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          last_active?: string
          session_token?: string
          user_id?: string
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
          sources: string | null
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
          sources?: string | null
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
          sources?: string | null
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
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          admin_notes: string | null
          author: string | null
          category_id: string | null
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
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          author?: string | null
          category_id?: string | null
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
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          author?: string | null
          category_id?: string | null
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
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carousel_slides: {
        Row: {
          animation_type: string | null
          badge_color: string | null
          button_color_dark: string | null
          button_color_light: string | null
          color: string | null
          created_at: string | null
          cta_text: string | null
          description: string | null
          gradient_from: string | null
          gradient_to: string | null
          icon_name: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          order_index: number | null
          priority: number | null
          text_color_dark: string | null
          text_color_light: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          animation_type?: string | null
          badge_color?: string | null
          button_color_dark?: string | null
          button_color_light?: string | null
          color?: string | null
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          gradient_from?: string | null
          gradient_to?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          order_index?: number | null
          priority?: number | null
          text_color_dark?: string | null
          text_color_light?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          animation_type?: string | null
          badge_color?: string | null
          button_color_dark?: string | null
          button_color_light?: string | null
          color?: string | null
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          gradient_from?: string | null
          gradient_to?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          order_index?: number | null
          priority?: number | null
          text_color_dark?: string | null
          text_color_light?: string | null
          title?: string
          type?: string | null
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
        Relationships: [
          {
            foreignKeyName: "civic_education_providers_submitted_by_user_id_fkey"
            columns: ["submitted_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      community_members: {
        Row: {
          areas_of_interest: string[] | null
          county: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          interests: string | null
          last_name: string
          source_ip: string | null
          status: string | null
          terms_accepted: boolean
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          areas_of_interest?: string[] | null
          county?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          interests?: string | null
          last_name: string
          source_ip?: string | null
          status?: string | null
          terms_accepted?: boolean
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          areas_of_interest?: string[] | null
          county?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          interests?: string | null
          last_name?: string
          source_ip?: string | null
          status?: string | null
          terms_accepted?: boolean
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_facilities: {
        Row: {
          constituency: string | null
          county: string | null
          division: string | null
          FID: number
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string | null
          nearest_to: string | null
          OBJECTID: number | null
          owner: string | null
          sub_location: string | null
          subcounty: string | null
          type: string | null
        }
        Insert: {
          constituency?: string | null
          county?: string | null
          division?: string | null
          FID: number
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string | null
          nearest_to?: string | null
          OBJECTID?: number | null
          owner?: string | null
          sub_location?: string | null
          subcounty?: string | null
          type?: string | null
        }
        Update: {
          constituency?: string | null
          county?: string | null
          division?: string | null
          FID?: number
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string | null
          nearest_to?: string | null
          OBJECTID?: number | null
          owner?: string | null
          sub_location?: string | null
          subcounty?: string | null
          type?: string | null
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
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_step: string | null
          error_message: string | null
          expires_at: string | null
          id: string
          input_files: Json | null
          input_urls: Json | null
          job_name: string
          output_files: Json | null
          processing_logs: Json | null
          progress: number | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string
          input_files?: Json | null
          input_urls?: Json | null
          job_name: string
          output_files?: Json | null
          processing_logs?: Json | null
          progress?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string
          input_files?: Json | null
          input_urls?: Json | null
          job_name?: string
          output_files?: Json | null
          processing_logs?: Json | null
          progress?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          areas_of_interest: Json | null
          auth_user_id: string | null
          avatar_url: string | null
          bio: string | null
          county: string | null
          created_at: string
          created_via: string | null
          email: string | null
          full_name: string | null
          id: string
          interests: Json | null
          is_admin: boolean | null
          updated_at: string
          username: string | null
        }
        Insert: {
          areas_of_interest?: Json | null
          auth_user_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          county?: string | null
          created_at?: string
          created_via?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          interests?: Json | null
          is_admin?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          areas_of_interest?: Json | null
          auth_user_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          county?: string | null
          created_at?: string
          created_via?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          interests?: Json | null
          is_admin?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      resource_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
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
        Relationships: [
          {
            foreignKeyName: "resource_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      system_metrics: {
        Row: {
          created_at: string
          id: string
          metric_date: string
          metric_name: string
          metric_value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metric_date?: string
          metric_name: string
          metric_value: number
        }
        Update: {
          created_at?: string
          id?: string
          metric_date?: string
          metric_name?: string
          metric_value?: number
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visualizers: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          geo_json_url: string | null
          id: number
          is_active: boolean | null
          title: string
          type: string
          updated_at: string | null
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          geo_json_url?: string | null
          id?: number
          is_active?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          geo_json_url?: string | null
          id?: number
          is_active?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          url?: string
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
          apply_url: string | null
          commitment: string
          contact_email: string | null
          created_at: string
          created_by_user_id: string | null
          date: string
          description: string
          id: string
          is_remote: boolean | null
          location: string
          organization: string
          skills_required: Json | null
          status: string | null
          tags: Json | null
          time: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          apply_url?: string | null
          commitment: string
          contact_email?: string | null
          created_at?: string
          created_by_user_id?: string | null
          date: string
          description: string
          id?: string
          is_remote?: boolean | null
          location: string
          organization: string
          skills_required?: Json | null
          status?: string | null
          tags?: Json | null
          time: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          apply_url?: string | null
          commitment?: string
          contact_email?: string | null
          created_at?: string
          created_by_user_id?: string | null
          date?: string
          description?: string
          id?: string
          is_remote?: boolean | null
          location?: string
          organization?: string
          skills_required?: Json | null
          status?: string | null
          tags?: Json | null
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
        Args: { motivation: string; opportunity_id: string; user_id: string }
        Returns: undefined
      }
      cleanup_expired_admin_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_processing_jobs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_admin_session: {
        Args: { p_email: string; p_user_id: string }
        Returns: {
          expires_at: string
          session_token: string
        }[]
      }
      create_community_profile: {
        Args: {
          p_areas_of_interest?: Json
          p_bio?: string
          p_county?: string
          p_email?: string
          p_full_name: string
          p_interests?: Json
        }
        Returns: string
      }
      create_discussion: {
        Args: {
          content: string
          resource_id: string
          topic: string
          user_id: string
        }
        Returns: undefined
      }
      create_event: {
        Args: {
          category: string
          description: string
          end_time: string
          event_date: string
          start_time: string
          title: string
        }
        Returns: undefined
      }
      delete_user_profile: {
        Args: { deactivate_user?: boolean; user_id: string }
        Returns: undefined
      }
      filter_resources_by_topic: {
        Args: { topic: string }
        Returns: {
          description: string
          id: string
          title: string
        }[]
      }
      follow_bill: {
        Args: { bill_id: string; user_id: string }
        Returns: undefined
      }
      get_advocacy_toolkit: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          id: string
          title: string
        }[]
      }
      get_all_learning_materials: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          id: string
          title: string
          type: string
        }[]
      }
      get_all_providers: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          id: string
          name: string
        }[]
      }
      get_bill_details: {
        Args: { bill_id: string }
        Returns: {
          followed: boolean
          id: string
          summary: string
          title: string
        }[]
      }
      get_discussion_thread: {
        Args: { d_id: string }
        Returns: {
          content: string
          discussion_id: string
          replies: Json
          title: string
        }[]
      }
      get_followed_bills: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: {
          bill_id: string
          summary: string
          title: string
        }[]
      }
      get_my_volunteer_applications: {
        Args: { user_id: string }
        Returns: {
          created_at: string
          opportunity_id: string
          status: string
        }[]
      }
      get_processing_job_status: {
        Args: { job_id: string }
        Returns: {
          current_step: string
          error_message: string
          expires_at: string
          id: string
          output_files: Json
          progress: number
          status: string
        }[]
      }
      get_resource_view_count: {
        Args: { p_resource_id: string; p_resource_type: string }
        Returns: number
      }
      get_upcoming_events: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          end_time: string
          event_date: string
          id: string
          start_time: string
          title: string
        }[]
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: {
          avatar_url: string
          email: string
          full_name: string
          id: string
          username: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      link_community_profile: {
        Args: { p_auth_user_id: string; p_profile_id: string }
        Returns: undefined
      }
      list_open_volunteer_opportunities: {
        Args: Record<PropertyKey, never>
        Returns: {
          description: string
          id: string
          organization: string
          title: string
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
        Args: { discussion_id: string; reply_content: string; user_id: string }
        Returns: undefined
      }
      search_bills: {
        Args: { keyword: string }
        Returns: {
          id: string
          summary: string
          title: string
        }[]
      }
      search_providers_by_county_or_topic: {
        Args: { county: string; topic: string }
        Returns: {
          description: string
          id: string
          name: string
        }[]
      }
      submit_contribution: {
        Args: { content: string; type: string; user_id: string }
        Returns: undefined
      }
      submit_feedback: {
        Args: { body: string; subject: string; user_id: string }
        Returns: undefined
      }
      track_resource_view: {
        Args: {
          p_ip_address?: unknown
          p_resource_id: string
          p_resource_type: string
          p_user_agent?: string
          p_user_id?: string
          p_view_type?: string
        }
        Returns: string
      }
      unfollow_bill: {
        Args: { bill_id: string; user_id: string }
        Returns: undefined
      }
      update_processing_job_progress: {
        Args: {
          job_id: string
          log_entry?: Json
          new_progress: number
          new_status?: string
          new_step?: string
        }
        Returns: undefined
      }
      update_user_profile: {
        Args: { bio: string; location: string; name: string; user_id: string }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
