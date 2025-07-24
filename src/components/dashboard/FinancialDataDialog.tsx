import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Plus, Trash2 } from "lucide-react";
import { FinancialIndicator } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FinancialDataDialogProps {
  companyId: string;
  data?: FinancialIndicator;
  onSuccess: () => void;
  mode: 'create' | 'edit' | 'delete';
}

export function FinancialDataDialog({ companyId, data, onSuccess, mode }: FinancialDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<FinancialIndicator>>({
    company_id: companyId,
    year: data?.year || new Date().getFullYear(),
    quarter_number: data?.quarter_number || 1,
    quarter: data?.quarter || `${new Date().getFullYear()}-T1`,
    receitas_bens_servicos: data?.receitas_bens_servicos || 0,
    custo_receita_operacional: data?.custo_receita_operacional || 0,
    despesas_operacionais_total: data?.despesas_operacionais_total || 0,
    lucro_operacional_antes_receita_despesa_nao_recorrente: data?.lucro_operacional_antes_receita_despesa_nao_recorrente || 0,
    lucro_liquido_apos_impostos: data?.lucro_liquido_apos_impostos || 0,
    caixa_equivalentes_caixa: data?.caixa_equivalentes_caixa || 0,
    fluxo_caixa_liquido_atividades_operacionais: data?.fluxo_caixa_liquido_atividades_operacionais || 0,
    variacao_liquida_caixa_total: data?.variacao_liquida_caixa_total || 0,
    capital_giro: data?.capital_giro || 0,
    endividamento_total: data?.endividamento_total || 0,
    percentual_divida_total_ativo_total: data?.percentual_divida_total_ativo_total || 0,
    liquidez_geral: data?.liquidez_geral || 0,
    liquidez_corrente: data?.liquidez_corrente || 0,
    ebit: data?.ebit || 0,
    ebitda: data?.ebitda || 0,
    margem_ebitda_percent: data?.margem_ebitda_percent || 0,
    margem_lucro_bruto_percent: data?.margem_lucro_bruto_percent || 0,
    margem_operacional_percent: data?.margem_operacional_percent || 0,
    margem_liquida_percent: data?.margem_liquida_percent || 0,
    roic: data?.roic || 0,
    roe: data?.roe || 0,
    roa: data?.roa || 0,
    dividend_yield: data?.dividend_yield || 0,
  });

  const handleQuarterChange = (quarter: string) => {
    const [year, quarterStr] = quarter.split('-T');
    setFormData({
      ...formData,
      quarter,
      year: parseInt(year),
      quarter_number: parseInt(quarterStr),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'delete' && data) {
        const { error } = await supabase
          .from('financial_indicators')
          .delete()
          .eq('id', data.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Dados financeiros excluídos com sucesso.",
        });
      } else if (mode === 'edit' && data) {
        const { error } = await supabase
          .from('financial_indicators')
          .update(formData)
          .eq('id', data.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Dados financeiros atualizados com sucesso.",
        });
      } else if (mode === 'create') {
        const { error } = await supabase
          .from('financial_indicators')
          .insert([{
            ...formData,
            company_id: companyId,
            quarter: formData.quarter!,
            year: formData.year!,
            quarter_number: formData.quarter_number!,
          }]);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Dados financeiros criados com sucesso.",
        });
      }
      
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar dados financeiros.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getButtonContent = () => {
    switch (mode) {
      case 'create':
        return <><Plus className="h-4 w-4 mr-2" />Adicionar Dados</>;
      case 'edit':
        return <><Edit className="h-4 w-4 mr-2" />Editar</>;
      case 'delete':
        return <><Trash2 className="h-4 w-4 mr-2" />Excluir</>;
    }
  };

  const getDialogTitle = () => {
    switch (mode) {
      case 'create':
        return 'Adicionar Dados Financeiros';
      case 'edit':
        return 'Editar Dados Financeiros';
      case 'delete':
        return 'Excluir Dados Financeiros';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={mode === 'delete' ? 'destructive' : mode === 'create' ? 'default' : 'outline'} 
          size="sm"
        >
          {getButtonContent()}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        
        {mode === 'delete' ? (
          <div className="space-y-4">
            <p>Tem certeza que deseja excluir os dados financeiros do trimestre {data?.quarter}?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quarter">Trimestre</Label>
                <Select value={formData.quarter} onValueChange={handleQuarterChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025].map(year => 
                      [1, 2, 3, 4].map(quarter => (
                        <SelectItem key={`${year}-T${quarter}`} value={`${year}-T${quarter}`}>
                          {year} - T{quarter}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="receitas_bens_servicos">Receitas de Bens e Serviços</Label>
                <Input
                  id="receitas_bens_servicos"
                  type="number"
                  value={formData.receitas_bens_servicos || ''}
                  onChange={(e) => setFormData({...formData, receitas_bens_servicos: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="custo_receita_operacional">Custo Receita Operacional</Label>
                <Input
                  id="custo_receita_operacional"
                  type="number"
                  value={formData.custo_receita_operacional || ''}
                  onChange={(e) => setFormData({...formData, custo_receita_operacional: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="despesas_operacionais_total">Despesas Operacionais Total</Label>
                <Input
                  id="despesas_operacionais_total"
                  type="number"
                  value={formData.despesas_operacionais_total || ''}
                  onChange={(e) => setFormData({...formData, despesas_operacionais_total: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="lucro_operacional_antes_receita_despesa_nao_recorrente">Lucro Operacional</Label>
                <Input
                  id="lucro_operacional_antes_receita_despesa_nao_recorrente"
                  type="number"
                  value={formData.lucro_operacional_antes_receita_despesa_nao_recorrente || ''}
                  onChange={(e) => setFormData({...formData, lucro_operacional_antes_receita_despesa_nao_recorrente: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="lucro_liquido_apos_impostos">Lucro Líquido após Impostos</Label>
                <Input
                  id="lucro_liquido_apos_impostos"
                  type="number"
                  value={formData.lucro_liquido_apos_impostos || ''}
                  onChange={(e) => setFormData({...formData, lucro_liquido_apos_impostos: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="caixa_equivalentes_caixa">Caixa e Equivalentes</Label>
                <Input
                  id="caixa_equivalentes_caixa"
                  type="number"
                  value={formData.caixa_equivalentes_caixa || ''}
                  onChange={(e) => setFormData({...formData, caixa_equivalentes_caixa: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="fluxo_caixa_liquido_atividades_operacionais">Fluxo de Caixa Operacional</Label>
                <Input
                  id="fluxo_caixa_liquido_atividades_operacionais"
                  type="number"
                  value={formData.fluxo_caixa_liquido_atividades_operacionais || ''}
                  onChange={(e) => setFormData({...formData, fluxo_caixa_liquido_atividades_operacionais: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="variacao_liquida_caixa_total">Variação Líquida Caixa</Label>
                <Input
                  id="variacao_liquida_caixa_total"
                  type="number"
                  value={formData.variacao_liquida_caixa_total || ''}
                  onChange={(e) => setFormData({...formData, variacao_liquida_caixa_total: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="capital_giro">Capital de Giro</Label>
                <Input
                  id="capital_giro"
                  type="number"
                  value={formData.capital_giro || ''}
                  onChange={(e) => setFormData({...formData, capital_giro: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="endividamento_total">Endividamento Total</Label>
                <Input
                  id="endividamento_total"
                  type="number"
                  value={formData.endividamento_total || ''}
                  onChange={(e) => setFormData({...formData, endividamento_total: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="percentual_divida_total_ativo_total">% Dívida Total / Ativo Total</Label>
                <Input
                  id="percentual_divida_total_ativo_total"
                  type="number"
                  step="0.01"
                  value={formData.percentual_divida_total_ativo_total || ''}
                  onChange={(e) => setFormData({...formData, percentual_divida_total_ativo_total: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="liquidez_geral">Liquidez Geral</Label>
                <Input
                  id="liquidez_geral"
                  type="number"
                  step="0.01"
                  value={formData.liquidez_geral || ''}
                  onChange={(e) => setFormData({...formData, liquidez_geral: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="liquidez_corrente">Liquidez Corrente</Label>
                <Input
                  id="liquidez_corrente"
                  type="number"
                  step="0.01"
                  value={formData.liquidez_corrente || ''}
                  onChange={(e) => setFormData({...formData, liquidez_corrente: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="ebit">EBIT</Label>
                <Input
                  id="ebit"
                  type="number"
                  value={formData.ebit || ''}
                  onChange={(e) => setFormData({...formData, ebit: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="ebitda">EBITDA</Label>
                <Input
                  id="ebitda"
                  type="number"
                  value={formData.ebitda || ''}
                  onChange={(e) => setFormData({...formData, ebitda: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="margem_ebitda_percent">Margem EBITDA %</Label>
                <Input
                  id="margem_ebitda_percent"
                  type="number"
                  step="0.01"
                  value={formData.margem_ebitda_percent || ''}
                  onChange={(e) => setFormData({...formData, margem_ebitda_percent: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="margem_lucro_bruto_percent">Margem Lucro Bruto %</Label>
                <Input
                  id="margem_lucro_bruto_percent"
                  type="number"
                  step="0.01"
                  value={formData.margem_lucro_bruto_percent || ''}
                  onChange={(e) => setFormData({...formData, margem_lucro_bruto_percent: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="margem_operacional_percent">Margem Operacional %</Label>
                <Input
                  id="margem_operacional_percent"
                  type="number"
                  step="0.01"
                  value={formData.margem_operacional_percent || ''}
                  onChange={(e) => setFormData({...formData, margem_operacional_percent: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="margem_liquida_percent">Margem Líquida %</Label>
                <Input
                  id="margem_liquida_percent"
                  type="number"
                  step="0.01"
                  value={formData.margem_liquida_percent || ''}
                  onChange={(e) => setFormData({...formData, margem_liquida_percent: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="roic">ROIC</Label>
                <Input
                  id="roic"
                  type="number"
                  step="0.01"
                  value={formData.roic || ''}
                  onChange={(e) => setFormData({...formData, roic: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="roe">ROE</Label>
                <Input
                  id="roe"
                  type="number"
                  step="0.01"
                  value={formData.roe || ''}
                  onChange={(e) => setFormData({...formData, roe: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="roa">ROA</Label>
                <Input
                  id="roa"
                  type="number"
                  step="0.01"
                  value={formData.roa || ''}
                  onChange={(e) => setFormData({...formData, roa: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="dividend_yield">Dividend Yield</Label>
                <Input
                  id="dividend_yield"
                  type="number"
                  step="0.01"
                  value={formData.dividend_yield || ''}
                  onChange={(e) => setFormData({...formData, dividend_yield: Number(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (mode === 'create' ? 'Criando...' : 'Salvando...') : (mode === 'create' ? 'Criar' : 'Salvar')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}