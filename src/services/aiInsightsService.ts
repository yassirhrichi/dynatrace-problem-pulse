import { EntityAnalysis } from '@/types/dynatrace';

export interface AIInsight {
  type: 'pattern' | 'recommendation' | 'prediction' | 'summary';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  data?: any;
}

export interface AIAnalysisResult {
  insights: AIInsight[];
  summary: string;
  recommendations: string[];
  riskScore: number;
}

export class AIInsightsService {
  private static apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  static async analyzeProblemsData(data: EntityAnalysis[]): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file.');
    }

    // Prepare the data for AI analysis
    const analysisData = {
      totalEntities: data.length,
      entities: data.map(entity => ({
        name: entity.entityName,
        type: entity.entityType,
        totalProblems: entity.totalProblems,
        cumulativeDuration: entity.cumulativeDuration,
        averageDuration: entity.averageDuration,
        problems: entity.problems.map(p => ({
          title: p.title,
          duration: p.duration,
          severity: p.severityLevel,
          startTime: new Date(p.startTime).toISOString()
        }))
      })),
      summary: {
        totalProblems: data.reduce((sum, e) => sum + e.totalProblems, 0),
        totalDuration: data.reduce((sum, e) => sum + e.cumulativeDuration, 0),
        topAffectedEntity: data[0]?.entityName || 'None',
        entityTypes: [...new Set(data.map(e => e.entityType))]
      }
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: `You are an expert system reliability engineer analyzing Dynatrace problem data. 
              Analyze the provided data and return insights as a JSON object with this exact structure:
              {
                "insights": [
                  {
                    "type": "pattern|recommendation|prediction|summary",
                    "title": "Brief title",
                    "description": "Detailed description",
                    "severity": "low|medium|high",
                    "confidence": 0.1-1.0
                  }
                ],
                "summary": "Overall analysis summary",
                "recommendations": ["actionable recommendation 1", "actionable recommendation 2"],
                "riskScore": 0-100
              }
              
              Focus on:
              - Identifying patterns in problem frequency and duration
              - Finding entities with recurring issues
              - Suggesting root cause investigations
              - Recommending monitoring improvements
              - Assessing overall system health`
            },
            {
              role: 'user',
              content: `Analyze this Dynatrace problems data and provide insights: ${JSON.stringify(analysisData)}`
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const result = await response.json();
      const analysisResult = JSON.parse(result.choices[0].message.content);
      
      return analysisResult;
    } catch (error) {
      console.error('Error analyzing data with AI:', error);
      
      // Fallback: Return basic analysis if AI fails
      return this.generateFallbackInsights(data);
    }
  }

  private static generateFallbackInsights(data: EntityAnalysis[]): AIAnalysisResult {
    const totalProblems = data.reduce((sum, e) => sum + e.totalProblems, 0);
    const totalDuration = data.reduce((sum, e) => sum + e.cumulativeDuration, 0);
    const topEntity = data[0];
    
    const insights: AIInsight[] = [];
    
    if (topEntity && topEntity.totalProblems > 3) {
      insights.push({
        type: 'pattern',
        title: 'High Problem Frequency Detected',
        description: `${topEntity.entityName} has experienced ${topEntity.totalProblems} problems, indicating potential instability.`,
        severity: 'high',
        confidence: 0.9
      });
    }

    if (data.filter(e => e.entityType === 'HOST').length > data.length * 0.6) {
      insights.push({
        type: 'recommendation',
        title: 'Infrastructure Focus Required',
        description: 'Most problems are affecting HOST entities. Consider infrastructure monitoring and capacity planning.',
        severity: 'medium',
        confidence: 0.8
      });
    }

    const avgDuration = totalDuration / totalProblems;
    if (avgDuration > 30 * 60 * 1000) { // 30 minutes
      insights.push({
        type: 'prediction',
        title: 'Long Problem Resolution Times',
        description: 'Average problem duration suggests slow incident response. Consider automation improvements.',
        severity: 'medium',
        confidence: 0.7
      });
    }

    return {
      insights,
      summary: `Analyzed ${data.length} entities with ${totalProblems} total problems. ${topEntity ? `${topEntity.entityName} requires immediate attention.` : 'No critical issues identified.'}`,
      recommendations: [
        'Implement automated monitoring for top affected entities',
        'Review incident response procedures for faster resolution',
        'Consider redundancy for frequently affected services'
      ],
      riskScore: Math.min(100, (totalProblems / data.length) * 20 + (avgDuration / (60 * 60 * 1000)) * 10)
    };
  }
}