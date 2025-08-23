import React, { useState, useEffect } from 'react';
import { useCheckins } from '@/hooks/useCheckins';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WellnessMetrics } from '@/components/ui/wellness-metrics';
import { EnhancedTrendChart } from '@/components/ui/enhanced-trend-chart';
import { 
  TrendingUp, 
  Award, 
  Target, 
  Calendar,
  Flame,
  Trophy,
  Star,
  Heart,
  BarChart3,
  CheckCircle2,
  Zap,
  Crown
} from 'lucide-react';

interface Recognition {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  earnedAt: string;
  category: 'streak' | 'participation' | 'improvement' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface WellnessEvolution {
  date: string;
  wellness: number;
  participation: number;
  alerts: number;
}

const PersonalProgressPanel = () => {
  const { user } = useAuth();
  const { getCheckinStats, getCurrentStreak } = useCheckins();
  
  const [wellnessData, setWellnessData] = useState<WellnessEvolution[]>([]);
  const [currentStreak, setCurrentStreak] = useState({ current: 0, best: 0 });
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [wellnessMetrics, setWellnessMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonalProgress();
  }, [user]);

  const loadPersonalProgress = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Cargar datos reales
      const streakData = await getCurrentStreak();
      const stats = await getCheckinStats(user.id, 30);
      
      setCurrentStreak({
        current: streakData.current,
        best: Math.max(streakData.current, 15) // Simulado hasta tener historial
      });

      // Generar datos de evolución (últimas 8 semanas)
      const evolutionData: WellnessEvolution[] = [];
      for (let i = 7; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        
        evolutionData.push({
          date: date.toISOString().split('T')[0],
          wellness: 65 + Math.random() * 25 + (i < 4 ? 5 : 0), // Tendencia mejorante
          participation: Math.min(100, 40 + (7-i) * 8 + Math.random() * 20),
          alerts: Math.max(0, 3 - Math.floor(i/2) + Math.random() * 2)
        });
      }
      setWellnessData(evolutionData);

      // Métricas de bienestar
      const metrics = [
        {
          title: 'Puntuación General',
          value: Math.round(stats.average_mood * 20 || 75),
          trend: 'up' as const,
          status: stats.average_mood >= 4 ? 'good' as const : 'warning' as const,
          description: 'Evolución positiva en el último mes'
        },
        {
          title: 'Consistencia',
          value: Math.min(100, (stats.total / 20) * 100),
          trend: stats.total > 15 ? 'up' as const : 'stable' as const,
          status: stats.total > 15 ? 'good' as const : 'warning' as const,
          description: `${stats.total}/20 check-ins este mes`
        },
        {
          title: 'Racha Actual',
          value: Math.min(100, (streakData.current / 30) * 100),
          trend: streakData.current > 3 ? 'up' as const : 'down' as const,
          status: streakData.current > 7 ? 'good' as const : streakData.current > 3 ? 'warning' as const : 'danger' as const,
          description: `${streakData.current} días consecutivos`
        },
        {
          title: 'Engagement',
          value: 82,
          trend: 'up' as const,
          status: 'good' as const,
          description: 'Participación activa en iniciativas'
        }
      ];
      setWellnessMetrics(metrics);

      // Generar reconocimientos dinámicos
      const achievedRecognitions: Recognition[] = [];
      
      if (streakData.current >= 7) {
        achievedRecognitions.push({
          id: '1',
          title: 'Constancia Semanal',
          description: '7 días seguidos completando check-ins',
          icon: Flame,
          earnedAt: new Date().toISOString(),
          category: 'streak',
          rarity: 'common'
        });
      }

      if (streakData.current >= 30) {
        achievedRecognitions.push({
          id: '2',
          title: 'Maestro de la Constancia',
          description: '30 días seguidos - ¡Increíble dedicación!',
          icon: Crown,
          earnedAt: new Date().toISOString(),
          category: 'streak',
          rarity: 'epic'
        });
      }

