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
          created_at: string
          date: string
          id: string
          status: string
          summary: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          date?: string
          id?: string
          status: string
          summary: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          id?: string
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          url?: string | null
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
      resources: {
        Row: {
          category: string
          created_at: string
          description: string
          downloadUrl: string | null
          id: string
          is_downloadable: boolean | null
          title: string
          type: string
          updated_at: string
          uploadedBy: string | null
          url: string
          videoUrl: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          downloadUrl?: string | null
          id?: string
          is_downloadable?: boolean | null
          title: string
          type: string
          updated_at?: string
          uploadedBy?: string | null
          url: string
          videoUrl?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          downloadUrl?: string | null
          id?: string
          is_downloadable?: boolean | null
          title?: string
          type?: string
          updated_at?: string
          uploadedBy?: string | null
          url?: string
          videoUrl?: string | null
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
      [_ in never]: never
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
