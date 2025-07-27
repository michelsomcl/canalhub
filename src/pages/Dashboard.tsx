import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { IndicatorCard } from "@/components/dashboard/IndicatorCard";
import { IndicatorChart } from "@/components/charts/IndicatorChart";
import { ComparisonCard } from "@/components/dashboard/ComparisonCard";
import { FinancialDataDialog } from "@/components/dashboard/FinancialDataDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Search, TrendingUp, ArrowRight } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Company, FinancialIndicator } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import financialHero from "@/assets/financial-hero.jpg";

// Mock data - would come from Supabase
const mockCompanies: Company[] = [
  { id: "1", nome: "ROMI S.A.", ticker: "ROMI3", link_ri: "https://ri.romi.com" },
  { id: "2", nome: "Petrobras", ticker: "PETR4", link_ri: "https://ri.petrobras.com" },
];

const mockData: FinancialIndicator[] = [
  {
    id: "1",
    company_id: "1",
    quarter: "2024-T1",
    year: 2024,
    quarter_number: 1,
    receitas_bens_servicos: 145000000,
    lucro_liquido_apos_impostos: 15000000,
    ebitda: 25000000,
    margem_ebitda_percent: 17.24,
    roe: 12.5,
    liquidez_corrente: 2.17,
  },
  {
    id: "2",
    company_id: "1",
    quarter: "2023-T4",
    year: 2023,
    quarter_number: 4,
    receitas_bens_servicos: 132000000,
    lucro_liquido_apos_impostos: 12000000,
    ebitda: 22000000,
    margem_ebitda_percent: 16.67,
    roe: 11.2,
    liquidez_corrente: 2.05,
  },
  {
    id: "3",
    company_id: "1",
    quarter: "2023-T3",
    year: 2023,
    quarter_number: 3,
    receitas_bens_servicos: 128000000,
    lucro_liquido_apos_impostos: 10000000,
    ebitda: 20000000,
    margem_ebitda_percent: 15.63,
    roe: 10.8,
    liquidez_corrente: 1.98,
  },
  {
    id: "4",
    company_id: "1",
    quarter: "2023-T2",
    year: 2023,
    quarter_number: 2,
    receitas_bens_servicos: 118000000,
    lucro_liquido_apos_impostos: 8000000,
    ebitda: 18000000,
    margem_ebitda_percent: 15.25,
    roe: 9.5,
    liquidez_corrente: 1.85,
  },
];

