import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Brain,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Target,
  TrendingUp,
  Clock,
  Users,
  ArrowRight,
  Calculator
} from 'lucide-react';

interface ROIMetrics {
  roiPercentage: number;
  totalSavings: number;
  paybackMonths: number;
  netBenefit: number;
}

interface ImpactData {
  total_employees: number;
  avg_wellness: number;
  engagement_score: number;
  productivity_index: number;
  turnover_rate: number;
  absenteeism_rate: number;
}

interface ROIRecommendationsCardProps {
  metrics: ROIMetrics;
  impactData: ImpactData;
  avgSalary: number;
  programInvestment: number;
}

interface Recommendation {
  title: string;
  description: string;
  cost: number;
  expectedROI: number;
  timeframe: string;
  impact: 'Alto' | 'Medio' | 'Bajo';
  category: string;
  expectedSavings?: number;
}

export const ROIRecommendationsCard = ({ 
  metrics, 
  impactData, 
  avgSalary, 
  programInvestment 
}: ROIRecommendationsCardProps) => {
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const generateRecommendations = (): {
    urgent: Recommendation[];
    quickWins: Recommendation[];
    longTerm: Recommendation[];
    optimizations: Recommendation[];
  } => {
    const employees = impactData.total_employees;
    const currentROI = metrics.roiPercentage;

    const recommendations = {
      urgent: [] as Recommendation[],
      quickWins: [] as Recommendation[],
      longTerm: [] as Recommendation[],
      optimizations: [] as Recommendation[]
    };

    // Urgent actions for low ROI
    if (currentROI < 50) {
      recommendations.urgent.push({
        title: "Programa de Salud Mental",
        description: "Implementar sesiones de mindfulness, coaching y apoyo psicológico profesional para reducir el burnout",
        cost: employees * 180,
        expectedROI: Math.round((employees * avgSalary * 0.12) / (employees * 180) * 100),
        timeframe: "3-6 meses",
        impact: "Alto",
        category: "Bienestar",
        expectedSavings: employees * avgSalary * 0.12
      });

      recommendations.urgent.push({
        title: "Sistema de Reconocimiento Digital",
        description: "Plataforma de reconocimiento peer-to-peer con recompensas y gamificación",
        cost: employees * 45,
        expectedROI: Math.round((employees * avgSalary * 0.5 * 0.2) / (employees * 45) * 100),
        timeframe: "1-3 meses",
        impact: "Alto",
        category: "Engagement",
        expectedSavings: employees * avgSalary * 0.5 * 0.2
      });
    }

    // Quick wins for medium ROI
    if (currentROI >= 25 && currentROI < 100) {
      recommendations.quickWins.push({
        title: "Horarios Flexibles + Home Office",
        description: "Implementar trabajo híbrido con herramientas digitales de colaboración",
        cost: employees * 65,
        expectedROI: Math.round((employees * avgSalary * 0.15) / (employees * 65) * 100),
        timeframe: "2-6 semanas",
        impact: "Alto",
        category: "Flexibilidad",
        expectedSavings: employees * avgSalary * 0.15
      });

      recommendations.quickWins.push({
        title: "Programa de Desarrollo Profesional",
        description: "Cursos online, mentoring y plan de carrera personalizado",
        cost: employees * 120,
        expectedROI: Math.round((employees * avgSalary * 0.18) / (employees * 120) * 100),
        timeframe: "1-2 meses",
        impact: "Medio",
        category: "Desarrollo",
        expectedSavings: employees * avgSalary * 0.18
      });
    }

    // Long term investments for good ROI
    if (currentROI >= 75) {
      recommendations.longTerm.push({
        title: "Centro de Bienestar Corporativo",
        description: "Espacio físico con gimnasio, sala de relajación y servicios de salud",
        cost: employees * 800,
        expectedROI: Math.round((employees * avgSalary * 0.25) / (employees * 800) * 100),
        timeframe: "6-18 meses",
        impact: "Alto",
        category: "Infraestructura",
        expectedSavings: employees * avgSalary * 0.25
      });
    }

    // Investment optimizations
    const optimalInvestment = Math.round(programInvestment * 1.3);
    const projectedSavings = Math.round(metrics.totalSavings * 1.5);
    
    recommendations.optimizations.push({
      title: "Optimización de Inversión",
      description: `Incrementar inversión a €${optimalInvestment.toLocaleString()} para maximizar retorno`,
      cost: optimalInvestment - programInvestment,
      expectedROI: Math.round((projectedSavings - optimalInvestment) / optimalInvestment * 100),
      timeframe: "Inmediato",
      impact: "Alto",
      category: "Estrategia",
      expectedSavings: projectedSavings - metrics.totalSavings
    });

    return recommendations;
  };

  const recommendations = generateRecommendations();
  const allRecommendations = [
    ...recommendations.urgent,
    ...recommendations.quickWins,
    ...recommendations.longTerm,
    ...recommendations.optimizations
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Alto': return 'bg-green-100 text-green-800 border-green-300';
      case 'Medio': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Bajo': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Bienestar': return <CheckCircle className="h-4 w-4" />;
      case 'Engagement': return <Users className="h-4 w-4" />;
      case 'Flexibilidad': return <Clock className="h-4 w-4" />;
      case 'Desarrollo': return <TrendingUp className="h-4 w-4" />;
      case 'Infraestructura': return <Target className="h-4 w-4" />;
      case 'Estrategia': return <Calculator className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const displayedRecommendations = showAll ? allRecommendations : allRecommendations.slice(0, 3);

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            Recomendaciones Personalizadas para Maximizar ROI
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {allRecommendations.length} recomendaciones
            </Badge>
            <Button 
              onClick={() => setLoading(true)}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              <span className="ml-2">
                {loading ? 'Actualizando...' : 'Recalcular'}
              </span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedRecommendations.map((rec, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(rec.category)}
                  <h4 className="font-semibold text-foreground">{rec.title}</h4>
                  <Badge className={`text-xs border ${getImpactColor(rec.impact)}`}>
                    {rec.impact}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {rec.expectedROI}% ROI
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {rec.timeframe}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {rec.description}
              </p>
              
              <div className="grid grid-cols-3 gap-4 bg-muted/30 rounded p-3">
                <div className="text-center">
                  <div className="text-sm font-semibold text-red-600">
                    €{rec.cost.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Inversión</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-green-600">
                    €{rec.expectedSavings?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-muted-foreground">Ahorro Anual</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-blue-600">
                    €{((rec.expectedSavings || 0) - rec.cost).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Beneficio Neto</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>{rec.category}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  Ver detalles
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
          
          {allRecommendations.length > 3 && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setShowAll(!showAll)}
                className="w-full"
              >
                {showAll ? 'Ver menos' : `Ver ${allRecommendations.length - 3} recomendaciones más`}
              </Button>
            </div>
          )}
          
          {/* Summary Card */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Impacto Total Estimado
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-purple-600">
                  +{Math.round(allRecommendations.reduce((sum, rec) => sum + rec.expectedROI, 0) / allRecommendations.length)}%
                </div>
                <div className="text-xs text-purple-700">ROI Promedio</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  €{allRecommendations.reduce((sum, rec) => sum + (rec.expectedSavings || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs text-green-700">Ahorros Totales</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  €{allRecommendations.reduce((sum, rec) => sum + rec.cost, 0).toLocaleString()}
                </div>
                <div className="text-xs text-blue-700">Inversión Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {Math.round(allRecommendations.reduce((sum, rec) => sum + (rec.expectedSavings || 0), 0) / allRecommendations.reduce((sum, rec) => sum + rec.cost, 0) * 100)}%
                </div>
                <div className="text-xs text-orange-700">ROI Combinado</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};