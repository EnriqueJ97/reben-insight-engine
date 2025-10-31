import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useTeamReports } from '@/hooks/useTeamReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building, Shield, TrendingUp, Users, BarChart3, 
  Zap, GitCompare, Scale, Clock, MessageSquare,
  Download, RefreshCw, AlertTriangle, Activity, BookOpen
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
    <div className="container mx-auto py-8 space-y-6 animate-fade-in">
      {/* Enhanced Visual Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 p-8 mb-8 border border-primary/20">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 hover-scale">
                <Building className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Análisis Organizacional Avanzado
                </h1>
                <p className="text-muted-foreground text-lg">
                  Insights estratégicos y correlaciones profundas para la toma de decisiones
                </p>
              </div>
            </div>
            
            {/* Controls Section */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 p-1 bg-background/50 backdrop-blur-sm rounded-lg border">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32 border-0 bg-transparent hover:bg-accent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30d">📅 30 días</SelectItem>
                    <SelectItem value="90d">📅 90 días</SelectItem>
                    <SelectItem value="180d">📅 6 meses</SelectItem>
                    <SelectItem value="365d">📅 1 año</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedScope} onValueChange={setSelectedScope}>
                  <SelectTrigger className="w-44 border-0 bg-transparent hover:bg-accent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🏢 Toda la organización</SelectItem>
                    <SelectItem value="departments">📊 Por departamentos</SelectItem>
                    <SelectItem value="regions">🌍 Por regiones</SelectItem>
                    <SelectItem value="seniority">👥 Por seniority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleRefreshAnalysis}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="hover-scale"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>

                <Button 
                  onClick={() => handleExportReport('pdf')}
                  variant="outline"
                  size="sm"
                  className="hover-scale"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>

                <Link to="/dashboard/reben-explained">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Cómo Funciona
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Global KPIs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="group hover:shadow-xl transition-all duration-300 hover-scale border-l-4 border-l-green-500 bg-gradient-to-br from-green-500/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-500/10 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Salud Global</p>
              <p className="text-3xl font-bold text-green-600 mb-2">87%</p>
              <Badge variant="outline" className="text-green-700 bg-green-50/50">
                +5% vs anterior
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover-scale border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">Activo</span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Correlaciones</p>
              <p className="text-3xl font-bold text-blue-600 mb-2">23</p>
              <Badge variant="outline" className="text-blue-700 bg-blue-50/50">
                12 críticas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover-scale border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-500/10 group-hover:scale-110 transition-transform">
                <GitCompare className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                {Math.round((reportData?.team_breakdown?.filter(t => t.risk_level === 'low').length || 0) / (reportData?.team_breakdown?.length || 1) * 100)}%
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Equipos</p>
              <p className="text-3xl font-bold text-purple-600 mb-2">{reportData?.team_breakdown?.length || 0}</p>
              <Badge variant="outline" className="text-purple-700 bg-purple-50/50">
                Bajo riesgo
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover-scale border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-500/10 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Predicción 6M</p>
              <p className="text-3xl font-bold text-orange-600 mb-2">92%</p>
              <Badge variant="outline" className="text-orange-700 bg-orange-50/50">
                Retención
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Access Cards */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1 w-12 bg-gradient-to-r from-primary to-transparent rounded-full" />
          <h2 className="text-xl font-semibold">Acceso Rápido</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setSelectedScope('correlations')}
            className="group relative p-6 rounded-xl border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-primary/5 to-transparent text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Correlaciones</h3>
              <p className="text-sm text-muted-foreground">Descubre patrones entre métricas clave</p>
            </div>
          </button>

          <button 
            onClick={() => setSelectedScope('comparison')}
            className="group relative p-6 rounded-xl border-2 border-border hover:border-blue-500 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-blue-500/5 to-transparent text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="p-3 rounded-xl bg-blue-500/10 w-fit mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <GitCompare className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Comparativas</h3>
              <p className="text-sm text-muted-foreground">Compara equipos y departamentos</p>
            </div>
          </button>

          <button 
            onClick={() => setSelectedScope('attrition-prediction')}
            className="group relative p-6 rounded-xl border-2 border-border hover:border-orange-500 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-orange-500/5 to-transparent text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="p-3 rounded-xl bg-orange-500/10 w-fit mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Predicción Rotación</h3>
              <p className="text-sm text-muted-foreground">Identifica riesgos de salida</p>
            </div>
          </button>

          <button 
            onClick={() => setSelectedScope('trends')}
            className="group relative p-6 rounded-xl border-2 border-border hover:border-purple-500 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-purple-500/5 to-transparent text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="p-3 rounded-xl bg-purple-500/10 w-fit mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Tendencias</h3>
              <p className="text-sm text-muted-foreground">Evolución temporal de métricas</p>
            </div>
          </button>
        </div>
      </div>

      {/* Simplified Tabs */}
      <Tabs defaultValue="correlations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 h-auto p-2">
          <TabsTrigger value="correlations" className="flex items-center gap-2 py-3">
            <Zap className="w-4 h-4" />
            <span>Correlaciones</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2 py-3">
            <GitCompare className="w-4 h-4" />
            <span>Comparativas</span>
          </TabsTrigger>
          <TabsTrigger value="diversity" className="flex items-center gap-2 py-3">
            <Scale className="w-4 h-4" />
            <span>Diversidad</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2 py-3">
            <Clock className="w-4 h-4" />
            <span>Tendencias</span>
          </TabsTrigger>
          <TabsTrigger value="advanced-wellness" className="flex items-center gap-2 py-3">
            <Activity className="w-4 h-4" />
            <span>Wellness</span>
          </TabsTrigger>
          <TabsTrigger value="attrition-prediction" className="flex items-center gap-2 py-3">
            <Users className="w-4 h-4" />
            <span>Rotación</span>
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

        <TabsContent value="advanced-wellness" className="space-y-6">
          <MultifactorialWellnessPanel 
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
      </Tabs>
    </div>
  );
};

export default AdvancedOrganizationalAnalytics;