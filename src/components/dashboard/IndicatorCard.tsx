import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface IndicatorCardProps {
  title: string;
  value: number;
  previousValue?: number;
  unit: 'currency' | 'percentage' | 'ratio';
  trend?: 'up' | 'down' | 'neutral';
}

export function IndicatorCard({ title, value, previousValue, unit, trend }: IndicatorCardProps) {
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

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getChangePercentage = () => {
    if (!previousValue || previousValue === 0) return null;
    const change = ((value - previousValue) / Math.abs(previousValue)) * 100;
    return change.toFixed(1);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {getTrendIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">
          {formatValue(value)}
        </div>
        {previousValue && (
          <p className={cn("text-xs", getTrendColor())}>
            {getChangePercentage()}% em relação ao trimestre anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}