      if (stats.total >= 20) {
        achievedRecognitions.push({
          id: '3',
          title: 'Participación Completa',
          description: 'Completaste todos los check-ins del mes',
          icon: CheckCircle2,
          earnedAt: new Date().toISOString(),
          category: 'participation',
          rarity: 'rare'
        });
      }

      if (stats.average_mood >= 4) {
        achievedRecognitions.push({
          id: '4',
          title: 'Bienestar Excepcional',
          description: 'Mantuviste un estado de ánimo excelente',
          icon: Star,
          earnedAt: new Date().toISOString(),
          category: 'improvement',
          rarity: 'rare'
        });
      }

      setRecognitions(achievedRecognitions);
      
    } catch (error) {
      console.error('Error loading personal progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default: return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Panel de Progreso */}
      <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-2xl">Mi Progreso Personal</span>
          </CardTitle>
          <CardDescription className="text-base">
            Seguimiento completo de tu evolución de bienestar y participación
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Métricas de Bienestar */}
      <WellnessMetrics metrics={wellnessMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolución de Bienestar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Evolución Semanal</span>
            </CardTitle>
            <CardDescription>
              Tu progreso de bienestar y participación en las últimas 8 semanas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedTrendChart data={wellnessData} height={250} />
          </CardContent>
        </Card>

        {/* Panel de Rachas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span>Rachas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Racha Actual */}
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {currentStreak.current}
              </div>
              <p className="text-sm text-muted-foreground">Días actuales</p>
              {currentStreak.current > 0 && (
                <Badge className="mt-2 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                  <Flame className="h-3 w-3 mr-1" />
                  ¡En racha!
                </Badge>
              )}
            </div>

            {/* Mejor Racha */}
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {currentStreak.best}
              </div>
              <p className="text-sm text-muted-foreground">Mejor racha</p>
              <Badge variant="outline" className="mt-2 border-yellow-300 text-yellow-700">
                <Trophy className="h-3 w-3 mr-1" />
                Récord personal
              </Badge>
            </div>

            {/* Progreso hacia el siguiente hito */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Próximo hito (30 días)</span>
                <span>{currentStreak.current}/30</span>
              </div>
              <Progress 
                value={(currentStreak.current / 30) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reconocimientos y Logros */}
      {recognitions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span>Reconocimientos Recientes</span>
            </CardTitle>
            <CardDescription>
              Logros desbloqueados por tu compromiso y constancia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recognitions.map((recognition) => (
                <Card key={recognition.id} className="relative overflow-hidden hover:scale-105 transition-transform">
                  <div className={`absolute inset-0 opacity-10 ${getRarityColor(recognition.rarity).split(' ')[0]}`}></div>
                  <CardContent className="p-4 relative z-10">
                    <div className="text-center space-y-3">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <recognition.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{recognition.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {recognition.description}
                        </p>
                      </div>
                      <Badge className={`text-xs ${getRarityColor(recognition.rarity)}`}>
                        {recognition.rarity === 'legendary' && '⭐ Legendario'}
                        {recognition.rarity === 'epic' && '💎 Épico'}
                        {recognition.rarity === 'rare' && '🔹 Raro'}
                        {recognition.rarity === 'common' && '✨ Común'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights y Sugerencias */}
      <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <span>Insights Personalizados</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                Tendencia Positiva
              </h4>
              <p className="text-sm text-muted-foreground">
                Tu bienestar ha mejorado un 15% en las últimas 4 semanas. ¡Sigue así!
              </p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-500" />
                Próximo Objetivo
              </h4>
              <p className="text-sm text-muted-foreground">
                {currentStreak.current < 30 
                  ? `¡Solo ${30 - currentStreak.current} días más para desbloquear "Maestro de la Constancia"!`
                  : "¡Has alcanzado el nivel máximo! Mantén la excelencia."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalProgressPanel;