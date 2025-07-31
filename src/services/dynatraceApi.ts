import { DynatraceProblem, EntityAnalysis } from '@/types/dynatrace';

// Mock data service for demonstration - replace with actual Dynatrace API calls
export class DynatraceApiService {
  private baseUrl = 'https://your-tenant.dynatrace.com/api/v2';
  private apiToken = 'your-api-token'; // In production, this should be from environment

  async getClosedProblems(timeRange: number): Promise<DynatraceProblem[]> {
    // Mock data for demonstration
    const mockProblems: DynatraceProblem[] = [
      {
        problemId: 'PROBLEM-1',
        displayId: 'P-12345',
        title: 'High response time on checkout service',
        impactLevel: 'SERVICE',
        severityLevel: 'PERFORMANCE',
        status: 'RESOLVED',
        startTime: Date.now() - (timeRange * 0.8 * 60 * 60 * 1000),
        endTime: Date.now() - (timeRange * 0.7 * 60 * 60 * 1000),
        affectedEntities: [
          {
            entityId: 'SERVICE-123',
            name: 'Checkout Service',
            entityType: 'SERVICE'
          },
          {
            entityId: 'HOST-456',
            name: 'web-server-01',
            entityType: 'HOST'
          }
        ]
      },
      {
        problemId: 'PROBLEM-2',
        displayId: 'P-12346',
        title: 'Memory leak in payment processor',
        impactLevel: 'APPLICATION',
        severityLevel: 'RESOURCE',
        status: 'RESOLVED',
        startTime: Date.now() - (timeRange * 0.6 * 60 * 60 * 1000),
        endTime: Date.now() - (timeRange * 0.4 * 60 * 60 * 1000),
        affectedEntities: [
          {
            entityId: 'APPLICATION-789',
            name: 'Payment App',
            entityType: 'APPLICATION'
          },
          {
            entityId: 'SERVICE-123',
            name: 'Checkout Service',
            entityType: 'SERVICE'
          }
        ]
      },
      {
        problemId: 'PROBLEM-3',
        displayId: 'P-12347',
        title: 'Database connection timeout',
        impactLevel: 'INFRASTRUCTURE',
        severityLevel: 'AVAILABILITY',
        status: 'RESOLVED',
        startTime: Date.now() - (timeRange * 0.3 * 60 * 60 * 1000),
        endTime: Date.now() - (timeRange * 0.1 * 60 * 60 * 1000),
        affectedEntities: [
          {
            entityId: 'HOST-456',
            name: 'web-server-01',
            entityType: 'HOST'
          },
          {
            entityId: 'HOST-789',
            name: 'db-server-01',
            entityType: 'HOST'
          }
        ]
      },
      {
        problemId: 'PROBLEM-4',
        displayId: 'P-12348',
        title: 'API rate limit exceeded',
        impactLevel: 'SERVICE',
        severityLevel: 'ERROR',
        status: 'RESOLVED',
        startTime: Date.now() - (timeRange * 0.9 * 60 * 60 * 1000),
        endTime: Date.now() - (timeRange * 0.85 * 60 * 60 * 1000),
        affectedEntities: [
          {
            entityId: 'SERVICE-456',
            name: 'API Gateway',
            entityType: 'SERVICE'
          }
        ]
      },
      {
        problemId: 'PROBLEM-5',
        displayId: 'P-12349',
        title: 'High CPU usage on web servers',
        impactLevel: 'INFRASTRUCTURE',
        severityLevel: 'RESOURCE',
        status: 'RESOLVED',
        startTime: Date.now() - (timeRange * 0.5 * 60 * 60 * 1000),
        endTime: Date.now() - (timeRange * 0.2 * 60 * 60 * 1000),
        affectedEntities: [
          {
            entityId: 'HOST-456',
            name: 'web-server-01',
            entityType: 'HOST'
          },
          {
            entityId: 'HOST-789',
            name: 'db-server-01',
            entityType: 'HOST'
          },
          {
            entityId: 'SERVICE-123',
            name: 'Checkout Service',
            entityType: 'SERVICE'
          }
        ]
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockProblems;
  }

  processProblemsData(problems: DynatraceProblem[]): EntityAnalysis[] {
    const entityMap = new Map<string, EntityAnalysis>();

    problems.forEach(problem => {
      const duration = problem.endTime ? problem.endTime - problem.startTime : 0;
      
      problem.affectedEntities.forEach(entity => {
        const key = entity.entityId;
        
        if (!entityMap.has(key)) {
          entityMap.set(key, {
            entityId: entity.entityId,
            entityName: entity.name,
            entityType: entity.entityType,
            totalProblems: 0,
            cumulativeDuration: 0,
            averageDuration: 0,
            problems: []
          });
        }

        const analysis = entityMap.get(key)!;
        analysis.totalProblems += 1;
        analysis.cumulativeDuration += duration;
        analysis.problems.push({
          problemId: problem.problemId,
          title: problem.title,
          duration,
          startTime: problem.startTime,
          endTime: problem.endTime || problem.startTime,
          severityLevel: problem.severityLevel
        });
      });
    });

    // Calculate average duration
    entityMap.forEach(analysis => {
      analysis.averageDuration = analysis.totalProblems > 0 
        ? analysis.cumulativeDuration / analysis.totalProblems 
        : 0;
    });

    return Array.from(entityMap.values()).sort((a, b) => b.cumulativeDuration - a.cumulativeDuration);
  }
}

export const dynatraceApi = new DynatraceApiService();