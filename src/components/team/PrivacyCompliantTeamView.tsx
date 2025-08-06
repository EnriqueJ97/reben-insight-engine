import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Shield, Eye, EyeOff } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  wellnessScore: number | null;
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  lastCheckin: Date | null;
  alertCount: number;
  participationRate: number;
  hasConsent?: boolean; // Para verificar consentimiento de datos individuales
}

interface PrivacyCompliantTeamViewProps {
  teamMembers: TeamMember[];
  userRole: 'MANAGER' | 'HR_ADMIN' | 'COMPLIANCE_OFFICER';
  teamSize: number;
  className?: string;
}

export const PrivacyCompliantTeamView = ({ 
  teamMembers, 
  userRole, 
  teamSize,
  className 
}: PrivacyCompliantTeamViewProps) => {
  // Regla 5-k: Solo mostrar datos granulares si hay ≥5 personas con datos
  const membersWithData = teamMembers.filter(m => m.wellnessScore !== null);
  const canShowIndividualData = membersWithData.length >= 5;
  
  // Verificar si el usuario puede ver datos sensibles detallados
  const canViewSensitiveData = userRole === 'HR_ADMIN' || userRole === 'COMPLIANCE_OFFICER';

  const getPrivacyCompliantRiskLevel = (member: TeamMember): string => {
    if (!canShowIndividualData && !canViewSensitiveData) {
      return 'Datos insuficientes para preservar confidencialidad';
    }

    if (!member.hasConsent && !canViewSensitiveData) {
      return 'Sin autorización'; 
    }

    switch (member.riskLevel) {
      case 'low': return 'Situación OK';
      case 'medium': return 'Requiere Atención';
      case 'high': return 'Prioritario';
      case 'unknown': return 'Sin datos';
      default: return 'No evaluado';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      case 'unknown': return '⚪';
      default: return '⚫';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-success/20 text-success border-success/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'unknown': return 'bg-muted/20 text-muted-foreground border-muted/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const formatPrivacyCompliantCheckin = (lastCheckin: Date | null): string => {
    if (!lastCheckin) return 'Sin registros';
    
    const days = Math.floor((Date.now() - lastCheckin.getTime()) / (1000 * 60 * 60 * 24));
    
    // Evitar "shaming" con rangos en lugar de fechas exactas
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days <= 7) return 'Esta semana';
    if (days <= 30) return 'Este mes';
    return '>30 días';
  };

  return (
    <TooltipProvider>
      <div className={`space-y-4 ${className}`}>
        {/* Aviso de privacidad */}
        <Alert className="border-info/30 bg-info/5">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Protección de Datos:</strong> Los indicadores de bienestar se muestran según RGPD. 
            No se usan para evaluación de desempeño. 
            {!canShowIndividualData && (
              <span className="ml-2 font-medium">
                Datos individuales ocultos por tamaño de muestra insuficiente (&lt;5 personas con datos).
              </span>
            )}
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>Estado del Equipo</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Datos agregados según RGPD Art. 5 (minimización). 
                      Los indicadores reflejan patrones de cansancio para prevención de riesgos laborales.
                      Solo personal autorizado accede a datos granulares.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {canShowIndividualData ? (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Datos individuales autorizados
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Modo agregado (privacidad)
                    </>
                  )}
                </Badge>
                <Badge variant="secondary">{teamSize} personas</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Último check-in: {formatPrivacyCompliantCheckin(member.lastCheckin)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    {/* Indicador de nivel (no score exacto) */}
                    <div className="text-center">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">
                          {getRiskIcon(member.riskLevel)}
                        </span>
                        {canViewSensitiveData && member.wellnessScore !== null && (
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-xs text-muted-foreground cursor-help">
                                ({member.wellnessScore}%)
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Score detallado (solo RRHH/Compliance)</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <Badge className={getRiskColor(member.riskLevel)}>
                        {getPrivacyCompliantRiskLevel(member)}
                      </Badge>
                    </div>
                    
                    {/* Participación */}
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {member.participationRate >= 70 ? (
                          <Badge className="bg-success/20 text-success">Alta</Badge>
                        ) : member.participationRate >= 40 ? (
                          <Badge className="bg-warning/20 text-warning">Media</Badge>
                        ) : (
                          <Badge className="bg-destructive/20 text-destructive">Baja</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Participación
                      </div>
                      {canViewSensitiveData && (
                        <div className="text-xs text-muted-foreground">
                          {member.participationRate}%
                        </div>
                      )}
                    </div>
                    
                    {/* Alertas si las hay */}
                    {member.alertCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {member.alertCount} alerta{member.alertCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                    
                    {/* Acción recomendada */}
                    <div className="text-center">
                      {member.riskLevel === 'high' ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge className="bg-destructive/20 text-destructive cursor-help">
                              Contactar RRHH
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              Derivar a Recursos Humanos para seguimiento especializado
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ) : member.riskLevel === 'medium' ? (
                        <Badge className="bg-warning/20 text-warning">
                          Seguimiento 1:1
                        </Badge>
                      ) : (
                        <Badge className="bg-success/20 text-success">
                          Mantener
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Nota legal al pie */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-start space-x-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Cumplimiento RGPD:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Datos tratados únicamente para prevención de riesgos laborales</li>
                    <li>• Acceso logged y auditado según Art. 25, 30 RGPD</li>
                    <li>• Consentimiento granular requerido para datos individuales detallados</li>
                    {!canShowIndividualData && (
                      <li>• Anonimización automática aplicada por tamaño de muestra</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};