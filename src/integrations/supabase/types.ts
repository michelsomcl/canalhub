export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          id: string
          link_ri: string | null
          nome: string
          ticker: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_ri?: string | null
          nome: string
          ticker: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          link_ri?: string | null
          nome?: string
          ticker?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_indicators: {
        Row: {
          caixa_equivalentes_caixa: number | null
          capital_giro: number | null
          company_id: string
          created_at: string
          custo_receita_operacional: number | null
          despesas_operacionais_total: number | null
          dividend_yield: number | null
          ebit: number | null
          ebitda: number | null
          endividamento_total: number | null
          fluxo_caixa_liquido_atividades_operacionais: number | null
          id: string
          liquidez_corrente: number | null
          liquidez_geral: number | null
          lucro_liquido_apos_impostos: number | null
          lucro_operacional_antes_receita_despesa_nao_recorrente: number | null
          lucro_por_acao: number | null
          margem_ebitda_percent: number | null
          margem_liquida_percent: number | null
          margem_lucro_bruto_percent: number | null
          margem_operacional_percent: number | null
          percentual_divida_total_ativo_total: number | null
          quarter: string
          quarter_number: number
          receitas_bens_servicos: number | null
          roa: number | null
          roe: number | null
          roic: number | null
          updated_at: string
          variacao_liquida_caixa_total: number | null
          year: number
        }
        Insert: {
          caixa_equivalentes_caixa?: number | null
          capital_giro?: number | null
          company_id: string
          created_at?: string
          custo_receita_operacional?: number | null
          despesas_operacionais_total?: number | null
          dividend_yield?: number | null
          ebit?: number | null
          ebitda?: number | null
          endividamento_total?: number | null
          fluxo_caixa_liquido_atividades_operacionais?: number | null
          id?: string
          liquidez_corrente?: number | null
          liquidez_geral?: number | null
          lucro_liquido_apos_impostos?: number | null
          lucro_operacional_antes_receita_despesa_nao_recorrente?: number | null
          lucro_por_acao?: number | null
          margem_ebitda_percent?: number | null
          margem_liquida_percent?: number | null
          margem_lucro_bruto_percent?: number | null
          margem_operacional_percent?: number | null
          percentual_divida_total_ativo_total?: number | null
          quarter: string
          quarter_number: number
          receitas_bens_servicos?: number | null
          roa?: number | null
          roe?: number | null
          roic?: number | null
          updated_at?: string
          variacao_liquida_caixa_total?: number | null
          year: number
        }
        Update: {
          caixa_equivalentes_caixa?: number | null
          capital_giro?: number | null
          company_id?: string
          created_at?: string
          custo_receita_operacional?: number | null
          despesas_operacionais_total?: number | null
          dividend_yield?: number | null
          ebit?: number | null
          ebitda?: number | null
          endividamento_total?: number | null
          fluxo_caixa_liquido_atividades_operacionais?: number | null
          id?: string
          liquidez_corrente?: number | null
          liquidez_geral?: number | null
          lucro_liquido_apos_impostos?: number | null
          lucro_operacional_antes_receita_despesa_nao_recorrente?: number | null
          lucro_por_acao?: number | null
          margem_ebitda_percent?: number | null
          margem_liquida_percent?: number | null
          margem_lucro_bruto_percent?: number | null
          margem_operacional_percent?: number | null
          percentual_divida_total_ativo_total?: number | null
          quarter?: string
          quarter_number?: number
          receitas_bens_servicos?: number | null
          roa?: number | null
          roe?: number | null
          roic?: number | null
          updated_at?: string
          variacao_liquida_caixa_total?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_indicators_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      indicator_definitions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          field_name: string
          id: string
          name: string
          sql_column: string
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          field_name: string
          id?: string
          name: string
          sql_column: string
          unit: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          field_name?: string
          id?: string
          name?: string
          sql_column?: string
          unit?: string
          updated_at?: string
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
