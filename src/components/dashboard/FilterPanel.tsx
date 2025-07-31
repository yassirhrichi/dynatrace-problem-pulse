import { Calendar, Filter, Server } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { FilterOptions, TimeRange } from '@/types/dynatrace';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  entityTypes: string[];
  entityNames: string[];
}

const timeRanges: TimeRange[] = [
  { label: 'Last 24 hours', value: '24h', hours: 24 },
  { label: 'Last 7 days', value: '7d', hours: 168 },
  { label: 'Last 30 days', value: '30d', hours: 720 },
  { label: 'Last 90 days', value: '90d', hours: 2160 }
];

export function FilterPanel({ filters, onFiltersChange, entityTypes, entityNames }: FilterPanelProps) {
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card className="p-6 mb-6 bg-card border-border shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Time Range
          </label>
          <Select
            value={filters.timeRange.value}
            onValueChange={(value) => {
              const timeRange = timeRanges.find(tr => tr.value === value) || timeRanges[0];
              updateFilter('timeRange', timeRange);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Server className="h-4 w-4" />
            Entity Type
          </label>
          <Select
            value={filters.entityType}
            onValueChange={(value) => updateFilter('entityType', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All entity types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {entityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Entity Name
          </label>
          <Select
            value={filters.entityName}
            onValueChange={(value) => updateFilter('entityName', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {entityNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}