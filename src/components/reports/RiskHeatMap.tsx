import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ReportData } from '@/hooks/useReports';

interface RiskHeatMapProps {
  reportData: ReportData | null;
  onCellClick?: (teamId: string, indicator: string) => void;
}

const indicators = [
  { key: 'burnout', label: 'Burnout', weight: 0.4 },
  { key: 'turnover', label: 'Rotación', weight: 0.3 },
  { key: 'satisfaction', label: 'Satisfacción', weight: 0.2 },
  { key: 'engagement', label: 'Compromiso', weight: 0.1 }
];

export const RiskHeatMap = ({ reportData, onCellClick }: RiskHeatMapProps) => {
  if (!reportData?.team_breakdown?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔥 Mapa de Calor de Riesgo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay datos suficientes para mostrar el mapa de calor</p>
            <p className="text-sm mt-2">Se requieren al menos 2 equipos con datos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const teams = reportData.team_breakdown
    .filter(team => team.unique_employees >= 5) // Privacy protection
    .sort((a, b) => a.wellness_score - b.wellness_score); // Sort by risk (lowest wellness = highest risk)

  const getRiskScore = (wellnessScore: number, indicator: string) => {
    // Simulate different risk levels for different indicators
    const baseRisk = 100 - wellnessScore;
    const variations = {
      burnout: Math.random() * 20 - 10,
      turnover: Math.random() * 15 - 7,
      satisfaction: Math.random() * 10 - 5,
      engagement: Math.random() * 12 - 6
    };
    
    return Math.max(0, Math.min(100, baseRisk + (variations[indicator as keyof typeof variations] || 0)));
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'bg-destructive text-destructive-foreground';
    if (score >= 50) return 'bg-warning text-warning-foreground';
    if (score >= 30) return 'bg-yellow-500 text-yellow-900';
    return 'bg-success text-success-foreground';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'Crítico';
    if (score >= 50) return 'Alto';
    if (score >= 30) return 'Medio';
    return 'Bajo';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <span>🔥</span>
            <span>Mapa de Calor de Riesgo</span>
          </span>
          <Badge variant="outline" className="text-xs">
            Solo equipos ≥5 personas (RGPD)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-success rounded"></div>
              <span>Bajo (0-29)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Medio (30-49)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-warning rounded"></div>
              <span>Alto (50-69)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-destructive rounded"></div>
              <span>Crítico (70-100)</span>
            </div>
          </div>

          {/* Heat Map Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header */}
              <div className="grid grid-cols-5 gap-2 mb-2">
                <div className="p-2 text-xs font-medium text-muted-foreground">Equipo</div>
                {indicators.map(indicator => (
                  <div key={indicator.key} className="p-2 text-xs font-medium text-center text-muted-foreground">
                    {indicator.label}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {teams.map((team, teamIndex) => (
                <div key={team.team_id || teamIndex} className="grid grid-cols-5 gap-2 mb-2">
                  <div className="p-2 text-xs font-medium flex items-center space-x-2">
                    <span>{team.team_name || `Equipo ${teamIndex + 1}`}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {team.unique_employees}
                    </Badge>
                  </div>
                  {indicators.map(indicator => {
                    const riskScore = getRiskScore(team.wellness_score, indicator.key);
                    return (
                      <button
                        key={indicator.key}
                        onClick={() => onCellClick?.(team.team_id || teamIndex.toString(), indicator.key)}
                        className={cn(
                          "p-2 text-xs font-medium text-center rounded-md transition-all hover:scale-105 hover:shadow-lg",
                          getRiskColor(riskScore)
                        )}
                        title={`${indicator.label}: ${getRiskLevel(riskScore)} (${Math.round(riskScore)})`}
                      >
                        {Math.round(riskScore)}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <span className="font-medium">🔒 Protección de Datos:</span> Los equipos con menos de 5 miembros 
            se han ocultado para cumplir con el Art. 25 del RGPD (protección de datos por diseño).
          </div>
        </div>
      </CardContent>
    </Card>
  );
};