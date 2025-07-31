import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Clock, AlertTriangle } from 'lucide-react';
import { EntityAnalysis } from '@/types/dynatrace';

interface EntityTableProps {
  data: EntityAnalysis[];
  isLoading: boolean;
}

export function EntityTable({ data, isLoading }: EntityTableProps) {
  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case 'SERVICE':
        return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      case 'HOST':
        return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      case 'APPLICATION':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Entity Impact Analysis
          </CardTitle>
          <CardDescription>
            Detailed breakdown of problem impact per entity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading entity data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Entity Impact Analysis
        </CardTitle>
        <CardDescription>
          Detailed breakdown of problem impact per entity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Entity Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold text-center">
                  <div className="flex items-center justify-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Problems
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4" />
                    Total Duration
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-center">Average Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((entity) => (
                <TableRow key={entity.entityId} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="max-w-xs truncate" title={entity.entityName}>
                      {entity.entityName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getEntityTypeColor(entity.entityType)}
                    >
                      {entity.entityType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                        {entity.totalProblems}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {formatDuration(entity.cumulativeDuration)}
                  </TableCell>
                  <TableCell className="text-center font-mono text-muted-foreground">
                    {formatDuration(entity.averageDuration)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No entity data available for the selected filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}