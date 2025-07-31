import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { EntityAnalysis } from '@/types/dynatrace';

interface TrendChartProps {
  data: EntityAnalysis[];
  isLoading: boolean;
}

export function TrendChart({ data, isLoading }: TrendChartProps) {
  // Generate trend data based on problem start times
  const generateTrendData = () => {
    const now = Date.now();
    const timeSlots = [];
    
    // Create 24 hour slots for the last day
    for (let i = 23; i >= 0; i--) {
      const time = now - (i * 60 * 60 * 1000);
      timeSlots.push({
        time,
        label: new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        problems: 0,
        entities: 0
      });
    }

    // Count problems and affected entities per time slot
    data.forEach(entity => {
      entity.problems.forEach(problem => {
        const problemTime = problem.startTime;
        const slot = timeSlots.find(slot => 
          problemTime >= slot.time && problemTime < slot.time + (60 * 60 * 1000)
        );
        
        if (slot) {
          slot.problems += 1;
          slot.entities += 1;
        }
      });
    });

    return timeSlots;
  };

  const trendData = generateTrendData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-elevated">
          <p className="font-semibold text-foreground mb-1">{label}</p>
          <p className="text-sm text-foreground">
            <span className="font-medium text-chart-1">Problems:</span> {payload[0]?.value || 0}
          </p>
          <p className="text-sm text-foreground">
            <span className="font-medium text-chart-2">Entities:</span> {payload[1]?.value || 0}
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
            <TrendingUp className="h-5 w-5 text-primary" />
            Problem Occurrence Trend
          </CardTitle>
          <CardDescription>
            Hourly distribution of problems and affected entities over the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading trend data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Problem Occurrence Trend
        </CardTitle>
        <CardDescription>
          Hourly distribution of problems and affected entities over the last 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="problemsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="entitiesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="label" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="problems"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#problemsGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="entities"
                stroke="hsl(var(--chart-2))"
                fillOpacity={1}
                fill="url(#entitiesGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-1"></div>
            <span className="text-sm text-muted-foreground">Problems</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-2"></div>
            <span className="text-sm text-muted-foreground">Affected Entities</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}