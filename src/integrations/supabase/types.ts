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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: string | null
          entity: string | null
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: string | null
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: string | null
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          alt_phone: string | null
          created_at: string
          email: string | null
          full_name: string
          governorate: string | null
          id: string
          national_id: string | null
          notes: string | null
          phone: string
          segment: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          alt_phone?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          governorate?: string | null
          id?: string
          national_id?: string | null
          notes?: string | null
          phone: string
          segment?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          alt_phone?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          governorate?: string | null
          id?: string
          national_id?: string | null
          notes?: string | null
          phone?: string
          segment?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inventory_numbers: {
        Row: {
          company: string
          created_at: string
          gb_quota: number | null
          id: string
          kind: string
          minutes_quota: number | null
          notes: string | null
          number: string
          status: string
        }
        Insert: {
          company: string
          created_at?: string
          gb_quota?: number | null
          id?: string
          kind?: string
          minutes_quota?: number | null
          notes?: string | null
          number: string
          status?: string
        }
        Update: {
          company?: string
          created_at?: string
          gb_quota?: number | null
          id?: string
          kind?: string
          minutes_quota?: number | null
          notes?: string | null
          number?: string
          status?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          amount_paid: number
          billing_period: string | null
          created_at: string
          customer_id: string
          due_date: string | null
          id: string
          status: string
          subscription_id: string | null
        }
        Insert: {
          amount?: number
          amount_paid?: number
          billing_period?: string | null
          created_at?: string
          customer_id: string
          due_date?: string | null
          id?: string
          status?: string
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          amount_paid?: number
          billing_period?: string | null
          created_at?: string
          customer_id?: string
          due_date?: string | null
          id?: string
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      lines: {
        Row: {
          created_at: string
          customer_id: string | null
          gb_total: number | null
          gb_used: number | null
          id: string
          line_type: string
          minutes_total: number | null
          minutes_used: number | null
          notes: string | null
          number: string
          package_id: string | null
          parent_line_id: string | null
          provider: string | null
          status: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          gb_total?: number | null
          gb_used?: number | null
          id?: string
          line_type?: string
          minutes_total?: number | null
          minutes_used?: number | null
          notes?: string | null
          number: string
          package_id?: string | null
          parent_line_id?: string | null
          provider?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          gb_total?: number | null
          gb_used?: number | null
          id?: string
          line_type?: string
          minutes_total?: number | null
          minutes_used?: number | null
          notes?: string | null
          number?: string
          package_id?: string | null
          parent_line_id?: string | null
          provider?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lines_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lines_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lines_parent_line_id_fkey"
            columns: ["parent_line_id"]
            isOneToOne: false
            referencedRelation: "lines"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          is_read: boolean
          message: string | null
          title: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_read?: boolean
          message?: string | null
          title: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_read?: boolean
          message?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          cost_price: number
          created_at: string
          description: string | null
          duration_days: number
          gb: number | null
          id: string
          is_public: boolean
          minutes: number | null
          name: string
          provider: string
          selling_price: number
          service_type: string
          status: string
        }
        Insert: {
          cost_price?: number
          created_at?: string
          description?: string | null
          duration_days?: number
          gb?: number | null
          id?: string
          is_public?: boolean
          minutes?: number | null
          name: string
          provider: string
          selling_price?: number
          service_type?: string
          status?: string
        }
        Update: {
          cost_price?: number
          created_at?: string
          description?: string | null
          duration_days?: number
          gb?: number | null
          id?: string
          is_public?: boolean
          minutes?: number | null
          name?: string
          provider?: string
          selling_price?: number
          service_type?: string
          status?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          customer_id: string
          id: string
          invoice_id: string | null
          method: string
          receipt_path: string | null
          reference: string | null
          status: string
          verified_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          customer_id: string
          id?: string
          invoice_id?: string | null
          method?: string
          receipt_path?: string | null
          reference?: string | null
          status?: string
          verified_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          customer_id?: string
          id?: string
          invoice_id?: string | null
          method?: string
          receipt_path?: string | null
          reference?: string | null
          status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      registration_requests: {
        Row: {
          address: string | null
          admin_note: string | null
          alt_phone: string | null
          created_at: string
          email: string | null
          full_name: string
          governorate: string | null
          id: string
          national_id: string | null
          package_id: string | null
          phone: string
          processed_at: string | null
          segment: string | null
          status: string
        }
        Insert: {
          address?: string | null
          admin_note?: string | null
          alt_phone?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          governorate?: string | null
          id?: string
          national_id?: string | null
          package_id?: string | null
          phone: string
          processed_at?: string | null
          segment?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          admin_note?: string | null
          alt_phone?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          governorate?: string | null
          id?: string
          national_id?: string | null
          package_id?: string | null
          phone?: string
          processed_at?: string | null
          segment?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_requests_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          admin_response: string | null
          created_at: string
          customer_id: string
          details: string | null
          id: string
          kind: string
          line_id: string | null
          processed_at: string | null
          requested_package_id: string | null
          status: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          customer_id: string
          details?: string | null
          id?: string
          kind: string
          line_id?: string | null
          processed_at?: string | null
          requested_package_id?: string | null
          status?: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          customer_id?: string
          details?: string | null
          id?: string
          kind?: string
          line_id?: string | null
          processed_at?: string | null
          requested_package_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_line_id_fkey"
            columns: ["line_id"]
            isOneToOne: false
            referencedRelation: "lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_requested_package_id_fkey"
            columns: ["requested_package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cost_price: number | null
          created_at: string
          customer_id: string
          id: string
          line_id: string | null
          package_id: string | null
          package_name: string | null
          renewal_date: string | null
          selling_price: number | null
          start_date: string
          status: string
        }
        Insert: {
          cost_price?: number | null
          created_at?: string
          customer_id: string
          id?: string
          line_id?: string | null
          package_id?: string | null
          package_name?: string | null
          renewal_date?: string | null
          selling_price?: number | null
          start_date?: string
          status?: string
        }
        Update: {
          cost_price?: number | null
          created_at?: string
          customer_id?: string
          id?: string
          line_id?: string | null
          package_id?: string | null
          package_name?: string | null
          renewal_date?: string | null
          selling_price?: number | null
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_line_id_fkey"
            columns: ["line_id"]
            isOneToOne: false
            referencedRelation: "lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      my_customer_id: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin" | "customer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "customer"],
    },
  },
} as const
