import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AttritionRiskFactor {
  factor: string;
  weight: number;
  value: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface EmployeeAttritionRisk {
  employeeId: string;
  employeeName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: AttritionRiskFactor[];
  survivalProbability: number; // Probability of staying next 12 months
  timeToAttrition: number; // Estimated months until departure
  interventionPriority: number;
  recommendedActions: string[];
}

export interface TeamAttritionAnalysis {
  teamId: string;
  teamName: string;
  overallRiskScore: number;
  expectedAttrition: number; // Expected departures in next 12 months
  highRiskEmployees: EmployeeAttritionRisk[];
  riskTrends: {
    increasing: number;
    stable: number;
    decreasing: number;
  };
  interventionOpportunities: string[];
}

export interface AttritionPrediction {
  individual: EmployeeAttritionRisk[];
  teams: TeamAttritionAnalysis[];
  organizationalRisk: number;
  costImpact: number;
  confidenceLevel: number;
  lastUpdated: Date;
}

// Risk factor weights based on research
const RISK_WEIGHTS = {
  engagement_decline: 0.25,
  wellness_deterioration: 0.20,
  workload_stress: 0.15,
  relationship_issues: 0.12,
  career_stagnation: 0.10,
  compensation_dissatisfaction: 0.08,
  work_life_balance: 0.10
};

// Base survival rates by role and tenure
const SURVIVAL_BASELINES = {
  'EMPLOYEE': { '<1y': 0.75, '1-2y': 0.85, '2-5y': 0.90, '>5y': 0.95 },
  'MANAGER': { '<1y': 0.80, '1-2y': 0.88, '2-5y': 0.92, '>5y': 0.96 },
  'HR_ADMIN': { '<1y': 0.82, '1-2y': 0.90, '2-5y': 0.94, '>5y': 0.97 }
};

export const useAttritionPredictor = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<AttritionPrediction | null>(null);

  const calculateTenure = (createdAt: string): string => {
    const created = new Date(createdAt);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - created.getFullYear()) * 12 + 
                      (now.getMonth() - created.getMonth());
    
    if (monthsDiff < 12) return '<1y';
    if (monthsDiff < 24) return '1-2y';
    if (monthsDiff < 60) return '2-5y';
    return '>5y';
  };

  const analyzeEngagementTrend = (checkins: any[]): { score: number; trend: 'improving' | 'declining' | 'stable' } => {
    if (checkins.length < 3) return { score: 0.5, trend: 'stable' };

    // Sort by date
    const sorted = checkins.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    // Calculate trend using linear regression
    const n = sorted.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = sorted.map(c => c.mood || 5);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgY = sumY / n;
    
    const normalizedScore = Math.max(0, Math.min(1, avgY / 10));
    const trend = Math.abs(slope) < 0.1 ? 'stable' : slope > 0 ? 'improving' : 'declining';
    
    return { score: normalizedScore, trend };
  };

  const calculateWellnessDeterioration = (checkins: any[]): number => {
    if (checkins.length < 2) return 0;

    const recent = checkins.slice(-5); // Last 5 checkins
    const earlier = checkins.slice(0, -5);
    
    const recentAvg = recent.reduce((sum, c) => sum + (c.mood || 5), 0) / recent.length;
    const earlierAvg = earlier.length > 0 ? 
      earlier.reduce((sum, c) => sum + (c.mood || 5), 0) / earlier.length : recentAvg;
    
    const deterioration = Math.max(0, (earlierAvg - recentAvg) / 10);
    return Math.min(1, deterioration);
  };

  const assessWorkloadStress = (alerts: any[]): number => {
    const workloadAlerts = alerts.filter(a => 
      a.type === 'burnout_risk' || a.type === 'workload_high'
    );
    
    return Math.min(1, workloadAlerts.length / 10);
  };

  const evaluateRelationshipIssues = (checkins: any[]): number => {
    // Look for patterns in social/team-related responses
    const teamCheckins = checkins.filter(c => {
      const responses = c.response_value;
      return responses !== null && responses < 4; // Assuming scale 1-10
    });
    
    return Math.min(1, teamCheckins.length / Math.max(checkins.length, 1));
  };

  const calculateRiskScore = (factors: AttritionRiskFactor[]): number => {
    return factors.reduce((sum, factor) => {
      return sum + (factor.weight * factor.value);
    }, 0);
  };

  const determineRiskLevel = (score: number): EmployeeAttritionRisk['riskLevel'] => {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  };

  const calculateSurvivalProbability = (
    riskScore: number, 
    role: string, 
    tenure: string
  ): number => {
    const baseline = SURVIVAL_BASELINES[role as keyof typeof SURVIVAL_BASELINES]?.[tenure as keyof typeof SURVIVAL_BASELINES['EMPLOYEE']] || 0.85;
    const riskAdjustment = riskScore * 0.5; // Risk can reduce survival by up to 50%
    return Math.max(0.1, baseline - riskAdjustment);
  };

  const estimateTimeToAttrition = (survivalProbability: number): number => {
    // Using inverse exponential decay model
    if (survivalProbability >= 0.9) return 24; // 2+ years
    if (survivalProbability >= 0.7) return 12; // ~1 year
    if (survivalProbability >= 0.5) return 6;  // ~6 months
    return 3; // ~3 months
  };

  const generateRecommendations = (riskFactors: AttritionRiskFactor[]): string[] => {
    const recommendations: string[] = [];
    
    riskFactors.forEach(factor => {
      if (factor.impact === 'high' || factor.impact === 'critical') {
        switch (factor.factor) {
          case 'engagement_decline':
            recommendations.push('Programar 1:1 urgente para entender desconexión');
            recommendations.push('Revisar asignaciones y proyectos actuales');
            break;
          case 'wellness_deterioration':
            recommendations.push('Derivar a programa de bienestar/EAP');
            recommendations.push('Evaluar carga de trabajo y balance');
            break;
          case 'workload_stress':
            recommendations.push('Redistribuir tareas inmediatamente');
            recommendations.push('Considerar recursos adicionales');
            break;
          case 'relationship_issues':
            recommendations.push('Facilitar resolución de conflictos');
            recommendations.push('Coaching en dinámicas de equipo');
            break;
          case 'career_stagnation':
            recommendations.push('Crear plan de desarrollo profesional');
            recommendations.push('Explorar oportunidades de crecimiento');
            break;
        }
      }
    });
    
    return recommendations;
  };

  const predictAttrition = async (): Promise<AttritionPrediction | null> => {
    try {
      setLoading(true);

      // Get all employees in tenant
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', user?.tenant_id);

      if (!profiles) return null;

      // Get last 90 days of data
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const employeeRisks: EmployeeAttritionRisk[] = [];

      for (const profile of profiles) {
        // Get employee checkins
        const { data: checkins } = await supabase
          .from('checkins')
          .select('*')
          .eq('user_id', profile.id)
          .gte('created_at', ninetyDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        // Get employee alerts
        const { data: alerts } = await supabase
          .from('alerts')
          .select('*')
          .eq('user_id', profile.id)
          .gte('created_at', ninetyDaysAgo.toISOString());

        if (!checkins || checkins.length === 0) continue;

        // Calculate risk factors
        const engagementAnalysis = analyzeEngagementTrend(checkins);
        const wellnessDeterioration = calculateWellnessDeterioration(checkins);
        const workloadStress = assessWorkloadStress(alerts || []);
        const relationshipIssues = evaluateRelationshipIssues(checkins);

        const riskFactors: AttritionRiskFactor[] = [
          {
            factor: 'engagement_decline',
            weight: RISK_WEIGHTS.engagement_decline,
            value: engagementAnalysis.trend === 'declining' ? 0.8 : 
                   engagementAnalysis.trend === 'stable' ? 0.3 : 0.1,
            impact: engagementAnalysis.trend === 'declining' ? 'high' : 'low',
            description: `Tendencia de engagement: ${engagementAnalysis.trend}`
          },
          {
            factor: 'wellness_deterioration',
            weight: RISK_WEIGHTS.wellness_deterioration,
            value: wellnessDeterioration,
            impact: wellnessDeterioration > 0.7 ? 'critical' : 
                    wellnessDeterioration > 0.4 ? 'high' : 'medium',
            description: `Deterioro bienestar: ${(wellnessDeterioration * 100).toFixed(0)}%`
          },
          {
            factor: 'workload_stress',
            weight: RISK_WEIGHTS.workload_stress,
            value: workloadStress,
            impact: workloadStress > 0.6 ? 'high' : workloadStress > 0.3 ? 'medium' : 'low',
            description: `Estrés por carga: ${(workloadStress * 100).toFixed(0)}%`
          },
          {
            factor: 'relationship_issues',
            weight: RISK_WEIGHTS.relationship_issues,
            value: relationshipIssues,
            impact: relationshipIssues > 0.5 ? 'high' : 'low',
            description: `Problemas relacionales: ${(relationshipIssues * 100).toFixed(0)}%`
          }
        ];

        const riskScore = calculateRiskScore(riskFactors);
        const tenure = calculateTenure(profile.created_at);
        const survivalProbability = calculateSurvivalProbability(riskScore, profile.role, tenure);
        const timeToAttrition = estimateTimeToAttrition(survivalProbability);

        employeeRisks.push({
          employeeId: profile.id,
          employeeName: profile.full_name || profile.email,
          riskScore,
          riskLevel: determineRiskLevel(riskScore),
          riskFactors,
          survivalProbability,
          timeToAttrition,
          interventionPriority: riskScore * (1 - survivalProbability),
          recommendedActions: generateRecommendations(riskFactors)
        });
      }

      // Sort by risk score
      employeeRisks.sort((a, b) => b.riskScore - a.riskScore);

      // Calculate organizational metrics
      const organizationalRisk = employeeRisks.reduce((sum, emp) => sum + emp.riskScore, 0) / employeeRisks.length;
      const expectedAttrition = employeeRisks.reduce((sum, emp) => sum + (1 - emp.survivalProbability), 0);
      const avgSalary = 50000; // Could be made dynamic
      const costImpact = expectedAttrition * avgSalary * 1.5; // 1.5x salary replacement cost

      return {
        individual: employeeRisks,
        teams: [], // Would need team grouping logic
        organizationalRisk,
        costImpact,
        confidenceLevel: employeeRisks.length > 10 ? 0.85 : 0.70,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Error predicting attrition:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshPrediction = useCallback(async () => {
    const data = await predictAttrition();
    setPrediction(data);
  }, []);

  useEffect(() => {
    if (user?.tenant_id) {
      refreshPrediction();
    }
  }, [user?.tenant_id]);

  return {
    loading,
    prediction,
    refreshPrediction,
    predictAttrition
  };
};