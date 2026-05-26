export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      articles: {
        Row: {
          author_name: string
          category: string
          content_mdx: string
          cover_image_url: string | null
          created_at: string
          excerpt: string
          id: string
          is_published: boolean
          published_at: string | null
          read_time_mins: number
          related_resource_slug: string | null
          search_vector: unknown
          slug: string
          tags: string[]
          title: string
        }
        Insert: {
          author_name?: string
          category: string
          content_mdx?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          read_time_mins?: number
          related_resource_slug?: string | null
          search_vector?: unknown
          slug: string
          tags?: string[]
          title: string
        }
        Update: {
          author_name?: string
          category?: string
          content_mdx?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          read_time_mins?: number
          related_resource_slug?: string | null
          search_vector?: unknown
          slug?: string
          tags?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_related_resource_slug_fkey"
            columns: ["related_resource_slug"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["slug"]
          },
        ]
      }
      experts: {
        Row: {
          avatar_url: string | null
          bio: string
          certifications: string[]
          contact_email: string
          created_at: string
          experience_years: number
          full_name: string
          hourly_rate: number | null
          id: string
          is_available: boolean
          is_featured: boolean
          location: string
          search_vector: unknown
          specializations: string[]
          status: string
          title: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          certifications?: string[]
          contact_email: string
          created_at?: string
          experience_years?: number
          full_name: string
          hourly_rate?: number | null
          id?: string
          is_available?: boolean
          is_featured?: boolean
          location?: string
          search_vector?: unknown
          specializations?: string[]
          status?: string
          title?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          certifications?: string[]
          contact_email?: string
          created_at?: string
          experience_years?: number
          full_name?: string
          hourly_rate?: number | null
          id?: string
          is_available?: boolean
          is_featured?: boolean
          location?: string
          search_vector?: unknown
          specializations?: string[]
          status?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          source: string
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          source?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          source?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_admin: boolean
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string
          id: string
          is_admin?: boolean
          role: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_admin?: boolean
          role?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          created_at: string
          description: string
          download_count: number
          file_type: string
          file_url: string | null
          id: string
          is_free: boolean
          search_vector: unknown
          slug: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string
          download_count?: number
          file_type?: string
          file_url?: string | null
          id?: string
          is_free?: boolean
          search_vector?: unknown
          slug: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          download_count?: number
          file_type?: string
          file_url?: string | null
          id?: string
          is_free?: boolean
          search_vector?: unknown
          slug?: string
          title?: string
        }
        Relationships: []
      }
      service_inquiries: {
        Row: {
          company_name: string
          email: string
          full_name: string
          id: string
          is_read: boolean
          message: string
          service_needed: string
          source: string
          submitted_at: string
        }
        Insert: {
          company_name: string
          email: string
          full_name: string
          id?: string
          is_read?: boolean
          message: string
          service_needed: string
          source?: string
          submitted_at?: string
        }
        Update: {
          company_name?: string
          email?: string
          full_name?: string
          id?: string
          is_read?: boolean
          message?: string
          service_needed?: string
          source?: string
          submitted_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      experts_search_doc: {
        Args: {
          p_full_name: string
          p_specializations: string[]
          p_title: string
        }
        Returns: unknown
      }
      increment_template_download: {
        Args: { p_template_id: string }
        Returns: {
          file_url: string
        }[]
      }
      is_admin: { Args: { uid: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

