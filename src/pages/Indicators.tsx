import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Plus, Copy, Database } from "lucide-react";
import { IndicatorDefinition } from "@/types/company";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Default indicators
const defaultIndicators: IndicatorDefinition[] = [
  {
    id: "1",
    name: "Receitas de Bens e Serviços",
    field_name: "receitas_bens_servicos",
    category: "revenue",
    unit: "currency",
    description: "Receita total da empresa com vendas de bens e serviços",
    sql_column: "receitas_bens_servicos DECIMAL(15,2)"
  },
  {
    id: "2",
    name: "Custo da Receita Operacional",
    field_name: "custo_receita_operacional",
    category: "revenue",
    unit: "currency",
    description: "Custos diretos relacionados às receitas operacionais",
    sql_column: "custo_receita_operacional DECIMAL(15,2)"
  },
  {
    id: "3",
    name: "Despesas Operacionais",
    field_name: "despesas_operacionais",
    category: "revenue",
    unit: "currency",
    description: "Despesas relacionadas às operações da empresa",
    sql_column: "despesas_operacionais DECIMAL(15,2)"
  },
  {
    id: "4",
    name: "Lucro Operacional antes da Receita/Despesa Não Recorrente",
    field_name: "lucro_operacional_antes_receita_despesa_nao_recorrente",
    category: "profitability",
    unit: "currency",
    description: "Lucro operacional excluindo itens não recorrentes",
    sql_column: "lucro_operacional_antes_receita_despesa_nao_recorrente DECIMAL(15,2)"
  },
  {
    id: "5",
    name: "Lucro Líquido após Impostos",
    field_name: "lucro_liquido_apos_impostos",
    category: "profitability",
    unit: "currency",
    description: "Lucro final após todos os impostos e deduções",
    sql_column: "lucro_liquido_apos_impostos DECIMAL(15,2)"
  },
  // Add more indicators here...
];

const categoryColors = {
  revenue: "bg-primary",
  cash_flow: "bg-secondary",
  debt: "bg-accent",
  liquidity: "bg-success",
  profitability: "bg-primary",
  returns: "bg-secondary",
};

const categoryLabels = {
  revenue: "Receita",
  cash_flow: "Fluxo de Caixa",
  debt: "Endividamento",
  liquidity: "Liquidez",
  profitability: "Rentabilidade",
  returns: "Retornos",
};

