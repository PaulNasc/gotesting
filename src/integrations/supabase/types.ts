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
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_cases: {
        Row: {
          created_at: string
          description: string | null
          expected_result: string | null
          generated_by_ai: boolean
          id: string
          plan_id: string | null
          preconditions: string | null
          priority: string
          steps: Json
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expected_result?: string | null
          generated_by_ai?: boolean
          id?: string
          plan_id?: string | null
          preconditions?: string | null
          priority?: string
          steps?: Json
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expected_result?: string | null
          generated_by_ai?: boolean
          id?: string
          plan_id?: string | null
          preconditions?: string | null
          priority?: string
          steps?: Json
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_cases_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "test_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      test_executions: {
        Row: {
          actual_result: string | null
          case_id: string
          executed_at: string
          executed_by: string
          id: string
          notes: string | null
          plan_id: string
          status: string
          user_id: string
        }
        Insert: {
          actual_result?: string | null
          case_id: string
          executed_at?: string
          executed_by: string
          id?: string
          notes?: string | null
          plan_id: string
          status?: string
          user_id: string
        }
        Update: {
          actual_result?: string | null
          case_id?: string
          executed_at?: string
          executed_by?: string
          id?: string
          notes?: string | null
          plan_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_executions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "test_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_executions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "test_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      test_plans: {
        Row: {
          approach: string | null
          created_at: string
          criteria: string | null
          description: string | null
          generated_by_ai: boolean
          id: string
          objective: string | null
          resources: string | null
          risks: string | null
          schedule: string | null
          scope: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approach?: string | null
          created_at?: string
          criteria?: string | null
          description?: string | null
          generated_by_ai?: boolean
          id?: string
          objective?: string | null
          resources?: string | null
          risks?: string | null
          schedule?: string | null
          scope?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approach?: string | null
          created_at?: string
          criteria?: string | null
          description?: string | null
          generated_by_ai?: boolean
          id?: string
          objective?: string | null
          resources?: string | null
          risks?: string | null
          schedule?: string | null
          scope?: string | null
          title?: string
          updated_at?: string
          user_id?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
