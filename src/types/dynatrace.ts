export interface DynatraceProblem {
  problemId: string;
  displayId: string;
  title: string;
  impactLevel: 'APPLICATION' | 'SERVICE' | 'INFRASTRUCTURE';
  severityLevel: 'AVAILABILITY' | 'ERROR' | 'PERFORMANCE' | 'RESOURCE' | 'CUSTOM';
  status: 'OPEN' | 'RESOLVED';
  affectedEntities: AffectedEntity[];
  startTime: number;
  endTime?: number;
}

export interface AffectedEntity {
  entityId: string;
  name: string;
  entityType: 'APPLICATION' | 'SERVICE' | 'HOST' | 'PROCESS_GROUP' | 'PROCESS_GROUP_INSTANCE';
}

export interface EntityAnalysis {
  entityId: string;
  entityName: string;
  entityType: string;
  totalProblems: number;
  cumulativeDuration: number;
  averageDuration: number;
  problems: {
    problemId: string;
    title: string;
    duration: number;
    startTime: number;
    endTime: number;
    severityLevel: string;
  }[];
}

export interface TimeRange {
  label: string;
  value: string;
  hours: number;
}

export interface FilterOptions {
  timeRange: TimeRange;
  entityType: string;
  entityName: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  duration?: number;
  problems?: number;
  entityType?: string;
  fullName?: string;
  color?: string;
}