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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      accommodations: {
        Row: {
          active: boolean
          city: string | null
          contact_email: string | null
          created_at: string
          destination_slug: string
          id: string
          level: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          city?: string | null
          contact_email?: string | null
          created_at?: string
          destination_slug?: string
          id?: string
          level?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          city?: string | null
          contact_email?: string | null
          created_at?: string
          destination_slug?: string
          id?: string
          level?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      activities: {
        Row: {
          blurb: string
          created_at: string
          destination_slugs: string[]
          id: string
          name: string
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          blurb?: string
          created_at?: string
          destination_slugs?: string[]
          id?: string
          name: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          blurb?: string
          created_at?: string
          destination_slugs?: string[]
          id?: string
          name?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          booking_id: string
          created_at: string
          end_date: string | null
          guide_id: string | null
          id: string
          notes: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          end_date?: string | null
          guide_id?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          end_date?: string | null
          guide_id?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          body: string[]
          category: string
          created_at: string
          excerpt: string
          id: string
          image_key: string
          post_date: string
          published: boolean
          read_minutes: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string[]
          category?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_key?: string
          post_date?: string
          published?: boolean
          read_minutes?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string[]
          category?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_key?: string
          post_date?: string
          published?: boolean
          read_minutes?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          amount_paid: number
          created_at: string
          currency: string
          end_date: string | null
          id: string
          lead_email: string
          lead_name: string
          notes: string | null
          package_id: string | null
          quote_id: string | null
          reference: string
          request_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["booking_status"]
          title: string
          total_amount: number
          travelers: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          lead_email?: string
          lead_name?: string
          notes?: string | null
          package_id?: string | null
          quote_id?: string | null
          reference: string
          request_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          title: string
          total_amount?: number
          travelers?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          lead_email?: string
          lead_name?: string
          notes?: string | null
          package_id?: string | null
          quote_id?: string | null
          reference?: string
          request_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          title?: string
          total_amount?: number
          travelers?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "safari_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          accommodation: string[]
          activities: string[]
          attractions: string[]
          best_time: string
          country: string
          created_at: string
          description: string
          duration: string
          faq: Json
          id: string
          image_key: string
          name: string
          published: boolean
          region: string
          slug: string
          sort_order: number
          summary: string
          travel_info: string[]
          updated_at: string
        }
        Insert: {
          accommodation?: string[]
          activities?: string[]
          attractions?: string[]
          best_time?: string
          country: string
          created_at?: string
          description?: string
          duration?: string
          faq?: Json
          id?: string
          image_key?: string
          name: string
          published?: boolean
          region?: string
          slug: string
          sort_order?: number
          summary?: string
          travel_info?: string[]
          updated_at?: string
        }
        Update: {
          accommodation?: string[]
          activities?: string[]
          attractions?: string[]
          best_time?: string
          country?: string
          created_at?: string
          description?: string
          duration?: string
          faq?: Json
          id?: string
          image_key?: string
          name?: string
          published?: boolean
          region?: string
          slug?: string
          sort_order?: number
          summary?: string
          travel_info?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      guides: {
        Row: {
          active: boolean
          created_at: string
          daily_rate: number
          email: string | null
          full_name: string
          id: string
          languages: string[]
          phone: string | null
          specialties: string[]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          daily_rate?: number
          email?: string | null
          full_name: string
          id?: string
          languages?: string[]
          phone?: string | null
          specialties?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          daily_rate?: number
          email?: string | null
          full_name?: string
          id?: string
          languages?: string[]
          phone?: string | null
          specialties?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      packages: {
        Row: {
          accommodation: string
          available_months: string
          cancellation: string
          category: string
          created_at: string
          currency: string
          days: number
          description: string
          destination_slugs: string[]
          excluded: string[]
          featured: boolean
          highlights: string[]
          id: string
          image_key: string
          included: string[]
          itinerary: Json
          max_travelers: number
          nights: number
          price_from: number
          published: boolean
          requirements: string[]
          short: string
          slug: string
          sort_order: number
          title: string
          transport: string
          updated_at: string
        }
        Insert: {
          accommodation?: string
          available_months?: string
          cancellation?: string
          category?: string
          created_at?: string
          currency?: string
          days?: number
          description?: string
          destination_slugs?: string[]
          excluded?: string[]
          featured?: boolean
          highlights?: string[]
          id?: string
          image_key?: string
          included?: string[]
          itinerary?: Json
          max_travelers?: number
          nights?: number
          price_from?: number
          published?: boolean
          requirements?: string[]
          short?: string
          slug: string
          sort_order?: number
          title: string
          transport?: string
          updated_at?: string
        }
        Update: {
          accommodation?: string
          available_months?: string
          cancellation?: string
          category?: string
          created_at?: string
          currency?: string
          days?: number
          description?: string
          destination_slugs?: string[]
          excluded?: string[]
          featured?: boolean
          highlights?: string[]
          id?: string
          image_key?: string
          included?: string[]
          itinerary?: Json
          max_travelers?: number
          nights?: number
          price_from?: number
          published?: boolean
          requirements?: string[]
          short?: string
          slug?: string
          sort_order?: number
          title?: string
          transport?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string
          id: string
          method: string
          paid_at: string | null
          recorded_by: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          method?: string
          paid_at?: string | null
          recorded_by?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          method?: string
          paid_at?: string | null
          recorded_by?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          id: string
          items: Json
          reference: string
          request_id: string | null
          status: Database["public"]["Enums"]["quote_status"]
          summary: string | null
          title: string
          total_amount: number
          updated_at: string
          user_id: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          items?: Json
          reference: string
          request_id?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          summary?: string | null
          title?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          items?: Json
          reference?: string
          request_id?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          summary?: string | null
          title?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "safari_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      safari_requests: {
        Row: {
          accommodation_level: string | null
          adults: number
          budget_range: string | null
          children: number
          country: string | null
          created_at: string
          destination_slugs: string[]
          email: string
          end_date: string | null
          full_name: string
          id: string
          interests: string[]
          notes: string | null
          phone: string | null
          reference: string
          start_date: string | null
          status: Database["public"]["Enums"]["request_status"]
          transport: string[]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accommodation_level?: string | null
          adults?: number
          budget_range?: string | null
          children?: number
          country?: string | null
          created_at?: string
          destination_slugs?: string[]
          email: string
          end_date?: string | null
          full_name: string
          id?: string
          interests?: string[]
          notes?: string | null
          phone?: string | null
          reference: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          transport?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accommodation_level?: string | null
          adults?: number
          budget_range?: string | null
          children?: number
          country?: string | null
          created_at?: string
          destination_slugs?: string[]
          email?: string
          end_date?: string | null
          full_name?: string
          id?: string
          interests?: string[]
          notes?: string | null
          phone?: string | null
          reference?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          transport?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          country: string
          created_at: string
          id: string
          name: string
          published: boolean
          quote: string
          rating: number
          sort_order: number
          trip: string
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          id?: string
          name: string
          published?: boolean
          quote: string
          rating?: number
          sort_order?: number
          trip?: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          name?: string
          published?: boolean
          quote?: string
          rating?: number
          sort_order?: number
          trip?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          active: boolean
          capacity: number
          created_at: string
          daily_rate: number
          id: string
          name: string
          plate: string | null
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          active?: boolean
          capacity?: number
          created_at?: string
          daily_rate?: number
          id?: string
          name: string
          plate?: string | null
          updated_at?: string
          vehicle_type?: string
        }
        Update: {
          active?: boolean
          capacity?: number
          created_at?: string
          daily_rate?: number
          id?: string
          name?: string
          plate?: string | null
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_reference: { Args: { _prefix: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff" | "guide" | "customer"
      assignment_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      payment_status: "pending" | "paid" | "refunded" | "failed"
      quote_status: "draft" | "sent" | "accepted" | "rejected" | "expired"
      request_status: "new" | "reviewing" | "quoted" | "converted" | "declined"
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
      app_role: ["admin", "staff", "guide", "customer"],
      assignment_status: ["scheduled", "in_progress", "completed", "cancelled"],
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      payment_status: ["pending", "paid", "refunded", "failed"],
      quote_status: ["draft", "sent", "accepted", "rejected", "expired"],
      request_status: ["new", "reviewing", "quoted", "converted", "declined"],
    },
  },
} as const
