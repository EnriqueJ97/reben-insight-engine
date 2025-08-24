import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Scale, Users, TrendingUp, AlertTriangle, 
  CheckCircle, UserCheck, Briefcase, GraduationCap,
  DollarSign, Calendar, MapPin
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, LineChart, Line
} from 'recharts';

interface DiversityEquityAnalysisProps {
  reportData: any;
  period: string;
  scope: string;
}

const DiversityEquityAnalysis = ({ reportData, period, scope }: DiversityEquityAnalysisProps) => {
  // Mock data de diversidad (en producción vendría de la API)
  const diversityMetrics = {
    gender: {
      female: 52,
      male: 46,
      nonBinary: 2,
      trend: '+3% mujeres vs año anterior'
    },
    age: {
      junior: 28, // <30
      mid: 45,    // 30-45
      senior: 27  // >45
    },
    seniority: {
      entry: 24,
      mid: 41,
      senior: 25,
      leadership: 10
    },
    department: {
      engineering: { female: 35, male: 65 },
      sales: { female: 58, male: 42 },
      marketing: { female: 67, male: 33 },
      hr: { female: 78, male: 22 },
      operations: { female: 45, male: 55 }
    },
    payEquity: {
      genderGapOverall: 3.2, // %
      genderGapByLevel: {
        entry: 1.1,
        mid: 2.8,
        senior: 4.5,
        leadership: 6.2
      },
      trend: 'Mejorando -0.8% vs año anterior'
    }
  };

  // Datos para gráficos
  const genderData = [
    { name: 'Mujeres', value: diversityMetrics.gender.female, color: '#8b5cf6' },
    { name: 'Hombres', value: diversityMetrics.gender.male, color: '#3b82f6' },
    { name: 'No binario', value: diversityMetrics.gender.nonBinary, color: '#10b981' }
  ];

  const ageData = [
    { name: '<30 años', value: diversityMetrics.age.junior, color: '#f59e0b' },
    { name: '30-45 años', value: diversityMetrics.age.mid, color: '#3b82f6' },
    { name: '>45 años', value: diversityMetrics.age.senior, color: '#8b5cf6' }
  ];

  const departmentEquityData = Object.entries(diversityMetrics.department).map(([dept, data]) => ({
    name: dept.charAt(0).toUpperCase() + dept.slice(1),
    female: data.female,
    male: data.male,
    gap: Math.abs(data.female - data.male)
  }));

  const payGapData = Object.entries(diversityMetrics.payEquity.genderGapByLevel).map(([level, gap]) => ({
    level: level.charAt(0).toUpperCase() + level.slice(1),
    gap: gap,
    benchmark: 2.5 // Benchmark industry
  }));

  const getEquityStatus = (percentage: number) => {
    if (percentage >= 45 && percentage <= 55) return 'excelente';
    if (percentage >= 40 && percentage <= 60) return 'bueno';
    if (percentage >= 30 && percentage <= 70) return 'aceptable';
    return 'necesita_atencion';
  };

  const getEquityColor = (status: string) => {
    switch (status) {
      case 'excelente': return 'text-green-600 bg-green-100';
      case 'bueno': return 'text-blue-600 bg-blue-100';
      case 'aceptable': return 'text-yellow-600 bg-yellow-100';
      case 'necesita_atencion': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Métricas Principales de Diversidad */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paridad de Género</p>
                <p className="text-2xl font-bold">{diversityMetrics.gender.female}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-700 bg-green-50">
                {diversityMetrics.gender.trend}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Brecha Salarial</p>
                <p className="text-2xl font-bold">{diversityMetrics.payEquity.genderGapOverall}%</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-700 bg-green-50">
                {diversityMetrics.payEquity.trend}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Diversidad Etaria</p>
                <p className="text-2xl font-bold">Equilibrado</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-blue-700 bg-blue-50">
                3 generaciones activas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Liderazgo Femenino</p>
                <p className="text-2xl font-bold">47%</p>
              </div>
              <Briefcase className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-orange-700 bg-orange-50">
                +8% vs industria
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución de Género y Edad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Distribución por Género
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Excelente equilibrio de género. La organización supera los estándares de la industria.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Distribución por Edad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Júnior (<30)', value: diversityMetrics.age.junior },
                  { name: 'Mid-level (30-45)', value: diversityMetrics.age.mid },
                  { name: 'Senior (>45)', value: diversityMetrics.age.senior }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Balance generacional</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Óptimo
                </Badge>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis por Departamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Equidad por Departamento
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Análisis de distribución de género por área organizacional
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentEquityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="female" stackId="a" fill="#8b5cf6" name="Mujeres %" />
                <Bar dataKey="male" stackId="a" fill="#3b82f6" name="Hombres %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-3">
            {departmentEquityData.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{dept.name}</span>
                  <Badge className={getEquityColor(getEquityStatus(dept.female))}>
                    {dept.female}% / {dept.male}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {dept.gap > 30 ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    Brecha: {dept.gap}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análisis de Brecha Salarial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Análisis de Equidad Salarial
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Brecha salarial de género por nivel organizacional vs benchmark de industria
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payGapData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip formatter={(value: any, name: string) => [`${value}%`, name === 'gap' ? 'Brecha actual' : 'Benchmark industria']} />
                <Legend />
                <Bar dataKey="gap" fill="#ef4444" name="Brecha actual %" />
                <Bar dataKey="benchmark" fill="#94a3b8" name="Benchmark industria %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Progreso positivo:</strong> La brecha salarial general ha mejorado 0.8% en el último año.
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Área de mejora:</strong> La brecha en posiciones de liderazgo (6.2%) requiere atención prioritaria.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones y Acciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Fortalezas Identificadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Excelente paridad de género</p>
                  <p className="text-xs text-muted-foreground">
                    52% mujeres supera objetivo organizacional del 45%
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Diversidad etaria balanceada</p>
                  <p className="text-xs text-muted-foreground">
                    Distribución óptima entre generaciones
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Liderazgo femenino sólido</p>
                  <p className="text-xs text-muted-foreground">
                    47% en posiciones de liderazgo vs 39% industria
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Oportunidades de Mejora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-orange-50">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Brecha salarial en liderazgo</p>
                  <p className="text-xs text-muted-foreground">
                    Implementar revisión salarial para posiciones ejecutivas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-orange-50">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Desequilibrio en ingeniería</p>
                  <p className="text-xs text-muted-foreground">
                    Iniciativas para atraer más talento femenino técnico
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg bg-orange-50">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Programa de mentoría</p>
                  <p className="text-xs text-muted-foreground">
                    Acelerar promoción de mujeres a roles senior
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiversityEquityAnalysis;