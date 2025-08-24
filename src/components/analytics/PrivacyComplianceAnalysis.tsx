import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Shield, Lock, FileCheck, AlertTriangle, 
  CheckCircle, Download, Calendar, Users,
  Eye, EyeOff, Database, Key
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface PrivacyComplianceAnalysisProps {
  reportData: any;
  period: string;
  scope: string;
}

const PrivacyComplianceAnalysis = ({ reportData, period, scope }: PrivacyComplianceAnalysisProps) => {
  // Mock data de compliance (en producción vendría de la API)
  const complianceMetrics = {
    rgpd: {
      overallScore: 94,
      dataMinimization: 96,
      consentManagement: 92,
      dataRetention: 98,
      rightToErasure: 90,
      dataPortability: 88,
      breachNotification: 100
    },
    csrd: {
      overallScore: 87,
      socialData: 89,
      governanceData: 85,
      environmentalData: 91,
      materialityAssessment: 82,
      doubleAssurance: 90
    },
    audits: {
      completed: 4,
      pending: 1,
      findings: 7,
      resolved: 6,
      lastAudit: '2024-11-15'
    },
    dataRequests: {
      total: 23,
      fulfilled: 21,
      pending: 2,
      avgResponseTime: 3.2,
      types: {
        access: 12,
        rectification: 6,
        erasure: 4,
        portability: 1
      }
    }
  };

  // Configuraciones de privacidad activas
  const privacySettings = {
    anonymization: {
      enabled: true,
      threshold: 5, // mínimo de personas para mostrar datos agregados
      coverage: 98 // % de datos cubiertos
    },
    dataAccess: {
      managers: { salary: false, personal: true, performance: true },
      hr: { salary: true, personal: true, performance: true },
      individual: { own: true, team: false, org: false }
    },
    retention: {
      checkins: '24 months',
      alerts: '12 months',
      reports: '60 months',
      audit_logs: '84 months'
    }
  };

  // Datos para gráficos
  const rgpdData = Object.entries(complianceMetrics.rgpd)
    .filter(([key]) => key !== 'overallScore')
    .map(([key, value]) => ({
      name: key.replace(/([A-Z])/g, ' $1').toLowerCase(),
      score: value,
      benchmark: 85 // benchmark mínimo
    }));

  const csrdData = Object.entries(complianceMetrics.csrd)
    .filter(([key]) => key !== 'overallScore')
    .map(([key, value]) => ({
      name: key.replace(/([A-Z])/g, ' $1').toLowerCase(),
      score: value
    }));

  const requestsData = Object.entries(complianceMetrics.dataRequests.types).map(([type, count]) => ({
    name: type,
    value: count,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][Object.keys(complianceMetrics.dataRequests.types).indexOf(type)]
  }));

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-100';
    if (score >= 85) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAccessIcon = (allowed: boolean) => {
    return allowed ? 
      <Eye className="w-4 h-4 text-green-500" /> : 
      <EyeOff className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Métricas Principales de Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">RGPD Score</p>
                <p className="text-2xl font-bold text-green-600">{complianceMetrics.rgpd.overallScore}%</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-800">
                Cumplimiento Excelente
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CSRD Preparación</p>
                <p className="text-2xl font-bold text-blue-600">{complianceMetrics.csrd.overallScore}%</p>
              </div>
              <FileCheck className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge className="bg-blue-100 text-blue-800">
                En progreso
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Auditorías</p>
                <p className="text-2xl font-bold text-purple-600">{complianceMetrics.audits.completed}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Badge className="bg-purple-100 text-purple-800">
                {complianceMetrics.audits.resolved}/{complianceMetrics.audits.findings} resueltas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Solicitudes RGPD</p>
                <p className="text-2xl font-bold text-orange-600">{complianceMetrics.dataRequests.total}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <Badge className="bg-orange-100 text-orange-800">
                {complianceMetrics.dataRequests.avgResponseTime} días promedio
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis RGPD Detallado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Cumplimiento RGPD - Análisis Detallado
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Evaluación de cada pilar del Reglamento General de Protección de Datos
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rgpdData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis domain={[70, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" name="Score actual" />
                <Bar dataKey="benchmark" fill="#94a3b8" name="Mínimo requerido" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Fortalezas Identificadas
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 border rounded bg-green-50">
                  <span className="text-sm">Notificación de brechas</span>
                  <Badge className="bg-green-600 text-white">100%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded bg-green-50">
                  <span className="text-sm">Retención de datos</span>
                  <Badge className="bg-green-600 text-white">98%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded bg-green-50">
                  <span className="text-sm">Minimización de datos</span>
                  <Badge className="bg-green-600 text-white">96%</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Áreas de Mejora
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 border rounded bg-orange-50">
                  <span className="text-sm">Portabilidad de datos</span>
                  <Badge className="bg-orange-100 text-orange-800">88%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded bg-orange-50">
                  <span className="text-sm">Derecho al olvido</span>
                  <Badge className="bg-orange-100 text-orange-800">90%</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Solicitudes de Datos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Solicitudes de Datos RGPD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={requestsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {requestsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded">
                <span className="font-medium">Total procesadas</span>
                <Badge className="bg-green-100 text-green-800">
                  {complianceMetrics.dataRequests.fulfilled}/{complianceMetrics.dataRequests.total}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <span className="font-medium">Tiempo promedio</span>
                <Badge variant="outline">
                  {complianceMetrics.dataRequests.avgResponseTime} días
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <span className="font-medium">Pendientes</span>
                <Badge className={complianceMetrics.dataRequests.pending > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                  {complianceMetrics.dataRequests.pending}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Control de Acceso a Datos
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configuración actual de permisos por rol
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Managers</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Datos salariales</span>
                    {getAccessIcon(privacySettings.dataAccess.managers.salary)}
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Datos personales</span>
                    {getAccessIcon(privacySettings.dataAccess.managers.personal)}
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Datos de rendimiento</span>
                    {getAccessIcon(privacySettings.dataAccess.managers.performance)}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">HR Admin</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Acceso completo</span>
                    {getAccessIcon(true)}
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">Auditoría habilitada</span>
                    {getAccessIcon(true)}
                  </div>
                </div>
              </div>
            </div>

            <Alert className="mt-4">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Los datos se anonimizan automáticamente para equipos con menos de {privacySettings.anonymization.threshold} miembros.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* CSRD Preparación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary" />
            Preparación CSRD (Corporate Sustainability Reporting Directive)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Estado de preparación para la normativa de sostenibilidad corporativa
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={csrdData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[70, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-2">Datos Sociales</h4>
              <Progress value={complianceMetrics.csrd.socialData} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Métricas de bienestar, diversidad y condiciones laborales
              </p>
            </div>
            
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-2">Gobernanza</h4>
              <Progress value={complianceMetrics.csrd.governanceData} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Estructura organizacional y políticas de gestión
              </p>
            </div>
            
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-2">Datos Ambientales</h4>
              <Progress value={complianceMetrics.csrd.environmentalData} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Impacto ambiental y políticas de sostenibilidad
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones Recomendadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Plan de Acción de Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Acciones Inmediatas (30 días)</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded bg-red-50">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Mejorar portabilidad de datos</p>
                    <p className="text-xs text-muted-foreground">
                      Implementar API de exportación automatizada
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded bg-yellow-50">
                  <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Completar auditoría pendiente</p>
                    <p className="text-xs text-muted-foreground">
                      Revisión de políticas de retención de datos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Mejoras a Largo Plazo (6 meses)</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded bg-blue-50">
                  <FileCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Certificación CSRD completa</p>
                    <p className="text-xs text-muted-foreground">
                      Alcanzar 95% en todos los pilares de sostenibilidad
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded bg-green-50">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Automatización de compliance</p>
                    <p className="text-xs text-muted-foreground">
                      Sistema de monitoreo continuo y alertas automáticas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Generar Reporte RGPD
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Exportar Datos CSRD
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyComplianceAnalysis;