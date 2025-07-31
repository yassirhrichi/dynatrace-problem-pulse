import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { EntityAnalysis, ChartDataPoint } from '@/types/dynatrace';

interface DurationChartProps {
  data: EntityAnalysis[];
  isLoading: boolean;
}

const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function DurationChart({ data, isLoading }: DurationChartProps) {
  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const chartData: ChartDataPoint[] = data.slice(0, 10).map((entity, index) => ({
    name: entity.entityName.length > 15 ? entity.entityName.substring(0, 15) + '...' : entity.entityName,
    value: entity.cumulativeDuration,
    duration: entity.cumulativeDuration,
    problems: entity.totalProblems,
    entityType: entity.entityType,
    fullName: entity.entityName,
    color: colors[index % colors.length]
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-elevated">
          <p className="font-semibold text-foreground">{data.fullName}</p>
          <p className="text-sm text-muted-foreground mb-2">{data.entityType}</p>
          <p className="text-sm text-foreground">
            <span className="font-medium">Duration:</span> {formatDuration(data.duration)}
          </p>
          <p className="text-sm text-foreground">
            <span className="font-medium">Problems:</span> {data.problems}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Cumulative Problem Duration by Entity
          </CardTitle>
          <CardDescription>
            Entities ranked by total time spent in problem state
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Cumulative Problem Duration by Entity
        </CardTitle>
        <CardDescription>
          Top 10 entities ranked by total time spent in problem state
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={formatDuration}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}