export default function Dashboard() {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyData, setCompanyData] = useState<FinancialIndicator[]>([]);
  const [latestData, setLatestData] = useState<FinancialIndicator | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { toast } = useToast();

  // Load companies from Supabase
  useEffect(() => {
    loadCompanies();
  }, []);

  // Load financial data when company changes
  useEffect(() => {
    if (selectedCompany) {
      loadFinancialData(selectedCompany);
    }
  }, [selectedCompany]);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('nome');

      if (error) throw error;
      
      setCompanies(data || []);
      if (data && data.length > 0) {
        setSelectedCompany(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar empresas do banco de dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFinancialData = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('financial_indicators')
        .select('*')
        .eq('company_id', companyId)
        .order('year', { ascending: false })
        .order('quarter_number', { ascending: false });

      if (error) throw error;
      
      setCompanyData(data || []);
      setLatestData(data && data.length > 0 ? data[0] : null);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros da empresa.",
        variant: "destructive"
      });
    }
  };

  const getChartData = (field: keyof FinancialIndicator) => {
    return companyData
      .filter(d => d[field] !== undefined)
      .map(d => ({
        quarter: d.quarter,
        value: d[field] as number,
      }))
      .reverse();
  };

  const getComparison = (current: number | undefined, field: keyof FinancialIndicator) => {
    if (!current || !companyData.length) return null;
    
    const sortedData = [...companyData].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.quarter_number - a.quarter_number;
    });
    
    const currentIndex = sortedData.findIndex(d => d[field] === current);
    if (currentIndex === -1) return null;
    
    const currentData = sortedData[currentIndex];
    const previousQuarter = sortedData[currentIndex + 1];
    const sameQuarterLastYear = sortedData.find(d => 
      d.year === currentData.year - 1 && 
      d.quarter_number === currentData.quarter_number
    );
    
    return {
      previousQuarter: previousQuarter?.[field] as number,
      sameQuarterLastYear: sameQuarterLastYear?.[field] as number,
    };
  };

  const getIndicatorUnit = (field: keyof FinancialIndicator): 'currency' | 'percentage' | 'ratio' => {
    const percentageFields = ['margem_ebitda_percent', 'margem_lucro_bruto_percent', 'margem_operacional_percent', 'margem_liquida_percent', 'roe', 'roa', 'roic', 'dividend_yield'];
    const ratioFields = ['liquidez_corrente', 'liquidez_geral'];
    
    if (percentageFields.includes(field as string)) return 'percentage';
    if (ratioFields.includes(field as string)) return 'ratio';
    return 'currency';
  };

  const getIndicatorTitle = (field: keyof FinancialIndicator): string => {
    const titles: Record<string, string> = {
      receitas_bens_servicos: 'Receitas de Bens e Serviços',
      custo_receita_operacional: 'Custo da Receita Operacional',
      despesas_operacionais_total: 'Despesas Operacionais - Total',
      lucro_operacional_antes_receita_despesa_nao_recorrente: 'Lucro Operacional antes da Receita/Despesa Não Recorrente',
      lucro_liquido_apos_impostos: 'Lucro Líquido após Impostos',
      caixa_equivalentes_caixa: 'Caixa e Equivalentes de Caixa',
      fluxo_caixa_liquido_atividades_operacionais: 'Fluxo de caixa líquido das atividades operacionais',
      variacao_liquida_caixa_total: 'Variação líquida de Caixa Total',
      capital_giro: 'Capital de Giro',
      endividamento_total: 'Endividamento total',
      percentual_divida_total_ativo_total: 'Percentual da dívida total do ativo total',
      liquidez_geral: 'Liquidez Geral',
      liquidez_corrente: 'Liquidez Corrente',
      ebit: 'EBIT',
      ebitda: 'EBITDA',
      margem_ebitda_percent: 'Margem EBITDA %',
      margem_lucro_bruto_percent: 'Margem de lucro bruto %',
      margem_operacional_percent: 'Margem operacional %',
      margem_liquida_percent: 'Margem líquida %',
      roic: 'ROIC',
      roe: 'ROE',
      roa: 'ROA',
      dividend_yield: 'Dividend Yield',
    };
    return titles[field as string] || field as string;
  };

  // Function to format values in millions
  const formatInMillions = (value: number) => {
    if (value === 0) return 'R$ 0';
    const millions = value / 1000000;
    return `R$ ${millions.toFixed(1)} milhões`;
  };

  const selectedCompanyInfo = companies.find(c => c.id === selectedCompany);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={financialHero} 
          alt="Financial dashboard" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 max-w-4xl">
            Acompanhe os resultados trimestrais das principais empresas da Bolsa
          </h1>
          <div className="w-full max-w-2xl mt-8">
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={searchOpen}
                  className="w-full h-14 text-lg justify-between bg-background/95 backdrop-blur-sm border-2 hover:bg-background/90"
                  size="lg"
                >
