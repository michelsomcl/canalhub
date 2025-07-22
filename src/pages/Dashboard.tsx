import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { IndicatorCard } from "@/components/dashboard/IndicatorCard";
import { IndicatorChart } from "@/components/charts/IndicatorChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Company, FinancialIndicator } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const selectedCompanyInfo = companies.find(c => c.id === selectedCompany);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Company Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-primary">Dashboard Financeiro</h1>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.ticker} - {company.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedCompanyInfo && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">{selectedCompanyInfo.nome}</h2>
                    <p className="text-muted-foreground">Ticker: {selectedCompanyInfo.ticker}</p>
                    <a 
                      href={selectedCompanyInfo.link_ri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Link do RI
                    </a>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Dados
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {latestData && (
          <>
            {/* Main Indicators Dashboard */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-primary mb-4">
                Principais Indicadores - {latestData.quarter}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <IndicatorCard
                  title="Receitas de Bens e Serviços"
                  value={latestData.receitas_bens_servicos || 0}
                  unit="currency"
                  trend="up"
                />
                <IndicatorCard
                  title="Lucro Líquido"
                  value={latestData.lucro_liquido_apos_impostos || 0}
                  unit="currency"
                  trend="up"
                />
                <IndicatorCard
                  title="EBITDA"
                  value={latestData.ebitda || 0}
                  unit="currency"
                  trend="up"
                />
                <IndicatorCard
                  title="Margem EBITDA"
                  value={latestData.margem_ebitda_percent || 0}
                  unit="percentage"
                  trend="up"
                />
                <IndicatorCard
                  title="ROE"
                  value={latestData.roe || 0}
                  unit="percentage"
                  trend="up"
                />
                <IndicatorCard
                  title="Liquidez Corrente"
                  value={latestData.liquidez_corrente || 0}
                  unit="ratio"
                  trend="up"
                />
              </div>
            </div>

            {/* Historical Charts */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-primary">Evolução por Trimestre</h3>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <IndicatorChart
                  title="Receitas de Bens e Serviços"
                  data={getChartData('receitas_bens_servicos')}
                  unit="currency"
                />
                <IndicatorChart
                  title="Lucro Líquido após Impostos"
                  data={getChartData('lucro_liquido_apos_impostos')}
                  unit="currency"
                />
                <IndicatorChart
                  title="EBITDA"
                  data={getChartData('ebitda')}
                  unit="currency"
                />
                <IndicatorChart
                  title="Margem EBITDA %"
                  data={getChartData('margem_ebitda_percent')}
                  unit="percentage"
                />
                <IndicatorChart
                  title="ROE"
                  data={getChartData('roe')}
                  unit="percentage"
                />
                <IndicatorChart
                  title="Liquidez Corrente"
                  data={getChartData('liquidez_corrente')}
                  unit="ratio"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}