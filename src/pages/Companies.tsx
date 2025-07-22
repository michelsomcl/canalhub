import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus, ExternalLink } from "lucide-react";
import { Company } from "@/types/company";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockCompanies: Company[] = [
  { id: "1", nome: "ROMI S.A.", ticker: "ROMI3", link_ri: "https://ri.romi.com" },
  { id: "2", nome: "Petrobras", ticker: "PETR4", link_ri: "https://ri.petrobras.com" },
  { id: "3", nome: "Vale S.A.", ticker: "VALE3", link_ri: "https://ri.vale.com" },
];

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    ticker: "",
    link_ri: "",
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCompany) {
      // Update existing company
      setCompanies(companies.map(c => 
        c.id === editingCompany.id 
          ? { ...editingCompany, ...formData }
          : c
      ));
      toast({
        title: "Empresa atualizada",
        description: "Os dados da empresa foram atualizados com sucesso.",
      });
    } else {
      // Create new company
      const newCompany: Company = {
        id: Date.now().toString(),
        ...formData,
      };
      setCompanies([...companies, newCompany]);
      toast({
        title: "Empresa cadastrada",
        description: "Nova empresa foi cadastrada com sucesso.",
      });
    }
    
    handleCloseDialog();
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      nome: company.nome,
      ticker: company.ticker,
      link_ri: company.link_ri,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCompanies(companies.filter(c => c.id !== id));
    toast({
      title: "Empresa excluída",
      description: "A empresa foi removida com sucesso.",
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCompany(null);
    setFormData({ nome: "", ticker: "", link_ri: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">Gerenciar Empresas</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCompany ? "Editar Empresa" : "Cadastrar Nova Empresa"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da Empresa</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: ROMI S.A."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="ticker">Ticker</Label>
                  <Input
                    id="ticker"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                    placeholder="Ex: ROMI3"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="link_ri">Link do RI</Label>
                  <Input
                    id="link_ri"
                    type="url"
                    value={formData.link_ri}
                    onChange={(e) => setFormData({ ...formData, link_ri: e.target.value })}
                    placeholder="Ex: https://ri.romi.com"
                    required
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingCompany ? "Atualizar" : "Cadastrar"}
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
            <CardTitle>Empresas Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Link do RI</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.nome}</TableCell>
                    <TableCell>{company.ticker}</TableCell>
                    <TableCell>
                      <a
                        href={company.link_ri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-accent hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Acessar RI
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(company)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(company.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}