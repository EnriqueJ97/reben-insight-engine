import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamReports } from '@/hooks/useTeamReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building, Shield, TrendingUp, Users, BarChart3, 
  Zap, GitCompare, Scale, Clock, MessageSquare,
  Download, RefreshCw, AlertTriangle, Activity
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CorrelationAnalysis from './CorrelationAnalysis';
import TeamComparison from './TeamComparison';
import DiversityEquityAnalysis from './DiversityEquityAnalysis';
import LongTermTrends from './LongTermTrends';
import PrivacyComplianceAnalysis from './PrivacyComplianceAnalysis';
import QualitativeAnalysis from './QualitativeAnalysis';
import MultifactorialWellnessPanel from './MultifactorialWellnessPanel';
import AnomalyDetectionPanel from './AnomalyDetectionPanel';
import DynamicBenchmarkPanel from './DynamicBenchmarkPanel';
import AttritionPredictionPanel from './AttritionPredictionPanel';

const AdvancedOrganizationalAnalytics = () => {
  const { user } = useAuth();
  const { loading, reportData, getTeamReports } = useTeamReports();
  const [selectedPeriod, setSelectedPeriod] = useState('90d');
  const [selectedScope, setSelectedScope] = useState('all');

  if (user?.role !== 'HR_ADMIN') {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Solo los administradores HR pueden acceder al análisis organizacional avanzado.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleRefreshAnalysis = () => {
    getTeamReports(selectedPeriod);
  };

  const handleExportReport = async (format: 'pdf' | 'excel' | 'json') => {
    // Implementar exportación
    console.log(`Exporting report in ${format} format`);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Análisis Organizacional Avanzado</h1>
            <p className="text-muted-foreground">
              Insights estratégicos y correlaciones profundas para la toma de decisiones
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
              <SelectItem value="180d">6 meses</SelectItem>
              <SelectItem value="365d">1 año</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedScope} onValueChange={setSelectedScope}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda la organización</SelectItem>
              <SelectItem value="departments">Por departamentos</SelectItem>
              <SelectItem value="regions">Por regiones</SelectItem>
              <SelectItem value="seniority">Por seniority</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={handleRefreshAnalysis}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

          <Button 
            onClick={() => handleExportReport('pdf')}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Global KPIs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Salud Global</p>
                <p className="text-2xl font-bold text-green-600">87%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-700 bg-green-50">
                +5% vs período anterior
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Correlaciones Activas</p>
                <p className="text-2xl font-bold text-blue-600">23</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-blue-700 bg-blue-50">
                12 críticas identificadas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Equipos Analizados</p>
                <p className="text-2xl font-bold text-purple-600">{reportData?.team_breakdown?.length || 0}</p>
              </div>
              <GitCompare className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-purple-700 bg-purple-50">
                {Math.round((reportData?.team_breakdown?.filter(t => t.risk_level === 'low').length || 0) / (reportData?.team_breakdown?.length || 1) * 100)}% bajo riesgo
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Predicción 6M</p>
                <p className="text-2xl font-bold text-orange-600">92%</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-orange-700 bg-orange-50">
                Retención proyectada
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Tabs */}
      <Tabs defaultValue="correlations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-1">
          <TabsTrigger value="correlations" className="flex items-center gap-1 text-xs">
            <Zap className="w-3 h-3" />
            <span className="hidden sm:inline">Correlaciones</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-1 text-xs">
            <GitCompare className="w-3 h-3" />
            <span className="hidden sm:inline">Comparativas</span>
          </TabsTrigger>
          <TabsTrigger value="diversity" className="flex items-center gap-1 text-xs">
            <Scale className="w-3 h-3" />
            <span className="hidden sm:inline">Diversidad</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3" />
            <span className="hidden sm:inline">Tendencias</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-1 text-xs">
            <Shield className="w-3 h-3" />
            <span className="hidden sm:inline">Privacidad</span>
          </TabsTrigger>
          <TabsTrigger value="qualitative" className="flex items-center gap-1 text-xs">
            <MessageSquare className="w-3 h-3" />
            <span className="hidden sm:inline">Cualitativo</span>
          </TabsTrigger>
          <TabsTrigger value="advanced-wellness" className="flex items-center gap-1 text-xs">
            <Activity className="w-3 h-3" />
            <span className="hidden md:inline">Wellness</span>
          </TabsTrigger>
          <TabsTrigger value="anomaly-detection" className="flex items-center gap-1 text-xs">
            <AlertTriangle className="w-3 h-3" />
            <span className="hidden md:inline">Anomalías</span>
          </TabsTrigger>
          <TabsTrigger value="dynamic-benchmark" className="flex items-center gap-1 text-xs">
            <BarChart3 className="w-3 h-3" />
            <span className="hidden lg:inline">Benchmarks</span>
          </TabsTrigger>
          <TabsTrigger value="attrition-prediction" className="flex items-center gap-1 text-xs">
            <Users className="w-3 h-3" />
            <span className="hidden lg:inline">Rotación</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="correlations" className="space-y-6">
          <CorrelationAnalysis 
            reportData={reportData} 
            period={selectedPeriod}
            scope={selectedScope}
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <TeamComparison 
            reportData={reportData} 
            period={selectedPeriod}
            scope={selectedScope}
          />
        </TabsContent>

        <TabsContent value="diversity" className="space-y-6">
          <DiversityEquityAnalysis 
            reportData={reportData} 
            period={selectedPeriod}
            scope={selectedScope}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <LongTermTrends 
            reportData={reportData} 
            period={selectedPeriod}
            scope={selectedScope}
          />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <PrivacyComplianceAnalysis 
            reportData={reportData} 
            period={selectedPeriod}
            scope={selectedScope}
          />
        </TabsContent>

        <>
          {/* New Analytics Tabs */}
          <TabsContent value="advanced-wellness" className="space-y-6">
            <MultifactorialWellnessPanel 
              period={selectedPeriod}
              scope={selectedScope}
            />
          </TabsContent>

          <TabsContent value="anomaly-detection" className="space-y-6">
            <AnomalyDetectionPanel 
              period={selectedPeriod}
              scope={selectedScope}
            />
          </TabsContent>

          <TabsContent value="dynamic-benchmark" className="space-y-6">
            <DynamicBenchmarkPanel 
              period={selectedPeriod}
              scope={selectedScope}
            />
          </TabsContent>

          <TabsContent value="attrition-prediction" className="space-y-6">
            <AttritionPredictionPanel 
              period={selectedPeriod}
              scope={selectedScope}
            />
          </TabsContent>
        </>
      </Tabs>
    </div>
  );
};

export default AdvancedOrganizationalAnalytics;