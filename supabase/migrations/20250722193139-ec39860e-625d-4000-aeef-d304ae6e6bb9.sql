-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  ticker TEXT NOT NULL UNIQUE,
  link_ri TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indicator definitions table
CREATE TABLE public.indicator_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  field_name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  description TEXT,
  sql_column TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial indicators table
CREATE TABLE public.financial_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  quarter TEXT NOT NULL, -- Format: "2024-Q1"
  year INTEGER NOT NULL,
  quarter_number INTEGER NOT NULL CHECK (quarter_number BETWEEN 1 AND 4),
  
  -- Revenue indicators
  receitas_bens_servicos DECIMAL(15,2),
  custo_receita_operacional DECIMAL(15,2),
  despesas_operacionais_total DECIMAL(15,2),
  lucro_operacional_antes_receita_despesa_nao_recorrente DECIMAL(15,2),
  lucro_liquido_apos_impostos DECIMAL(15,2),
  lucro_por_acao DECIMAL(10,4),
  
  -- Cash flow indicators
  caixa_equivalentes_caixa DECIMAL(15,2),
  fluxo_caixa_liquido_atividades_operacionais DECIMAL(15,2),
  variacao_liquida_caixa_total DECIMAL(15,2),
  capital_giro DECIMAL(15,2),
  
  -- Debt indicators
  endividamento_total DECIMAL(15,2),
  percentual_divida_total_ativo_total DECIMAL(10,4),
  
  -- Liquidity indicators
  liquidez_geral DECIMAL(10,4),
  liquidez_corrente DECIMAL(10,4),
  
  -- Profitability indicators
  ebit DECIMAL(15,2),
  ebitda DECIMAL(15,2),
  margem_ebitda_percent DECIMAL(10,4),
  margem_lucro_bruto_percent DECIMAL(10,4),
  margem_operacional_percent DECIMAL(10,4),
  margem_liquida_percent DECIMAL(10,4),
  
  -- Returns indicators
  roic DECIMAL(10,4),
  roe DECIMAL(10,4),
  roa DECIMAL(10,4),
  dividend_yield DECIMAL(10,4),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(company_id, quarter)
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicator_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_indicators ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public financial data app)
CREATE POLICY "Companies are viewable by everyone" 
ON public.companies FOR SELECT USING (true);

CREATE POLICY "Companies can be inserted by everyone" 
ON public.companies FOR INSERT WITH CHECK (true);

CREATE POLICY "Companies can be updated by everyone" 
ON public.companies FOR UPDATE USING (true);

CREATE POLICY "Companies can be deleted by everyone" 
ON public.companies FOR DELETE USING (true);

CREATE POLICY "Indicator definitions are viewable by everyone" 
ON public.indicator_definitions FOR SELECT USING (true);

CREATE POLICY "Indicator definitions can be inserted by everyone" 
ON public.indicator_definitions FOR INSERT WITH CHECK (true);

CREATE POLICY "Indicator definitions can be updated by everyone" 
ON public.indicator_definitions FOR UPDATE USING (true);

CREATE POLICY "Indicator definitions can be deleted by everyone" 
ON public.indicator_definitions FOR DELETE USING (true);

CREATE POLICY "Financial indicators are viewable by everyone" 
ON public.financial_indicators FOR SELECT USING (true);

CREATE POLICY "Financial indicators can be inserted by everyone" 
ON public.financial_indicators FOR INSERT WITH CHECK (true);

CREATE POLICY "Financial indicators can be updated by everyone" 
ON public.financial_indicators FOR UPDATE USING (true);