Busque pela empresa ou Ticker
                  <Search className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full max-w-2xl p-0">
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Busque pela empresa ou Ticker..." 
                    value={searchValue}
                    onValueChange={setSearchValue}
                    className="h-12 text-lg"
                  />
                  <CommandList>
                    <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                    <CommandGroup>
                      {companies
                        .filter(company => {
                          if (!searchValue) return true;
                          const searchLower = searchValue.toLowerCase();
                          return company.nome.toLowerCase().includes(searchLower) ||
                                 company.ticker.toLowerCase().includes(searchLower);
                        })
                        .map(company => (
                        <CommandItem
                          key={company.id}
                          value={`${company.ticker}-${company.nome}`}
                          onSelect={() => {
                            setSelectedCompany(company.id);
                            setSearchOpen(false);
                            setSearchValue("");
                          }}
                          className="py-3"
                        >
                          <span className="font-medium text-lg">{company.ticker}</span>
                          <span className="ml-2 text-muted-foreground">- {company.nome}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Selected Company Section */}
        <div className="mb-8">
          
          {selectedCompanyInfo && latestData && (
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl lg:text-3xl font-bold text-primary">{selectedCompanyInfo.nome}</h2>
                    </div>
                    <p className="text-lg text-muted-foreground mb-2">Ticker: <span className="font-semibold text-primary">{selectedCompanyInfo.ticker}</span></p>
                    <div className="bg-accent/10 rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-semibold text-primary mb-2">Último Resultado Disponível</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center sm:text-left">
                          <p className="text-sm text-muted-foreground">Trimestre</p>
                          <p className="text-xl font-bold text-primary">{latestData.quarter}</p>
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-sm text-muted-foreground">Receitas</p>
                          <p className="text-xl font-bold text-primary">
                            {formatInMillions(latestData.receitas_bens_servicos || 0)}
                          </p>
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                          <p className="text-xl font-bold text-primary">
                            {formatInMillions(latestData.lucro_liquido_apos_impostos || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <a 
                      href={selectedCompanyInfo.link_ri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
                    >
                      Link do RI <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Dados
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Data Management Actions */}
        <div className="mb-8 flex gap-4">
          <FinancialDataDialog
            companyId={selectedCompany}
            onSuccess={() => loadFinancialData(selectedCompany)}
            mode="create"
          />
          {latestData && (
            <>
              <FinancialDataDialog
                companyId={selectedCompany}
                data={latestData}
                onSuccess={() => loadFinancialData(selectedCompany)}
                mode="edit"
              />
              <FinancialDataDialog
                companyId={selectedCompany}
                data={latestData}
                onSuccess={() => loadFinancialData(selectedCompany)}
                mode="delete"
              />
            </>
          )}
        </div>

        {latestData && (
          <>
            {/* All Financial Indicators with Charts and Comparison Cards */}
            <div className="space-y-8">
              <h3 className="text-xl lg:text-2xl font-semibold text-primary">Análise Detalhada - {latestData.quarter}</h3>
              
              {/* Revenue and Operational */}
              <div className="space-y-8">
                <h4 className="text-lg font-medium text-primary">Receitas e Operacionais</h4>
                {['receitas_bens_servicos', 'custo_receita_operacional', 'despesas_operacionais_total', 'lucro_operacional_antes_receita_despesa_nao_recorrente', 'lucro_liquido_apos_impostos'].map((field) => {
                  const fieldKey = field as keyof FinancialIndicator;
                  const value = latestData[fieldKey] as number;
                  if (value === undefined || value === null) return null;
                  
                  const comparison = getComparison(value, fieldKey);
                  return (
                    <div key={field} className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
                      <div className="xl:col-span-3">
                        <IndicatorChart
                          title={getIndicatorTitle(fieldKey)}
                          data={getChartData(fieldKey)}
                          unit={getIndicatorUnit(fieldKey)}
                        />
                      </div>
                      <div className="xl:col-span-1">
                        <ComparisonCard
                          title={getIndicatorTitle(fieldKey)}
                          current={value || 0}
                          previousQuarter={comparison?.previousQuarter}
                          sameQuarterLastYear={comparison?.sameQuarterLastYear}
                          unit={getIndicatorUnit(fieldKey)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cash Flow */}
              <div className="space-y-8">
                <h4 className="text-lg font-medium text-primary">Fluxo de Caixa</h4>
                {['caixa_equivalentes_caixa', 'fluxo_caixa_liquido_atividades_operacionais', 'variacao_liquida_caixa_total'].map((field) => {
                  const fieldKey = field as keyof FinancialIndicator;
                  const value = latestData[fieldKey] as number;
                  if (value === undefined || value === null) return null;
                  
                  const comparison = getComparison(value, fieldKey);
                  return (
                    <div key={field} className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
                      <div className="xl:col-span-3">
                        <IndicatorChart
                          title={getIndicatorTitle(fieldKey)}
                          data={getChartData(fieldKey)}
                          unit={getIndicatorUnit(fieldKey)}
                        />
                      </div>
                      <div className="xl:col-span-1">
                        <ComparisonCard
                          title={getIndicatorTitle(fieldKey)}
                          current={value || 0}
                          previousQuarter={comparison?.previousQuarter}
                          sameQuarterLastYear={comparison?.sameQuarterLastYear}
                          unit={getIndicatorUnit(fieldKey)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Working Capital and Debt */}
              <div className="space-y-8">
                <h4 className="text-lg font-medium text-primary">Capital de Giro e Endividamento</h4>
                {['capital_giro', 'endividamento_total', 'percentual_divida_total_ativo_total'].map((field) => {
                  const fieldKey = field as keyof FinancialIndicator;
                  const value = latestData[fieldKey] as number;
                  if (value === undefined || value === null) return null;
                  
                  const comparison = getComparison(value, fieldKey);
                  return (
                    <div key={field} className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
                      <div className="xl:col-span-3">
                        <IndicatorChart
                          title={getIndicatorTitle(fieldKey)}
                          data={getChartData(fieldKey)}
                          unit={getIndicatorUnit(fieldKey)}
                        />
                      </div>
                      <div className="xl:col-span-1">
                        <ComparisonCard
                          title={getIndicatorTitle(fieldKey)}
                          current={value || 0}
                          previousQuarter={comparison?.previousQuarter}
                          sameQuarterLastYear={comparison?.sameQuarterLastYear}
                          unit={getIndicatorUnit(fieldKey)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Liquidity */}
              <div className="space-y-8">
                <h4 className="text-lg font-medium text-primary">Liquidez</h4>
                {['liquidez_geral', 'liquidez_corrente'].map((field) => {
                  const fieldKey = field as keyof FinancialIndicator;
                  const value = latestData[fieldKey] as number;
                  if (value === undefined || value === null) return null;
                  
                  const comparison = getComparison(value, fieldKey);
                  return (
                    <div key={field} className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
                      <div className="xl:col-span-3">
                        <IndicatorChart
                          title={getIndicatorTitle(fieldKey)}
                          data={getChartData(fieldKey)}
                          unit={getIndicatorUnit(fieldKey)}
                        />
                      </div>
                      <div className="xl:col-span-1">
                        <ComparisonCard
                          title={getIndicatorTitle(fieldKey)}
                          current={value || 0}
                          previousQuarter={comparison?.previousQuarter}
                          sameQuarterLastYear={comparison?.sameQuarterLastYear}
                          unit={getIndicatorUnit(fieldKey)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Profitability */}
              <div className="space-y-8">
                <h4 className="text-lg font-medium text-primary">Rentabilidade</h4>
                {['ebit', 'ebitda', 'margem_ebitda_percent', 'margem_lucro_bruto_percent', 'margem_operacional_percent', 'margem_liquida_percent'].map((field) => {
                  const fieldKey = field as keyof FinancialIndicator;
                  const value = latestData[fieldKey] as number;
                  if (value === undefined || value === null) return null;
                  
                  const comparison = getComparison(value, fieldKey);
                  return (
                    <div key={field} className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
                      <div className="xl:col-span-3">
                        <IndicatorChart
                          title={getIndicatorTitle(fieldKey)}
                          data={getChartData(fieldKey)}
                          unit={getIndicatorUnit(fieldKey)}
                        />
                      </div>
                      <div className="xl:col-span-1">
                        <ComparisonCard
                          title={getIndicatorTitle(fieldKey)}
                          current={value || 0}
                          previousQuarter={comparison?.previousQuarter}
                          sameQuarterLastYear={comparison?.sameQuarterLastYear}
                          unit={getIndicatorUnit(fieldKey)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Returns */}
              <div className="space-y-8">
                <h4 className="text-lg font-medium text-primary">Retornos</h4>
                {['roic', 'roe', 'roa', 'dividend_yield'].map((field) => {
                  const fieldKey = field as keyof FinancialIndicator;
                  const value = latestData[fieldKey] as number;
                  if (value === undefined || value === null) return null;
                  
                  const comparison = getComparison(value, fieldKey);
                  return (
                    <div key={field} className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
                      <div className="xl:col-span-3">
                        <IndicatorChart
                          title={getIndicatorTitle(fieldKey)}
                          data={getChartData(fieldKey)}
                          unit={getIndicatorUnit(fieldKey)}
                        />
                      </div>
                      <div className="xl:col-span-1">
                        <ComparisonCard
                          title={getIndicatorTitle(fieldKey)}
                          current={value || 0}
                          previousQuarter={comparison?.previousQuarter}
                          sameQuarterLastYear={comparison?.sameQuarterLastYear}
                          unit={getIndicatorUnit(fieldKey)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}