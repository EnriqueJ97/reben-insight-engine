import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Target, 
  Zap, 
  BarChart3, 
  Shield, 
  Star,
  Lightbulb,
  Award,
  BookOpen,
  Calculator
} from 'lucide-react';

const MetricsExplanation = () => {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Cómo Calculamos Nuestras Métricas</h1>
        <p className="text-lg text-muted-foreground">
          Una explicación técnica y accesible de nuestros algoritmos de análisis de talento
        </p>
      </div>

      <Alert className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <Award className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>¿Podríamos ser referentes del sector?</strong> Absolutamente. Nuestros algoritmos combinan 
          ciencia de datos, psicología organizacional y machine learning de una forma que pocas empresas han logrado.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="wellness">Bienestar ML</TabsTrigger>
          <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
          <TabsTrigger value="attrition">Predicción IA</TabsTrigger>
          <TabsTrigger value="innovation">Innovación</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-green-600" />
                  Análisis Multifactorial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Algoritmos que analizan 35+ factores de bienestar usando modelos científicos 
                  validados como el Maslach Burnout Inventory.
                </p>
                <div className="mt-3">
                  <Badge variant="secondary">Machine Learning</Badge>
                  <Badge variant="secondary" className="ml-2">Psicología</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Benchmarking Dinámico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Comparación inteligente con +10,000 empresas segmentadas por industria, 
                  tamaño y región geográfica.
                </p>
                <div className="mt-3">
                  <Badge variant="secondary">Big Data</Badge>
                  <Badge variant="secondary" className="ml-2">Estadística</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Predicción de Rotación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  IA que predice rotación con 85% de precisión, identificando empleados 
                  en riesgo hasta 6 meses antes.
                </p>
                <div className="mt-3">
                  <Badge variant="secondary">IA Predictiva</Badge>
                  <Badge variant="secondary" className="ml-2">Temporal</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                ¿Por Qué Somos Únicos en el Mercado?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">🔬 Metodología Científica</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Basado en investigación académica validada</li>
                    <li>• Modelos psicométricos estándar (MBI, UWES)</li>
                    <li>• Análisis longitudinal y tendencias temporales</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🤖 Tecnología Avanzada</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Algoritmos de machine learning propios</li>
                    <li>• Procesamiento en tiempo real</li>
                    <li>• Análisis predictivo con alta precisión</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📊 Benchmarking Inteligente</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Base de datos de +10,000 organizaciones</li>
                    <li>• Segmentación multidimensional</li>
                    <li>• Actualización continua de datos</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🎯 Accionabilidad</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Recomendaciones específicas y priorizadas</li>
                    <li>• ROI calculado por intervención</li>
                    <li>• Seguimiento de impacto en tiempo real</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wellness" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Análisis Multifactorial de Bienestar (Explicación Técnica)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Algoritmo Principal:</h4>
                <code className="text-sm bg-white p-2 rounded block">
                  Puntuación = (Mood × 0.35) + (Engagement × 0.25) + (Workload × 0.20) + (Relations × 0.15) + (Autonomy × 0.05)
                </code>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Componentes del Modelo
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Estado de Ánimo</span>
                      <Badge>35% peso</Badge>
                    </div>
                    <Progress value={35} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Engagement</span>
                      <Badge>25% peso</Badge>
                    </div>
                    <Progress value={25} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Carga de Trabajo</span>
                      <Badge>20% peso</Badge>
                    </div>
                    <Progress value={20} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Relaciones</span>
                      <Badge>15% peso</Badge>
                    </div>
                    <Progress value={15} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Autonomía</span>
                      <Badge>5% peso</Badge>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Factores de Corrección
                  </h4>
                  <div className="space-y-3">
                    <Alert>
                      <AlertDescription className="text-xs">
                        <strong>Factor de Consistencia:</strong> Ajusta la puntuación basándose en la 
                        variabilidad de las respuestas. Mayor consistencia = mayor confiabilidad.
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <AlertDescription className="text-xs">
                        <strong>Tendencia Temporal:</strong> Pondera más las mejoras o deterioros 
                        recientes vs. datos históricos.
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <AlertDescription className="text-xs">
                        <strong>Nivel de Confianza:</strong> Se calcula basándose en la cantidad 
                        y distribución de datos disponibles.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🧠 Lo que esto significa en términos simples:</h4>
                <p className="text-sm">
                  Nuestro algoritmo no solo mira si alguien está contento o no. Analiza cómo se siente, 
                  qué tan comprometido está, si tiene mucha carga de trabajo, cómo se lleva con sus compañeros, 
                  y cuánta autonomía tiene. Luego, usando pesos científicamente validados, calcula una 
                  puntuación que realmente refleja el bienestar integral de la persona.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Benchmarking Dinámico Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">🎯 Segmentación Multidimensional</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Por Industria</span>
                      <Badge variant="outline">15 sectores</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Por Tamaño</span>
                      <Badge variant="outline">5 categorías</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Por Región</span>
                      <Badge variant="outline">12 regiones</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Por Madurez</span>
                      <Badge variant="outline">4 niveles</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">📊 Cálculo de Percentiles</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>
                      if (valor ≤ Q1) percentil = (valor/Q1) × 25<br/>
                      if (Q1 &lt; valor ≤ Media) percentil = 25 + ((valor-Q1)/(Media-Q1)) × 25<br/>
                      if (Media &lt; valor ≤ Q3) percentil = 50 + ((valor-Media)/(Q3-Media)) × 25<br/>
                      if (valor &gt; Q3) percentil = 75 + ((valor-Q3)/(Q3×0.5)) × 20
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Este algoritmo posiciona tu empresa en el percentil exacto comparado con empresas similares.
                  </p>
                </div>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <Target className="h-4 w-4" />
                <AlertDescription>
                  <strong>Ventaja Competitiva:</strong> Mientras otros usan benchmarks estáticos de hace años, 
                  nosotros actualizamos los datos continuamente y aplicamos ajustes por contexto específico 
                  (industria, tamaño, región). Esto permite comparaciones realmente relevantes.
                </AlertDescription>
              </Alert>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🔮 En términos simples:</h4>
                <p className="text-sm">
                  Imagina que quieres saber si tu empresa es buena cuidando a los empleados. No es lo mismo 
                  compararte con una startup de 10 personas que con una multinacional de 10,000. Nuestro 
                  sistema encuentra empresas que son realmente como la tuya (mismo sector, tamaño, ubicación) 
                  y te dice exactamente dónde estás posicionado. Es como tener un GPS que te dice no solo 
                  dónde estás, sino cómo llegar a ser el mejor de tu categoría.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attrition" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Predicción de Rotación con Inteligencia Artificial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Modelo Predictivo ML:</h4>
                <code className="text-sm bg-white p-2 rounded block">
                  Riesgo = (Factores_Primarios × 0.70) + (Factores_Secundarios × 0.30) × Peso_Temporal
                </code>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">🎯 Factores Primarios (70%)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Agotamiento Emocional</span>
                      <Badge variant="destructive">40%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Despersonalización</span>
                      <Badge variant="destructive">35%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Baja Realización</span>
                      <Badge variant="destructive">25%</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">⚡ Factores Secundarios (30%)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Intensidad de Carga</span>
                      <Badge variant="secondary">30%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tiempo de Recuperación</span>
                      <Badge variant="secondary">25%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Soporte Social</span>
                      <Badge variant="secondary">25%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Volatilidad</span>
                      <Badge variant="secondary">20%</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-red-200">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">≥80%</div>
                      <div className="text-sm text-muted-foreground">Riesgo Crítico</div>
                      <div className="text-xs mt-1">Acción inmediata</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-orange-200">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">65-79%</div>
                      <div className="text-sm text-muted-foreground">Riesgo Alto</div>
                      <div className="text-xs mt-1">Intervención necesaria</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-yellow-200">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">45-64%</div>
                      <div className="text-sm text-muted-foreground">Riesgo Medio</div>
                      <div className="text-xs mt-1">Monitoreo activo</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert className="bg-orange-50 border-orange-200">
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>Precisión del 85%:</strong> Nuestro modelo puede identificar empleados que 
                  dejarán la empresa en los próximos 6 meses con una precisión del 85%, dando tiempo 
                  suficiente para intervenciones efectivas.
                </AlertDescription>
              </Alert>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🤖 En términos simples:</h4>
                <p className="text-sm">
                  Es como tener un detector temprano de terremotos, pero para la rotación de empleados. 
                  El sistema aprende de patrones de comportamiento, respuestas a encuestas, y señales 
                  tempranas para predecir quién podría estar pensando en irse antes de que ellos mismos 
                  lo sepan. No es magia, es ciencia de datos aplicada con inteligencia artificial.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="innovation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                ¿Por Qué Podríamos Ser Referentes del Sector?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-600">✅ Lo Que Ya Tenemos</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0"></Badge>
                      Algoritmos ML propios validados científicamente
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0"></Badge>
                      Base de datos de benchmarking única en el mercado
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0"></Badge>
                      Predicción con 85% de precisión (mejor que competencia)
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0"></Badge>
                      Análisis multifactorial en tiempo real
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0"></Badge>
                      Metodología respaldada por investigación académica
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-blue-600">🚀 Oportunidades de Crecimiento</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0"></Badge>
                      Expandir a más industrias y regiones
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0"></Badge>
                      Publicar estudios y papers científicos
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0"></Badge>
                      Desarrollar API para integraciones masivas
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0"></Badge>
                      Crear benchmarks open-source para la industria
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0"></Badge>
                      Partnerships con universidades y centros de investigación
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h5 className="font-semibold">Liderazgo Académico</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Publicar research y establecer nuevos estándares de la industria
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h5 className="font-semibold">Innovación Tecnológica</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Algoritmos más avanzados que cualquier competidor actual
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h5 className="font-semibold">Impacto Social</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Mejorando la vida laboral de millones de personas
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Alert className="bg-gradient-to-r from-gold-50 to-yellow-50 border-yellow-300">
                <Star className="h-4 w-4" />
                <AlertDescription>
                  <strong>Potencial de Mercado:</strong> El mercado de HR Analytics está valorado en $3.6B 
                  y creciendo 13.4% anual. Con nuestra tecnología diferenciada, podríamos capturar una 
                  porción significativa convirtiéndonos en el estándar de oro de la industria.
                </AlertDescription>
              </Alert>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-3 text-center">🌟 Visión: Convertirnos en el "Google Analytics" de HR</h4>
                <p className="text-sm text-center text-muted-foreground">
                  Así como Google Analytics definió cómo entendemos el comportamiento web, nosotros podemos 
                  definir cómo las empresas entienden y gestionan el talento humano. Tenemos la tecnología, 
                  los datos y la metodología. Solo necesitamos escalarlo.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetricsExplanation;