import { useState, useEffect, useMemo } from 'react';
import { dynatraceApi } from '@/services/dynatraceApi';
import { EntityAnalysis, FilterOptions, TimeRange } from '@/types/dynatrace';
import { DashboardHeader } from './DashboardHeader';
import { FilterPanel } from './FilterPanel';
import { DurationChart } from './DurationChart';
import { TrendChart } from './TrendChart';
import { EntityTable } from './EntityTable';
import { useToast } from '@/hooks/use-toast';

const defaultTimeRange: TimeRange = { label: 'Last 24 hours', value: '24h', hours: 24 };

const defaultFilters: FilterOptions = {
  timeRange: defaultTimeRange,
  entityType: 'all',
  entityName: 'all'
};

export function Dashboard() {
  const [data, setData] = useState<EntityAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [filters.timeRange]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const problems = await dynatraceApi.getClosedProblems(filters.timeRange.hours);
      const analysis = dynatraceApi.processProblemsData(problems);
      setData(analysis);
      
      toast({
        title: "Data Updated",
        description: `Loaded ${problems.length} closed problems affecting ${analysis.length} entities.`,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to fetch problem data from Dynatrace API.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    let filtered = [...data];
    
    if (filters.entityType !== 'all') {
      filtered = filtered.filter(entity => entity.entityType === filters.entityType);
    }
    
    if (filters.entityName !== 'all') {
      filtered = filtered.filter(entity => entity.entityName === filters.entityName);
    }
    
    return filtered;
  }, [data, filters]);

  const entityTypes = useMemo(() => {
    return [...new Set(data.map(entity => entity.entityType))];
  }, [data]);

  const entityNames = useMemo(() => {
    return [...new Set(data.map(entity => entity.entityName))].sort();
  }, [data]);

  const totalProblems = useMemo(() => {
    return filteredData.reduce((sum, entity) => sum + entity.totalProblems, 0);
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader 
          totalProblems={totalProblems}
          totalEntities={filteredData.length}
          isLoading={isLoading}
        />
        
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          entityTypes={entityTypes}
          entityNames={entityNames}
        />
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <DurationChart data={filteredData} isLoading={isLoading} />
          <TrendChart data={filteredData} isLoading={isLoading} />
        </div>
        
        <EntityTable data={filteredData} isLoading={isLoading} />
      </div>
    </div>
  );
}