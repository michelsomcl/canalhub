export interface Company {
  id: string;
  nome: string;
  ticker: string;
  link_ri: string;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialIndicator {
  id: string;
  company_id: string;
  quarter: string; // Format: YYYY-Q1, YYYY-Q2, etc.
  year: number;
  quarter_number: number;
  
  // Revenue and Operational
  receitas_bens_servicos?: number;
  custo_receita_operacional?: number;
  despesas_operacionais_total?: number;
  lucro_operacional_antes_receita_despesa_nao_recorrente?: number;
  lucro_liquido_apos_impostos?: number;
  lucro_por_acao?: number;
  
  // Cash Flow
  caixa_equivalentes_caixa?: number;
  fluxo_caixa_liquido_atividades_operacionais?: number;
  variacao_liquida_caixa_total?: number;
  
  // Working Capital and Debt
  capital_giro?: number;
  endividamento_total?: number;
  percentual_divida_total_ativo_total?: number;
  
  // Liquidity
  liquidez_geral?: number;
  liquidez_corrente?: number;
  
  // Profitability
  ebit?: number;
  ebitda?: number;
  margem_ebitda_percent?: number;
  margem_lucro_bruto_percent?: number;
  margem_operacional_percent?: number;
  margem_liquida_percent?: number;
  
  // Returns
  roic?: number;
  roe?: number;
  roa?: number;
  dividend_yield?: number;
}

export interface IndicatorDefinition {
  id: string;
  name: string;
  field_name: string;
  category: 'revenue' | 'cash_flow' | 'debt' | 'liquidity' | 'profitability' | 'returns';
  unit: 'currency' | 'percentage' | 'ratio';
  description: string;
  sql_column: string;
}