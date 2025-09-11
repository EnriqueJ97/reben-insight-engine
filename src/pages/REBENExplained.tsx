import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, TrendingUp, Shield, Brain, AlertCircle, 
  BarChart3, Clock, Target, Zap, CheckCircle,
  ArrowRight, Database, Cpu, Eye, Bell,
  FileText, Settings, MessageSquare, Calendar
} from 'lucide-react';

const REBENExplained = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          REBEN: Ecosistema Completo de Bienestar Organizacional
        </h1>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
          Así es como REBEN convierte cada interacción en insights accionables para transformar tu organización
        </p>
      </div>

      {/* Data Journey */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            El Viaje del Dato: De la Captura al Insight
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">1. Captura</h3>
              <p className="text-sm text-muted-foreground">Check-ins diarios, pulsos, evaluaciones</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Cpu className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold">2. Procesamiento</h3>
              <p className="text-sm text-muted-foreground">EIE Core + ML + Benchmarking</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold">3. Análisis</h3>
              <p className="text-sm text-muted-foreground">Patrones, tendencias, predicciones</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">4. Acción</h3>
              <p className="text-sm text-muted-foreground">Alertas, recomendaciones, intervenciones</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Process */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              1. Recolección Inteligente de Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Check-ins Diarios (Q1-Q5)</h4>
                  <p className="text-sm text-muted-foreground">
                    Estado de ánimo, compromiso, carga de trabajo, relaciones, autonomía
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Pulsos Temáticos</h4>
                  <p className="text-sm text-muted-foreground">
                    Burnout (MBI), compromiso (UWES), cultura organizacional
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Datos Operacionales</h4>
                  <p className="text-sm text-muted-foreground">
                    Horarios, turnos, productividad, ausentismo
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Privacidad por Defecto</h4>
                  <p className="text-sm text-muted-foreground">
                    Anonimización automática, n≥7 para agregaciones, GDPR compliance
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EIE Core Processing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              2. EIE Core: Motor Analítico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Score Multifactorial</h4>
                  <p className="text-sm text-muted-foreground">
                    35% ánimo + 25% compromiso + 20% carga + 15% relaciones + 5% autonomía
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Ajustes Temporales</h4>
                  <p className="text-sm text-muted-foreground">
                    Suavizado exponencial (14d), factor consistencia, intervalos confianza
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Benchmarking Dinámico</h4>
                  <p className="text-sm text-muted-foreground">
                    Percentiles por industria, tamaño empresa, región
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Predicción Rotación</h4>
                  <p className="text-sm text-muted-foreground">
                    Modelos supervivencia Cox/RSF, riesgo 90/180 días
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Layer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              3. Capa de Análisis Avanzado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Detección de Anomalías</h4>
                  <p className="text-sm text-muted-foreground">
                    CUSUM, regresión lineal, volatilidad, desvíos por equipo
                  </p>
                  <Badge variant="outline" className="text-xs">ML</Badge>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Análisis Predictivo</h4>
                  <p className="text-sm text-muted-foreground">
                    Tendencias, correlaciones, impacto simulado de intervenciones
                  </p>
                  <Badge variant="outline" className="text-xs">Predictivo</Badge>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Explicabilidad IA</h4>
                  <p className="text-sm text-muted-foreground">
                    Factores de influencia, recomendaciones contextuales, confianza
                  </p>
                  <Badge variant="outline" className="text-xs">XAI</Badge>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Mapeo CSRD</h4>
                  <p className="text-sm text-muted-foreground">
                    10 KPIs sociales, preparación auditoría, cobertura datos
                  </p>
                  <Badge variant="outline" className="text-xs">ESG</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Layer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              4. Capa de Acción Inteligente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Alertas Proactivas</h4>
                  <p className="text-sm text-muted-foreground">
                    Umbral riesgo, cambios significativos, 3 acciones prescriptivas + ROI
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Chat IA Contextual</h4>
                  <p className="text-sm text-muted-foreground">
                    Responde "¿por qué mi equipo está en ámbar?" con drivers específicos
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Intervenciones Dirigidas</h4>
                  <p className="text-sm text-muted-foreground">
                    Recomendaciones por persona/equipo, seguimiento impacto
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Simulador "What-If"</h4>
                  <p className="text-sm text-muted-foreground">
                    Proyecta impacto de cambios: ↓workload 10% → ↓rotación 15% → €50K ROI
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Flow Examples */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle>Ejemplos Reales del Flujo de Datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Example 1 */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm">1</span>
              Check-in Individual
            </h4>
            <div className="ml-8 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Input</Badge>
                <span className="text-sm">María responde: Ánimo=3, Compromiso=4, Carga=8, Relaciones=4, Autonomía=3</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-2" />
              <div className="flex items-center gap-2">
                <Badge variant="outline">Procesamiento</Badge>
                <span className="text-sm">EIE Core: Score = 0.35×30 + 0.25×40 + 0.20×20 + 0.15×40 + 0.05×30 = 31.5</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-2" />
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Alerta</Badge>
                <span className="text-sm">Score &lt;35 → Alerta burnout → Manager notificado → 3 acciones sugeridas</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Example 2 */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-sm">2</span>
              Análisis de Equipo
            </h4>
            <div className="ml-8 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Input</Badge>
                <span className="text-sm">Equipo de 12 personas, 180 check-ins últimos 30 días</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-2" />
              <div className="flex items-center gap-2">
                <Badge variant="outline">Análisis</Badge>
                <span className="text-sm">Score=68 (±4), P75 sector tech, Riesgo rotación 90d: 8%, Drivers: compromiso↓</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-2" />
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800">Insight</Badge>
                <span className="text-sm">Dashboard actualizado + Chat IA puede explicar causas + Simulador proyecta mejoras</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Example 3 */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-sm">3</span>
              Predicción Organizacional
            </h4>
            <div className="ml-8 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Input</Badge>
                <span className="text-sm">Empresa 250 empleados, datos 6 meses, industria=tech</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-2" />
              <div className="flex items-center gap-2">
                <Badge variant="outline">ML</Badge>
                <span className="text-sm">Modelo predice 12% rotación anual, coste €150K, factores: carga + autonomía</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-2" />
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Acción</Badge>
                <span className="text-sm">Reporte ejecutivo + KPIs CSRD + Plan intervención personalizado</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Excellence */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Métricas de Excelencia del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-blue-600">95%</div>
              <div className="text-sm text-muted-foreground">Precisión C-Index</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-green-600">0.12</div>
              <div className="text-sm text-muted-foreground">ECE Score</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-orange-600">5.2</div>
              <div className="text-sm text-muted-foreground">Días Antelación</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-purple-600">78%</div>
              <div className="text-sm text-muted-foreground">Adopción Recomendaciones</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-red-600">90%</div>
              <div className="text-sm text-muted-foreground">Cobertura CSRD</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Value Proposition */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-center">El Valor Diferencial de REBEN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <Shield className="w-12 h-12 text-primary mx-auto" />
              <h3 className="font-semibold">Privacidad por Diseño</h3>
              <p className="text-sm text-muted-foreground">
                Anonimización automática, n≥7, aliases temporales, consentimiento granular
              </p>
            </div>
            <div className="text-center space-y-2">
              <Brain className="w-12 h-12 text-primary mx-auto" />
              <h3 className="font-semibold">IA Explicable</h3>
              <p className="text-sm text-muted-foreground">
                No cajas negras: cada métrica tiene drivers, confianza y explicación clara
              </p>
            </div>
            <div className="text-center space-y-2">
              <Target className="w-12 h-12 text-primary mx-auto" />
              <h3 className="font-semibold">ROI Medible</h3>
              <p className="text-sm text-muted-foreground">
                Cada intervención tiene impacto proyectado en retención, productividad y costes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default REBENExplained;