export default function Indicators() {
  const [indicators, setIndicators] = useState<IndicatorDefinition[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<IndicatorDefinition | null>(null);
  const [showSql, setShowSql] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<{
    name: string;
    field_name: string;
    category: IndicatorDefinition['category'];
    unit: IndicatorDefinition['unit'];
    description: string;
  }>({
    name: "",
    field_name: "",
    category: "revenue",
    unit: "currency",
    description: "",
  });
  const { toast } = useToast();

  // Load indicators from Supabase
  useEffect(() => {
    loadIndicators();
  }, []);

  const loadIndicators = async () => {
    try {
      const { data, error } = await supabase
        .from('indicator_definitions')
        .select('*')
        .order('name');

      if (error) throw error;

      const formattedIndicators: IndicatorDefinition[] = data.map(item => ({
        id: item.id,
        name: item.name,
        field_name: item.field_name,
        category: item.category as IndicatorDefinition['category'],
        unit: item.unit as IndicatorDefinition['unit'],
        description: item.description || "",
        sql_column: item.sql_column
      }));

      setIndicators(formattedIndicators);
    } catch (error) {
      console.error('Erro ao carregar indicadores:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar indicadores do banco de dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateFieldName = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  };

  const generateSqlColumn = (fieldName: string, unit: string) => {
    const dataType = unit === "currency" ? "DECIMAL(15,2)" : "DECIMAL(10,4)";
    return `${fieldName} ${dataType}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fieldName = formData.field_name || generateFieldName(formData.name);
    const sqlColumn = generateSqlColumn(fieldName, formData.unit);
    
    try {
      if (editingIndicator) {
        const { error } = await supabase
          .from('indicator_definitions')
          .update({
            name: formData.name,
            field_name: fieldName,
            category: formData.category,
            unit: formData.unit,
            description: formData.description,
            sql_column: sqlColumn
          })
          .eq('id', editingIndicator.id);

        if (error) throw error;

        toast({
          title: "Indicador atualizado",
          description: "O indicador foi atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('indicator_definitions')
          .insert({
            name: formData.name,
            field_name: fieldName,
            category: formData.category,
            unit: formData.unit,
            description: formData.description,
            sql_column: sqlColumn
          });

        if (error) throw error;

        toast({
          title: "Indicador criado",
          description: "Novo indicador foi criado com sucesso.",
        });
      }
      
      loadIndicators(); // Reload data
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar indicador:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar indicador no banco de dados.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (indicator: IndicatorDefinition) => {
    setEditingIndicator(indicator);
    setFormData({
      name: indicator.name,
      field_name: indicator.field_name,
      category: indicator.category,
      unit: indicator.unit,
      description: indicator.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('indicator_definitions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Indicador excluído",
        description: "O indicador foi removido com sucesso.",
      });
      
      loadIndicators(); // Reload data
    } catch (error) {
      console.error('Erro ao excluir indicador:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir indicador do banco de dados.",
        variant: "destructive"
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingIndicator(null);
    setFormData({ name: "", field_name: "", category: "revenue", unit: "currency", description: "" });
  };

  const copySqlToClipboard = (sql: string) => {
    navigator.clipboard.writeText(`ALTER TABLE financial_indicators ADD COLUMN ${sql};`);
    toast({
      title: "SQL copiado",
      description: "O comando SQL foi copiado para a área de transferência.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">Gerenciar Indicadores</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Indicador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingIndicator ? "Editar Indicador" : "Criar Novo Indicador"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Indicador</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({ 
                        ...formData, 
                        name,
                        field_name: generateFieldName(name)
                      });
                    }}
                    placeholder="Ex: Margem EBITDA"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="field_name">Nome do Campo (Banco de Dados)</Label>
                  <Input
                    id="field_name"
                    value={formData.field_name}
                    onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                    placeholder="Ex: margem_ebitda"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => 
                    setFormData({ ...formData, category: value as any })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Receita</SelectItem>
                      <SelectItem value="cash_flow">Fluxo de Caixa</SelectItem>
                      <SelectItem value="debt">Endividamento</SelectItem>
                      <SelectItem value="liquidity">Liquidez</SelectItem>
                      <SelectItem value="profitability">Rentabilidade</SelectItem>
                      <SelectItem value="returns">Retornos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="unit">Unidade</Label>
                  <Select value={formData.unit} onValueChange={(value) => 
                    setFormData({ ...formData, unit: value as any })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="currency">Moeda (R$)</SelectItem>
                      <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                      <SelectItem value="ratio">Razão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o que este indicador representa..."
                    rows={3}
                  />
                </div>
                
                {formData.field_name && (
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium">SQL para Supabase:</Label>
                    <div className="mt-2 p-2 bg-background rounded border text-sm font-mono">
                      ALTER TABLE financial_indicators ADD COLUMN {generateSqlColumn(formData.field_name, formData.unit)};
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingIndicator ? "Atualizar" : "Criar"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores Configurados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Campo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indicators.map((indicator) => (
                  <TableRow key={indicator.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{indicator.name}</div>
                        {indicator.description && (
                          <div className="text-sm text-muted-foreground">
                            {indicator.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {indicator.field_name}
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryColors[indicator.category]}>
                        {categoryLabels[indicator.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {indicator.unit === 'currency' && 'R$'}
                      {indicator.unit === 'percentage' && '%'}
                      {indicator.unit === 'ratio' && 'Razão'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copySqlToClipboard(indicator.sql_column)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSql(showSql === indicator.id ? null : indicator.id)}
                        >
                          <Database className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(indicator)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(indicator.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {showSql && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <Label className="text-sm font-medium">SQL Command:</Label>
                <div className="mt-2 p-2 bg-background rounded border text-sm font-mono">
                  ALTER TABLE financial_indicators ADD COLUMN {indicators.find(i => i.id === showSql)?.sql_column};
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}