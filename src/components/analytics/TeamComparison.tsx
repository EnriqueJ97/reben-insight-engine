import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, Users, TrendingUp, Filter, 
  ArrowUpRight, ArrowDownRight, Target,
  Award, AlertTriangle, CheckCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend
} from 'recharts';

interface TeamComparisonProps {
  reportData: any;
  period: string;
  scope: string;
}

const TeamComparison = ({ reportData, period, scope }: TeamComparisonProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState(['wellness', 'productivity', 'retention']);
  const [comparisonType, setComparisonType] = useState('all');
  const [filterBy, setFilterBy] = useState('performance');

  // Mock data de equipos (en producción vendría de reportData)
  const teams = reportData?.teams_breakdown?.map(team => ({
    ...team,
    wellness_score: team.avg_wellness || Math.random() * 100,
    productivity_score: team.participation_rate || Math.random() * 100,
    retention_rate: 95 - Math.random() * 10,
    engagement_score: 80 + Math.random() * 15,
    communication_score: 75 + Math.random() * 20,
    innovation_score: 70 + Math.random() * 25,
    department: ['Ventas', 'IT', 'Marketing', 'RRHH', 'Operaciones'][Math.floor(Math.random() * 5)],
    manager_rating: 3.5 + Math.random() * 1.5
  })) || [
    {
      team_name: 'Equipo Ventas',
      member_count: 15,
      wellness_score: 87,
      productivity_score: 92,
      retention_rate: 94,
      engagement_score: 88,
      communication_score: 85,
      innovation_score: 78,
      department: 'Ventas',
      risk_level: 'low',
      manager_rating: 4.2,
      trend: 'up'
    },
    {
      team_name: 'Equipo Desarrollo',
      member_count: 22,
      wellness_score: 72,
      productivity_score: 89,
      retention_rate: 89,
      engagement_score: 82,
      communication_score: 76,
      innovation_score: 95,
      department: 'IT',
      risk_level: 'medium',
      manager_rating: 3.8,
      trend: 'stable'
    },
    {
      team_name: 'Equipo Marketing',
      member_count: 12,
      wellness_score: 91,
      productivity_score: 85,
      retention_rate: 96,
      engagement_score: 93,
      communication_score: 90,
      innovation_score: 87,
      department: 'Marketing',
      risk_level: 'low',
      manager_rating: 4.5,
      trend: 'up'
    }
  ];

  // Datos para gráfico radar
  const radarData = [
    { metric: 'Bienestar', ...Object.fromEntries(teams.map(t => [t.team_name, t.wellness_score])) },
    { metric: 'Productividad', ...Object.fromEntries(teams.map(t => [t.team_name, t.productivity_score])) },
    { metric: 'Retención', ...Object.fromEntries(teams.map(t => [t.team_name, t.retention_rate])) },
    { metric: 'Engagement', ...Object.fromEntries(teams.map(t => [t.team_name, t.engagement_score])) },
    { metric: 'Comunicación', ...Object.fromEntries(teams.map(t => [t.team_name, t.communication_score])) },
    { metric: 'Innovación', ...Object.fromEntries(teams.map(t => [t.team_name, t.innovation_score])) }
  ];

  // Datos para gráfico de barras
  const barData = teams.map(team => ({
    name: team.team_name.replace('Equipo ', ''),
    bienestar: team.wellness_score,
    productividad: team.productivity_score,
    engagement: team.engagement_score
  }));

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
    if (score >= 80) return <Badge className="bg-blue-100 text-blue-800">Bueno</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Regular</Badge>;
    return <Badge className="bg-red-100 text-red-800">Necesita mejora</Badge>;
  };

  const sortedTeams = [...teams].sort((a, b) => {
    switch (filterBy) {
      case 'performance': return (b.productivity_score + b.wellness_score) - (a.productivity_score + a.wellness_score);
      case 'risk': return a.risk_level === 'high' ? -1 : b.risk_level === 'high' ? 1 : 0;
      case 'size': return b.member_count - a.member_count;
      default: return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Controles de Filtrado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Configuración de Comparativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Comparación</label>
              <Select value={comparisonType} onValueChange={setComparisonType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los equipos</SelectItem>
                  <SelectItem value="department">Por departamento</SelectItem>
                  <SelectItem value="size">Por tamaño</SelectItem>
                  <SelectItem value="risk">Por nivel de riesgo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ordenar por</label>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Rendimiento</SelectItem>
                  <SelectItem value="risk">Nivel de riesgo</SelectItem>
                  <SelectItem value="size">Tamaño</SelectItem>
                  <SelectItem value="trend">Tendencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico Radar de Múltiples Dimensiones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Análisis Multidimensional - Vista Radar
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparación visual de múltiples KPIs por equipo
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tickCount={5}
                />
                {teams.slice(0, 3).map((team, index) => (
                  <Radar
                    key={team.team_name}
                    name={team.team_name.replace('Equipo ', '')}
                    dataKey={team.team_name}
                    stroke={['#3b82f6', '#ef4444', '#10b981'][index]}
                    fill={['#3b82f6', '#ef4444', '#10b981'][index]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Barras Comparativo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Comparativa de KPIs Principales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[60, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="bienestar" fill="#3b82f6" name="Bienestar" />
                <Bar dataKey="productividad" fill="#10b981" name="Productividad" />
                <Bar dataKey="engagement" fill="#f59e0b" name="Engagement" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Ranking de Equipos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Ranking de Equipos - Análisis Detallado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedTeams.map((team, index) => (
              <div
                key={team.team_name}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{team.team_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {team.member_count} miembros • {team.department}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getTrendIcon(team.trend)}
                    <Badge className={getRiskColor(team.risk_level)}>
                      {team.risk_level === 'low' ? 'Bajo Riesgo' : 
                       team.risk_level === 'medium' ? 'Riesgo Medio' : 'Alto Riesgo'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bienestar</p>
                    <div className="flex items-center gap-2">
                      <Progress value={team.wellness_score} className="flex-1 h-2" />
                      <span className="text-sm font-medium w-12">{team.wellness_score.toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Productividad</p>
                    <div className="flex items-center gap-2">
                      <Progress value={team.productivity_score} className="flex-1 h-2" />
                      <span className="text-sm font-medium w-12">{team.productivity_score.toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Engagement</p>
                    <div className="flex items-center gap-2">
                      <Progress value={team.engagement_score} className="flex-1 h-2" />
                      <span className="text-sm font-medium w-12">{team.engagement_score.toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Retención</p>
                    <div className="flex items-center gap-2">
                      <Progress value={team.retention_rate} className="flex-1 h-2" />
                      <span className="text-sm font-medium w-12">{team.retention_rate.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Manager: {team.manager_rating?.toFixed(1)}/5.0</span>
                    </div>
                    {getPerformanceBadge((team.wellness_score + team.productivity_score) / 2)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {team.wellness_score >= 85 && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {team.risk_level === 'high' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    <span>Score global: {((team.wellness_score + team.productivity_score + team.engagement_score) / 3).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights y Recomendaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedTeams.slice(0, 3).map((team, index) => (
                <div key={team.team_name} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{team.team_name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {((team.wellness_score + team.productivity_score) / 2).toFixed(0)}%
                    </Badge>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Necesitan Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teams.filter(t => t.risk_level === 'medium' || t.risk_level === 'high').map((team) => (
                <div key={team.team_name} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{team.team_name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getRiskColor(team.risk_level)}>
                      {team.risk_level === 'medium' ? 'Atención' : 'Crítico'}
                    </Badge>
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamComparison;