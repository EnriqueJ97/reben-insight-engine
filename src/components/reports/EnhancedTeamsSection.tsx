import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Award,
  Activity,
  ChevronRight,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface TeamData {
  id: string;
  name: string;
  wellness_score: number;
  participation_rate: number;
  member_count: number;
  risk_level: 'low' | 'medium' | 'high';
  trend: number;
  burnout_risk: number;
  satisfaction: number;
  productivity: number;
  manager: string;
}

interface EnhancedTeamsSectionProps {
  teamData: TeamData[];
  onTeamClick?: (teamId: string) => void;
}

export const EnhancedTeamsSection = ({ teamData, onTeamClick }: EnhancedTeamsSectionProps) => {
  const [sortBy, setSortBy] = useState<'wellness' | 'participation' | 'risk'>('wellness');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'chart' | 'radar'>('grid');

  const filteredTeams = teamData
    .filter(team => filterRisk === 'all' || team.risk_level === filterRisk)
    .sort((a, b) => {
      switch (sortBy) {
        case 'wellness':
          return b.wellness_score - a.wellness_score;
        case 'participation':
          return b.participation_rate - a.participation_rate;
        case 'risk':
          const riskOrder = { low: 1, medium: 2, high: 3 };
          return riskOrder[b.risk_level] - riskOrder[a.risk_level];
        default:
          return 0;
      }
    });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Bajo Riesgo';
      case 'medium': return 'Riesgo Medio';
      case 'high': return 'Alto Riesgo';
      default: return 'Desconocido';
    }
  };

  const TopPerformerCard = ({ team }: { team: TeamData }) => (
    <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Top Performer</span>
            </div>
            <h3 className="font-semibold">{team.name}</h3>
            <p className="text-sm text-muted-foreground">{team.member_count} miembros</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">{team.wellness_score}%</div>
            <div className="text-xs text-muted-foreground">Bienestar</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TeamCard = ({ team }: { team: TeamData }) => (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => onTeamClick?.(team.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {team.name}
              </h3>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{team.member_count} miembros</span>
              <span>•</span>
              <span>{team.manager}</span>
            </div>
          </div>
          <Badge className={`${getRiskColor(team.risk_level)} border`}>
            {getRiskLabel(team.risk_level)}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Bienestar General</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold">{team.wellness_score}%</span>
                {team.trend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : team.trend < 0 ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : null}
              </div>
            </div>
            <Progress value={team.wellness_score} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Participación</span>
              <div className="font-medium">{team.participation_rate}%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Satisfacción</span>
              <div className="font-medium">{team.satisfaction}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const radarData = filteredTeams.slice(0, 5).map(team => ({
    team: team.name, // Mostrar nombre completo del equipo
    bienestar: team.wellness_score,
    satisfaccion: team.satisfaction,
    productividad: team.productivity,
    participacion: team.participation_rate,
  }));

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Análisis por Equipos</h3>
          <p className="text-sm text-muted-foreground">
            Rendimiento y bienestar de cada equipo en tiempo real
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Users className="h-4 w-4 mr-1" />
            Tarjetas
          </Button>
          <Button
            variant={viewMode === 'chart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('chart')}
          >
            <BarChart className="h-4 w-4 mr-1" />
            Gráfico
          </Button>
          <Button
            variant={viewMode === 'radar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('radar')}
          >
            <Target className="h-4 w-4 mr-1" />
            Radar
          </Button>
        </div>
      </div>

      {/* Filters and sorting */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={sortBy === 'wellness' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('wellness')}
        >
          <ArrowUpDown className="h-3 w-3 mr-1" />
          Por Bienestar
        </Button>
        <Button
          variant={sortBy === 'participation' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('participation')}
        >
          <Activity className="h-3 w-3 mr-1" />
          Por Participación
        </Button>
        <Button
          variant={sortBy === 'risk' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('risk')}
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Por Riesgo
        </Button>
        
        <div className="h-4 w-px bg-border mx-2" />
        
        <Button
          variant={filterRisk === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterRisk('all')}
        >
          Todos
        </Button>
        <Button
          variant={filterRisk === 'high' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterRisk('high')}
        >
          <Filter className="h-3 w-3 mr-1" />
          Alto Riesgo
        </Button>
      </div>

      {/* Top performer highlight */}
      {filteredTeams.length > 0 && (
        <TopPerformerCard team={filteredTeams[0]} />
      )}

      {/* Content based on view mode */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}

      {viewMode === 'chart' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Comparativa de Equipos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredTeams} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <Card className="border shadow-lg">
                          <CardContent className="p-3">
                            <p className="font-medium mb-2">{label}</p>
                            {payload.map((entry, index) => (
                              <p key={index} className="text-sm" style={{ color: entry.color }}>
                                Bienestar: {entry.value}%
                              </p>
                            ))}
                          </CardContent>
                        </Card>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="wellness_score" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {viewMode === 'radar' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Análisis Multidimensional (Top 5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="team" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={0} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Equipos"
                  dataKey="bienestar"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Comparativa de bienestar entre los equipos con mejor rendimiento
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{filteredTeams.length}</div>
            <div className="text-sm text-muted-foreground">Equipos Analizados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {Math.round(filteredTeams.reduce((acc, team) => acc + team.wellness_score, 0) / filteredTeams.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Bienestar Promedio</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {filteredTeams.filter(team => team.risk_level === 'high').length}
            </div>
            <div className="text-sm text-muted-foreground">Equipos Alto Riesgo</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(filteredTeams.reduce((acc, team) => acc + team.participation_rate, 0) / filteredTeams.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Participación Media</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};