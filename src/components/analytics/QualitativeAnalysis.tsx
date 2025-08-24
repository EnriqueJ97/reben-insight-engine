import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, TrendingUp, Heart, Frown, 
  Smile, Search, Tag, Users, Brain,
  ThumbsUp, ThumbsDown, AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface QualitativeAnalysisProps {
  reportData: any;
  period: string;
  scope: string;
}

const QualitativeAnalysis = ({ reportData, period, scope }: QualitativeAnalysisProps) => {
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');

  // Mock data de análisis cualitativo (en producción vendría de la API)
  const sentimentData = {
    overall: {
      positive: 68,
      neutral: 22,
      negative: 10,
      trend: '+8% vs mes anterior'
    },
    byTeam: [
      { team: 'Ventas', positive: 75, neutral: 20, negative: 5 },
      { team: 'Desarrollo', positive: 62, neutral: 28, negative: 10 },
      { team: 'Marketing', positive: 80, neutral: 15, negative: 5 },
      { team: 'Soporte', positive: 58, neutral: 25, negative: 17 }
    ],
    themes: [
      {
        keyword: 'trabajo flexible',
        mentions: 147,
        sentiment: 'positive',
        trend: 'up',
        impact: 'high',
        teams: ['Ventas', 'Marketing', 'Desarrollo']
      },
      {
        keyword: 'carga de trabajo',
        mentions: 89,
        sentiment: 'negative',
        trend: 'stable',
        impact: 'medium',
        teams: ['Desarrollo', 'Soporte']
      },
      {
        keyword: 'comunicación',
        mentions: 134,
        sentiment: 'neutral',
        trend: 'improving',
        impact: 'high',
        teams: ['Todos']
      },
      {
        keyword: 'reconocimiento',
        mentions: 67,
        sentiment: 'positive',
        trend: 'up',
        impact: 'medium',
        teams: ['Ventas', 'Marketing']
      }
    ]
  };

  const feedbackSamples = [
    {
      id: 1,
      text: "El trabajo flexible ha mejorado mucho mi equilibrio vida-trabajo. Me siento más productivo trabajando desde casa 3 días a la semana.",
      sentiment: 'positive',
      team: 'Ventas',
      keywords: ['trabajo flexible', 'equilibrio', 'productivo'],
      date: '2024-12-15'
    },
    {
      id: 2,
      text: "La carga de trabajo últimamente está siendo muy intensa. Necesitaríamos más recursos en el equipo para poder entregar todo a tiempo.",
      sentiment: 'negative',
      team: 'Desarrollo',
      keywords: ['carga trabajo', 'recursos', 'tiempo'],
      date: '2024-12-14'
    },
    {
      id: 3,
      text: "Me parece genial que ahora tengamos 1:1s semanales. La comunicación con mi manager ha mejorado mucho y me siento más apoyado.",
      sentiment: 'positive',
      team: 'Marketing',
      keywords: ['1:1s', 'comunicación', 'manager', 'apoyo'],
      date: '2024-12-13'
    },
    {
      id: 4,
      text: "El sistema de reconocimiento nuevo está bien, aunque creo que podríamos tener más variedad en los premios disponibles.",
      sentiment: 'neutral',
      team: 'Soporte',
      keywords: ['reconocimiento', 'premios', 'variedad'],
      date: '2024-12-12'
    }
  ];

  const wordCloud = [
    { word: 'flexible', frequency: 147, sentiment: 'positive' },
    { word: 'comunicación', frequency: 134, sentiment: 'neutral' },
    { word: 'equilibrio', frequency: 98, sentiment: 'positive' },
    { word: 'carga', frequency: 89, sentiment: 'negative' },
    { word: 'apoyo', frequency: 76, sentiment: 'positive' },
    { word: 'reconocimiento', frequency: 67, sentiment: 'positive' },
    { word: 'tiempo', frequency: 54, sentiment: 'negative' },
    { word: 'recursos', frequency: 45, sentiment: 'negative' },
    { word: 'productivo', frequency: 43, sentiment: 'positive' },
    { word: 'manager', frequency: 41, sentiment: 'neutral' }
  ];

  // Datos para gráficos
  const sentimentChartData = [
    { name: 'Positivo', value: sentimentData.overall.positive, color: '#10b981' },
    { name: 'Neutral', value: sentimentData.overall.neutral, color: '#6b7280' },
    { name: 'Negativo', value: sentimentData.overall.negative, color: '#ef4444' }
  ];

  const teamSentimentData = sentimentData.byTeam.map(team => ({
    ...team,
    overall: ((team.positive * 1) + (team.neutral * 0.5) + (team.negative * 0)) / 100 * 100
  }));

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="w-4 h-4 text-green-500" />;
      case 'negative': return <Frown className="w-4 h-4 text-red-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const filteredFeedback = feedbackSamples.filter(feedback => {
    const sentimentMatch = sentimentFilter === 'all' || feedback.sentiment === sentimentFilter;
    const teamMatch = teamFilter === 'all' || feedback.team === teamFilter;
    return sentimentMatch && teamMatch;
  });

  return (
    <div className="space-y-6">
      {/* Controles de Filtrado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Filtros de Análisis Cualitativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Sentimiento</label>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="positive">Positivo</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Equipo</label>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Ventas">Ventas</SelectItem>
                  <SelectItem value="Desarrollo">Desarrollo</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Soporte">Soporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis General de Sentimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Distribución de Sentimiento General
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Análisis del tono emocional en feedback organizacional
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sentimentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Tendencia general</span>
                <Badge className="bg-green-100 text-green-800">
                  {sentimentData.overall.trend}
                </Badge>
              </div>
              <Progress value={sentimentData.overall.positive} className="h-2" />
              <p className="text-xs text-muted-foreground">
                El sentimiento positivo representa {sentimentData.overall.positive}% del feedback total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Sentimiento por Equipos
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Comparativa del tono emocional entre diferentes áreas
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamSentimentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="team" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="positive" stackId="a" fill="#10b981" name="Positivo" />
                  <Bar dataKey="neutral" stackId="a" fill="#6b7280" name="Neutral" />
                  <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Negativo" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span>Mejor: Marketing (80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4 text-red-500" />
                  <span>Necesita atención: Soporte</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de Temas Principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Temas Más Mencionados
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Keywords y temas recurrentes en el feedback organizacional
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {sentimentData.themes.map((theme, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold capitalize">{theme.keyword}</h4>
                    <Badge className={getSentimentColor(theme.sentiment)}>
                      {theme.sentiment}
                    </Badge>
                    <Badge variant="outline">
                      {theme.mentions} menciones
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getTrendIcon(theme.trend)}
                    <Badge 
                      variant={theme.impact === 'high' ? 'default' : 'outline'}
                      className={theme.impact === 'high' ? 'bg-blue-100 text-blue-800' : ''}
                    >
                      Impacto {theme.impact}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Equipos: {Array.isArray(theme.teams) ? theme.teams.join(', ') : theme.teams}
                  </div>
                  <Progress value={(theme.mentions / 150) * 100} className="w-24 h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nube de Palabras y Frecuencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Palabras Más Frecuentes
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Análisis de frecuencia y contexto de términos clave
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {wordCloud.map((word, index) => {
              const fontSize = Math.max(12, Math.min(24, word.frequency / 10));
              return (
                <span
                  key={index}
                  className={`inline-block px-2 py-1 rounded font-medium ${getSentimentColor(word.sentiment)}`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {word.word}
                </span>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Top Palabras Positivas</h4>
              <div className="space-y-2">
                {wordCloud
                  .filter(w => w.sentiment === 'positive')
                  .slice(0, 5)
                  .map((word, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{word.word}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(word.frequency / 150) * 100} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground">{word.frequency}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Áreas de Preocupación</h4>
              <div className="space-y-2">
                {wordCloud
                  .filter(w => w.sentiment === 'negative')
                  .slice(0, 5)
                  .map((word, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{word.word}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(word.frequency / 150) * 100} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground">{word.frequency}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Muestras de Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Feedback Representativo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Muestras anónimas de feedback que ilustran las tendencias identificadas
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(feedback.sentiment)}
                    <Badge variant="outline">{feedback.team}</Badge>
                    <span className="text-sm text-muted-foreground">{feedback.date}</span>
                  </div>
                  <Badge className={getSentimentColor(feedback.sentiment)}>
                    {feedback.sentiment}
                  </Badge>
                </div>

                <p className="text-sm mb-3 leading-relaxed">
                  "{feedback.text}"
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Keywords:</span>
                  {feedback.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredFeedback.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>No se encontró feedback con los filtros seleccionados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights y Recomendaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-green-500" />
              Insights Positivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded bg-green-50">
                <p className="font-medium text-sm text-green-800">Trabajo flexible muy valorado</p>
                <p className="text-xs text-green-700">
                  147 menciones positivas sobre flexibilidad laboral (+35% vs período anterior)
                </p>
              </div>
              
              <div className="p-3 border rounded bg-green-50">
                <p className="font-medium text-sm text-green-800">Comunicación manager-empleado mejora</p>
                <p className="text-xs text-green-700">
                  Los 1:1s semanales han generado 89% de feedback positivo
                </p>
              </div>
              
              <div className="p-3 border rounded bg-green-50">
                <p className="font-medium text-sm text-green-800">Alto engagement en Marketing</p>
                <p className="text-xs text-green-700">
                  80% de sentimiento positivo, el más alto organizacionalmente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Áreas de Mejora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded bg-orange-50">
                <p className="font-medium text-sm text-orange-800">Carga de trabajo en Desarrollo</p>
                <p className="text-xs text-orange-700">
                  89 menciones sobre exceso de carga, considerar redistribución de tareas
                </p>
              </div>
              
              <div className="p-3 border rounded bg-orange-50">
                <p className="font-medium text-sm text-orange-800">Moral en equipo Soporte</p>
                <p className="text-xs text-orange-700">
                  17% de sentimiento negativo, el más alto. Revisar estructura y recursos
                </p>
              </div>
              
              <div className="p-3 border rounded bg-orange-50">
                <p className="font-medium text-sm text-orange-800">Sistema de reconocimiento</p>
                <p className="text-xs text-orange-700">
                  Feedback neutral dominante, ampliar opciones y personalización
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QualitativeAnalysis;