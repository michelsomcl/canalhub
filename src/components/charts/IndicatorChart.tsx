import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  quarter: string;
  value: number;
}

interface IndicatorChartProps {
  title: string;
  data: ChartData[];
  unit: 'currency' | 'percentage' | 'ratio';
}

export function IndicatorChart({ title, data, unit }: IndicatorChartProps) {
  const formatValue = (value: number) => {
    switch (unit) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'ratio':
        return value.toFixed(2);
      default:
        return value.toString();
    }
  };

  const formatAxisValue = (value: number) => {
    if (unit === 'currency') {
      if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`;
      } else if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
    }
    return formatValue(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="quarter" 
              className="text-sm"
              tick={{ fill: 'hsl(var(--primary))' }}
            />
            <YAxis 
              className="text-sm"
              tick={{ fill: 'hsl(var(--primary))' }}
              tickFormatter={formatAxisValue}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [formatValue(value), title]}
              labelStyle={{ color: 'hsl(var(--primary))' }}
            />
            <Bar 
              dataKey="value" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}