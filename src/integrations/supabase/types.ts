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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ad_repostings: {
        Row: {
          ad_id: number | null
          credits_used: number
          days_since_publish: number | null
          id: number
          repost_type: string
          reposted_at: string | null
          user_id: string | null
        }
        Insert: {
          ad_id?: number | null
          credits_used: number
          days_since_publish?: number | null
          id?: number
          repost_type: string
          reposted_at?: string | null
          user_id?: string | null
        }
        Update: {
          ad_id?: number | null
          credits_used?: number
          days_since_publish?: number | null
          id?: number
          repost_type?: string
          reposted_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_repostings_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "anunturi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_repostings_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "v_ads_for_auto_repost"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ad"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "anunturi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ad"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "v_ads_for_auto_repost"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_capabilities: {
        Row: {
          agent_name: string
          capability_description: string | null
          capability_name: string
          created_at: string | null
          id: number
          is_active: boolean | null
          proficiency_level: number | null
        }
        Insert: {
          agent_name: string
          capability_description?: string | null
          capability_name: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          proficiency_level?: number | null
        }
        Update: {
          agent_name?: string
          capability_description?: string | null
          capability_name?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          proficiency_level?: number | null
        }
        Relationships: []
      }
      agent_learning_history: {
        Row: {
          agent_name: string
          created_at: string | null
          feedback: string | null
          id: number
          input_data: Json | null
          output_data: Json | null
          performance_score: number | null
          success: boolean | null
          task_description: string
        }
        Insert: {
          agent_name: string
          created_at?: string | null
          feedback?: string | null
          id?: number
          input_data?: Json | null
          output_data?: Json | null
          performance_score?: number | null
          success?: boolean | null
          task_description: string
        }
        Update: {
          agent_name?: string
          created_at?: string | null
          feedback?: string | null
          id?: number
          input_data?: Json | null
          output_data?: Json | null
          performance_score?: number | null
          success?: boolean | null
          task_description?: string
        }
        Relationships: []
      }
      agent_matches: {
        Row: {
          agent_id: number
          created_at: string | null
          id: number
          listing_id: number
          match_score: number
          notified_at: string | null
        }
        Insert: {
          agent_id: number
          created_at?: string | null
          id?: number
          listing_id: number
          match_score: number
          notified_at?: string | null
        }
        Update: {
          agent_id?: number
          created_at?: string | null
          id?: number
          listing_id?: number
          match_score?: number
          notified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_matches_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "shopping_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_matches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "anunturi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_matches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_ads_for_auto_repost"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_patterns: {
        Row: {
          action_pattern: string
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: number
          name: string
          trigger_pattern: string
        }
        Insert: {
          action_pattern: string
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: number
          name: string
          trigger_pattern: string
        }
        Update: {
          action_pattern?: string
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: number
          name?: string
          trigger_pattern?: string
        }
        Relationships: []
      }
      agent_tasks: {
        Row: {
          created_at: string | null
          description: string
          error: string | null
          id: number
          priority: string | null
          result: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          error?: string | null
          id?: number
          priority?: string | null
          result?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          error?: string | null
          id?: number
          priority?: string | null
          result?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_tools: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: number
          name: string
          type: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: number
          name: string
          type: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: number
          name?: string
          type?: string
        }
        Relationships: []
      }
      agent_training_data: {
        Row: {
          agent_name: string
          category: string | null
          context: Json | null
          created_at: string | null
          expected_output: string
          id: number
          input_text: string
          quality_score: number | null
          updated_at: string | null
        }
        Insert: {
          agent_name: string
          category?: string | null
          context?: Json | null
          created_at?: string | null
          expected_output: string
          id?: number
          input_text: string
          quality_score?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_name?: string
          category?: string | null
          context?: Json | null
          created_at?: string | null
          expected_output?: string
          id?: number
          input_text?: string
          quality_score?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      anunturi: {
        Row: {
          auto_repost_enabled: boolean | null
          auto_repost_interval: string | null
          category_id: number
          contact_email: string | null
          created_at: string | null
          days_active: number | null
          description: string | null
          first_published_at: string | null
          id: number
          images: Json | null
          is_featured: boolean | null
          is_premium: boolean | null
          last_reposted_at: string | null
          location: string | null
          phone: string | null
          price: number | null
          repost_count: number | null
          status: string | null
          subcategory_id: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_repost_enabled?: boolean | null
          auto_repost_interval?: string | null
          category_id: number
          contact_email?: string | null
          created_at?: string | null
          days_active?: number | null
          description?: string | null
          first_published_at?: string | null
          id?: number
          images?: Json | null
          is_featured?: boolean | null
          is_premium?: boolean | null
          last_reposted_at?: string | null
          location?: string | null
          phone?: string | null
          price?: number | null
          repost_count?: number | null
          status?: string | null
          subcategory_id?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_repost_enabled?: boolean | null
          auto_repost_interval?: string | null
          category_id?: number
          contact_email?: string | null
          created_at?: string | null
          days_active?: number | null
          description?: string | null
          first_published_at?: string | null
          id?: number
          images?: Json | null
          is_featured?: boolean | null
          is_premium?: boolean | null
          last_reposted_at?: string | null
          location?: string | null
          phone?: string | null
          price?: number | null
          repost_count?: number | null
          status?: string | null
          subcategory_id?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anunturi_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anunturi_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          last_run: string | null
          name: string
          next_run: string | null
          prompt: string
          results: Json | null
          schedule: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id: string
          last_run?: string | null
          name: string
          next_run?: string | null
          prompt: string
          results?: Json | null
          schedule: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          last_run?: string | null
          name?: string
          next_run?: string | null
          prompt?: string
          results?: Json | null
          schedule?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      credit_packages: {
        Row: {
          credits: number
          id: number
          is_active: boolean | null
          name: string
          price: number
          stripe_price_id: string | null
        }
        Insert: {
          credits: number
          id?: number
          is_active?: boolean | null
          name: string
          price: number
          stripe_price_id?: string | null
        }
        Update: {
          credits?: number
          id?: number
          is_active?: boolean | null
          name?: string
          price?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      credits_transactions: {
        Row: {
          ad_id: number | null
          amount_eur: number | null
          created_at: string | null
          credits_amount: number
          id: number
          notes: string | null
          package_id: number | null
          status: string | null
          stripe_payment_id: string | null
          transaction_type: string | null
          user_id: string
        }
        Insert: {
          ad_id?: number | null
          amount_eur?: number | null
          created_at?: string | null
          credits_amount: number
          id?: number
          notes?: string | null
          package_id?: number | null
          status?: string | null
          stripe_payment_id?: string | null
          transaction_type?: string | null
          user_id: string
        }
        Update: {
          ad_id?: number | null
          amount_eur?: number | null
          created_at?: string | null
          credits_amount?: number
          id?: number
          notes?: string | null
          package_id?: number | null
          status?: string | null
          stripe_payment_id?: string | null
          transaction_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_transactions_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "anunturi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_transactions_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "v_ads_for_auto_repost"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_transactions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "credit_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_boosts: {
        Row: {
          auto_repost: boolean | null
          boost_type: string
          created_at: string | null
          duration_days: number
          id: number
          is_active: boolean | null
          listing_id: number
          payment_id: string | null
          starts_at: string | null
        }
        Insert: {
          auto_repost?: boolean | null
          boost_type: string
          created_at?: string | null
          duration_days: number
          id?: number
          is_active?: boolean | null
          listing_id: number
          payment_id?: string | null
          starts_at?: string | null
        }
        Update: {
          auto_repost?: boolean | null
          boost_type?: string
          created_at?: string | null
          duration_days?: number
          id?: number
          is_active?: boolean | null
          listing_id?: number
          payment_id?: string | null
          starts_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_boosts_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "anunturi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_boosts_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_ads_for_auto_repost"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_agents: {
        Row: {
          created_at: string | null
          description: string
          filters: Json | null
          id: number
          is_active: boolean | null
          last_checked_at: string | null
          matches_found: number | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          filters?: Json | null
          id?: number
          is_active?: boolean | null
          last_checked_at?: string | null
          matches_found?: number | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          filters?: Json | null
          id?: number
          is_active?: boolean | null
          last_checked_at?: string | null
          matches_found?: number | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: number
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          category_id: number
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          category_id?: number
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          credits_balance: number | null
          credits_validity_date: string | null
          email: string | null
          full_name: string | null
          id: number
          last_credit_purchase: string | null
          total_credits_purchased: number | null
          total_credits_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_balance?: number | null
          credits_validity_date?: string | null
          email?: string | null
          full_name?: string | null
          id?: number
          last_credit_purchase?: string | null
          total_credits_purchased?: number | null
          total_credits_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_balance?: number | null
          credits_validity_date?: string | null
          email?: string | null
          full_name?: string | null
          id?: number
          last_credit_purchase?: string | null
          total_credits_purchased?: number | null
          total_credits_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_ads_for_auto_repost: {
        Row: {
          credits_balance: number | null
          days_active: number | null
          hours_since_last_repost: number | null
          id: number | null
          last_reposted_at: string | null
          repost_count: number | null
          title: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_credits: {
        Args: {
          p_amount: number
          p_package_id?: number
          p_payment_id?: string
          p_user_id: string
        }
        Returns: boolean
      }
      deduct_credits: {
        Args: {
          p_ad_id?: number
          p_amount: number
          p_transaction_type?: string
          p_user_id: string
        }
        Returns: boolean
      }
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
  public: {
    Enums: {},
  },
} as const