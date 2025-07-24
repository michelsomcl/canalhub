import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonCardProps {
  title: string;
  current: number;
  previousQuarter?: number;
  sameQuarterLastYear?: number;
  unit: 'currency' | 'percentage' | 'ratio';
}

export function ComparisonCard({ 
  title, 
  current, 
  previousQuarter, 
  sameQuarterLastYear, 
  unit 
}: ComparisonCardProps) {
  const formatValue = (val: number) => {
    switch (unit) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percentage':
        return `${val.toFixed(2)}%`;
      case 'ratio':
        return val.toFixed(2);
      default:
        return val.toString();
    }
  };

  const getComparison = (current: number, previous?: number): { percentage: string; trend: 'up' | 'down' | 'neutral' } | null => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return {
      percentage: change.toFixed(1),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-success" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-destructive" />;
      default:
        return <Minus className="h-3 w-3 text-primary" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-primary';
    }
  };

  const quarterComparison = getComparison(current, previousQuarter);
  const yearComparison = getComparison(current, sameQuarterLastYear);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-lg font-bold text-primary">
          {formatValue(current)}
        </div>
        
        {quarterComparison && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">vs. Trimestre Anterior</span>
            <div className={cn("flex items-center gap-1", getTrendColor(quarterComparison.trend))}>
              {getTrendIcon(quarterComparison.trend)}
              <span>{quarterComparison.percentage}%</span>
            </div>
          </div>
        )}
        
        {yearComparison && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">vs. Mesmo Trimestre Ano Anterior</span>
            <div className={cn("flex items-center gap-1", getTrendColor(yearComparison.trend))}>
              {getTrendIcon(yearComparison.trend)}
              <span>{yearComparison.percentage}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}