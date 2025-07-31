import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, RefreshCw, AlertTriangle, CheckCircle, TrendingUp, Lightbulb } from 'lucide-react';
import { AIInsightsService, AIInsight, AIAnalysisResult } from '@/services/aiInsightsService';
import { EntityAnalysis } from '@/types/dynatrace';
import { useToast } from '@/hooks/use-toast';

interface AIInsightsPanelProps {
  data: EntityAnalysis[];
  isDataLoading: boolean;
}

export function AIInsightsPanel({ data, isDataLoading }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeData = async () => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "No problem data available for analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await AIInsightsService.analyzeProblemsData(data);
      setInsights(result);
      
      toast({
        title: "Analysis Complete",
        description: `Generated ${result.insights.length} insights with ${Math.round(result.riskScore)} risk score.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze data';
      setError(errorMessage);
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (data.length > 0 && !isDataLoading) {
      analyzeData();
    }
  }, [data, isDataLoading]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern':
        return <TrendingUp className="h-4 w-4" />;
      case 'recommendation':
        return <Lightbulb className="h-4 w-4" />;
      case 'prediction':
        return <AlertTriangle className="h-4 w-4" />;
      case 'summary':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-destructive';
    if (score >= 40) return 'text-warning';
    return 'text-success';
  };

  if (error && error.includes('API key')) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Intelligent analysis of your problem data patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-warning" />
            <h3 className="text-lg font-semibold mb-2">API Key Required</h3>
            <p className="text-muted-foreground mb-4">
              To enable AI insights, add your OpenAI API key to the .env file:
            </p>
            <div className="bg-muted rounded-lg p-3 text-left">
              <code className="text-sm">VITE_OPENAI_API_KEY=your_api_key_here</code>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ⚠️ Note: API keys in .env files are publicly visible in frontend apps
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Intelligent analysis of your problem data patterns
            </CardDescription>
          </div>
          <Button
            onClick={analyzeData}
            disabled={isLoading || isDataLoading || data.length === 0}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Re-analyze
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
            <p className="text-muted-foreground">Analyzing problem data with AI...</p>
          </div>
        )}

        {error && !error.includes('API key') && (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {insights && !isLoading && (
          <div className="space-y-6">
            {/* Risk Score and Summary */}
            <div className="flex items-center justify-between p-4 bg-gradient-chart rounded-lg border">
              <div>
                <h3 className="font-semibold text-foreground">System Health Score</h3>
                <p className="text-sm text-muted-foreground">Based on problem patterns and frequency</p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getRiskScoreColor(insights.riskScore)}`}>
                  {Math.round(insights.riskScore)}/100
                </div>
                <div className="text-xs text-muted-foreground">Risk Level</div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <h4 className="font-semibold mb-2 text-foreground">Executive Summary</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{insights.summary}</p>
            </div>

            <Separator />

            {/* Insights */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Key Insights</h4>
              <div className="space-y-3">
                {insights.insights.map((insight, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium text-foreground">{insight.title}</h5>
                          <Badge 
                            variant="outline" 
                            className={getSeverityColor(insight.severity)}
                          >
                            {insight.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(insight.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Recommendations</h4>
              <div className="space-y-2">
                {insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-success/5 border border-success/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    <p className="text-sm text-foreground">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {data.length === 0 && !isDataLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No data available for AI analysis.</p>
            <p className="text-xs mt-1">Load some problem data first.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}