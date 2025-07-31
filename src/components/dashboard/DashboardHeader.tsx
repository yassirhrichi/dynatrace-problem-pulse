import { Activity, TrendingUp } from 'lucide-react';

interface DashboardHeaderProps {
  totalProblems: number;
  totalEntities: number;
  isLoading: boolean;
}

export function DashboardHeader({ totalProblems, totalEntities, isLoading }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-primary/20">
          <Activity className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dynatrace Problem Pulse</h1>
          <p className="text-muted-foreground">Closed problems analysis and entity impact assessment</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Closed Problems</p>
              <p className="text-3xl font-bold text-foreground">
                {isLoading ? '...' : totalProblems.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Affected Entities</p>
              <p className="text-3xl font-bold text-foreground">
                {isLoading ? '...' : totalEntities.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-accent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}