CREATE POLICY "Financial indicators can be deleted by everyone" 
ON public.financial_indicators FOR DELETE USING (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_indicator_definitions_updated_at
BEFORE UPDATE ON public.indicator_definitions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_indicators_updated_at
BEFORE UPDATE ON public.financial_indicators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default indicator definitions
INSERT INTO public.indicator_definitions (name, field_name, category, unit, description, sql_column) VALUES
('Receitas de Bens e Serviços', 'receitas_bens_servicos', 'revenue', 'currency', 'Receita total da empresa com vendas de bens e serviços', 'receitas_bens_servicos DECIMAL(15,2)'),
('Custo da Receita Operacional', 'custo_receita_operacional', 'revenue', 'currency', 'Custos diretos relacionados às receitas operacionais', 'custo_receita_operacional DECIMAL(15,2)'),
('Despesas Operacionais - Total', 'despesas_operacionais_total', 'revenue', 'currency', 'Total das despesas relacionadas às operações da empresa', 'despesas_operacionais_total DECIMAL(15,2)'),
('Lucro Operacional antes da Receita/Despesa Não Recorrente', 'lucro_operacional_antes_receita_despesa_nao_recorrente', 'profitability', 'currency', 'Lucro operacional excluindo itens não recorrentes', 'lucro_operacional_antes_receita_despesa_nao_recorrente DECIMAL(15,2)'),
('Lucro Líquido após Impostos', 'lucro_liquido_apos_impostos', 'profitability', 'currency', 'Lucro final após todos os impostos e deduções', 'lucro_liquido_apos_impostos DECIMAL(15,2)'),
('Lucro por Ação', 'lucro_por_acao', 'profitability', 'ratio', 'Lucro líquido dividido pelo número de ações em circulação', 'lucro_por_acao DECIMAL(10,4)'),
('Caixa e Equivalentes de Caixa', 'caixa_equivalentes_caixa', 'cash_flow', 'currency', 'Total de caixa e investimentos de alta liquidez', 'caixa_equivalentes_caixa DECIMAL(15,2)'),
('Fluxo de caixa líquido das atividades operacionais', 'fluxo_caixa_liquido_atividades_operacionais', 'cash_flow', 'currency', 'Caixa gerado pelas operações principais da empresa', 'fluxo_caixa_liquido_atividades_operacionais DECIMAL(15,2)'),
('Variação líquida de Caixa Total', 'variacao_liquida_caixa_total', 'cash_flow', 'currency', 'Variação total do caixa no período', 'variacao_liquida_caixa_total DECIMAL(15,2)'),
('Capital de Giro', 'capital_giro', 'cash_flow', 'currency', 'Ativo circulante menos passivo circulante', 'capital_giro DECIMAL(15,2)'),
('Endividamento total', 'endividamento_total', 'debt', 'currency', 'Total das dívidas da empresa', 'endividamento_total DECIMAL(15,2)'),
('Percentual da dívida total do ativo total', 'percentual_divida_total_ativo_total', 'debt', 'percentage', 'Proporção da dívida em relação aos ativos totais', 'percentual_divida_total_ativo_total DECIMAL(10,4)'),
('Liquidez Geral', 'liquidez_geral', 'liquidity', 'ratio', 'Capacidade de pagamento de todas as obrigações', 'liquidez_geral DECIMAL(10,4)'),
('Liquidez Corrente', 'liquidez_corrente', 'liquidity', 'ratio', 'Capacidade de pagamento das obrigações de curto prazo', 'liquidez_corrente DECIMAL(10,4)'),
('EBIT', 'ebit', 'profitability', 'currency', 'Lucro antes de juros e impostos', 'ebit DECIMAL(15,2)'),
('EBITDA', 'ebitda', 'profitability', 'currency', 'Lucro antes de juros, impostos, depreciação e amortização', 'ebitda DECIMAL(15,2)'),
('Margem EBITDA %', 'margem_ebitda_percent', 'profitability', 'percentage', 'EBITDA dividido pela receita líquida', 'margem_ebitda_percent DECIMAL(10,4)'),
('Margem de lucro bruto %', 'margem_lucro_bruto_percent', 'profitability', 'percentage', 'Lucro bruto dividido pela receita líquida', 'margem_lucro_bruto_percent DECIMAL(10,4)'),
('Margem operacional %', 'margem_operacional_percent', 'profitability', 'percentage', 'Lucro operacional dividido pela receita líquida', 'margem_operacional_percent DECIMAL(10,4)'),
('Margem líquida %', 'margem_liquida_percent', 'profitability', 'percentage', 'Lucro líquido dividido pela receita líquida', 'margem_liquida_percent DECIMAL(10,4)'),
('ROIC', 'roic', 'returns', 'percentage', 'Retorno sobre o capital investido', 'roic DECIMAL(10,4)'),
('ROE', 'roe', 'returns', 'percentage', 'Retorno sobre o patrimônio líquido', 'roe DECIMAL(10,4)'),
('ROA', 'roa', 'returns', 'percentage', 'Retorno sobre os ativos', 'roa DECIMAL(10,4)'),
('Dividend Yield', 'dividend_yield', 'returns', 'percentage', 'Dividendos por ação dividido pelo preço da ação', 'dividend_yield DECIMAL(10,4)');