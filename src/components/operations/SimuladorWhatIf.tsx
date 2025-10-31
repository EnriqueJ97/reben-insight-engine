import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, TrendingUp, Users, Euro, Target, CheckCircle, ArrowRight, Lightbulb, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SimuladorWhatIf = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    numEmpleados: '',
    rotacionActual: '',
    salarioMedio: '',
    inversionBienestar: ''
  });

  // Ejemplos realistas por tamaño de empresa
  const ejemplos = {
    pequena: { empleados: 15, rotacion: 18, salario: 35000, inversion: 8000 },
    mediana: { empleados: 50, rotacion: 15, salario: 45000, inversion: 25000 },
    grande: { empleados: 200, rotacion: 12, salario: 55000, inversion: 100000 }
  };

  const cargarEjemplo = (tipo: keyof typeof ejemplos) => {
    const ej = ejemplos[tipo];
    setData({
      numEmpleados: ej.empleados.toString(),
      rotacionActual: ej.rotacion.toString(),
      salarioMedio: ej.salario.toString(),
      inversionBienestar: ej.inversion.toString()
    });
  };

  // Cálculos reales
  const numEmpleados = parseFloat(data.numEmpleados) || 0;
  const rotacionActual = parseFloat(data.rotacionActual) || 0;
  const salarioMedio = parseFloat(data.salarioMedio) || 0;
  const inversionBienestar = parseFloat(data.inversionBienestar) || 0;

  // Fórmula: Costo de rotación = 1.5x salario medio (reclutamiento, onboarding, pérdida productividad)
  const costoRotacionPorPersona = salarioMedio * 1.5;
  const empleadosRotados = (numEmpleados * rotacionActual) / 100;
  const costoRotacionAnual = empleadosRotados * costoRotacionPorPersona;

  // Reducción estimada de rotación: 25-40% con programa de bienestar efectivo
  const reduccionRotacion = 0.35; // 35% promedio según estudios
  const empleadosRetenidos = empleadosRotados * reduccionRotacion;
  const ahorroAnual = empleadosRetenidos * costoRotacionPorPersona;
  
  const roi = inversionBienestar > 0 ? ((ahorroAnual - inversionBienestar) / inversionBienestar) * 100 : 0;
  const paybackMeses = inversionBienestar > 0 ? (inversionBienestar / (ahorroAnual / 12)) : 0;

  const roiColor = roi >= 200 ? 'text-green-600' : roi >= 100 ? 'text-yellow-600' : 'text-red-600';
  const roiStatus = roi >= 200 ? 'Excelente' : roi >= 100 ? 'Bueno' : roi < 0 ? 'Negativo' : 'Moderado';

  const todosLosCamposCompletos = numEmpleados > 0 && rotacionActual > 0 && salarioMedio > 0 && inversionBienestar > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Calculator className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Calculadora ROI de Bienestar</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre cuánto puedes ahorrar invirtiendo en el bienestar de tu equipo.<br />
            <span className="text-sm">✨ Cálculo basado en estudios de Harvard Business Review y McKinsey</span>
          </p>
        </div>

        {/* Ejemplos rápidos */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Empieza con un ejemplo</CardTitle>
            </div>
            <CardDescription>
              Usa un caso real según el tamaño de tu empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => cargarEjemplo('pequena')}
              >
                <div className="font-semibold">Pequeña (10-25)</div>
                <div className="text-xs text-muted-foreground text-left">
                  15 empleados • 18% rotación<br />
                  €35k salario medio • €8k inversión
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2 border-primary"
                onClick={() => cargarEjemplo('mediana')}
              >
                <div className="font-semibold text-primary">Mediana (25-100) ⭐</div>
                <div className="text-xs text-muted-foreground text-left">
                  50 empleados • 15% rotación<br />
                  €45k salario medio • €25k inversión
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => cargarEjemplo('grande')}
              >
                <div className="font-semibold">Grande (100+)</div>
                <div className="text-xs text-muted-foreground text-left">
                  200 empleados • 12% rotación<br />
                  €55k salario medio • €100k inversión
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Formulario paso a paso */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Datos de tu organización
              </CardTitle>
              <CardDescription>
                Completa 4 datos básicos (2 minutos)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Paso 1: Número de empleados */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      data.numEmpleados ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      1
                    </div>
                    ¿Cuántos empleados tienes?
                  </Label>
                  {data.numEmpleados && <CheckCircle className="w-5 h-5 text-primary" />}
                </div>
                <Input
                  type="number"
                  placeholder="Ej: 50"
                  value={data.numEmpleados}
                  onChange={(e) => setData({...data, numEmpleados: e.target.value})}
                  className="text-lg h-12"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Incluye todos los empleados de plantilla
                </p>
              </div>

              {/* Paso 2: Rotación actual */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      data.rotacionActual ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      2
                    </div>
                    ¿Cuál es tu rotación anual?
                  </Label>
                  {data.rotacionActual && <CheckCircle className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Ej: 15"
                    value={data.rotacionActual}
                    onChange={(e) => setData({...data, rotacionActual: e.target.value})}
                    className="text-lg h-12"
                  />
                  <div className="flex items-center justify-center bg-muted px-4 rounded-md text-muted-foreground font-mono">
                    %
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 (Bajas voluntarias ÷ Total empleados) × 100. Promedio España: 14%
                </p>
              </div>

              {/* Paso 3: Salario medio */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      data.salarioMedio ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      3
                    </div>
                    ¿Salario medio anual?
                  </Label>
                  {data.salarioMedio && <CheckCircle className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center bg-muted px-4 rounded-md text-muted-foreground">
                    €
                  </div>
                  <Input
                    type="number"
                    placeholder="Ej: 45000"
                    value={data.salarioMedio}
                    onChange={(e) => setData({...data, salarioMedio: e.target.value})}
                    className="text-lg h-12"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Salario bruto anual. Promedio España sector servicios: €40-50k
                </p>
              </div>

              {/* Paso 4: Inversión en bienestar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      data.inversionBienestar ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      4
                    </div>
                    ¿Cuánto invertirás en bienestar?
                  </Label>
                  {data.inversionBienestar && <CheckCircle className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center bg-muted px-4 rounded-md text-muted-foreground">
                    €
                  </div>
                  <Input
                    type="number"
                    placeholder="Ej: 25000"
                    value={data.inversionBienestar}
                    onChange={(e) => setData({...data, inversionBienestar: e.target.value})}
                    className="text-lg h-12"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Recomendado: €500-1000 por empleado/año (plataforma + acciones)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card className={cn(
            "border-2",
            todosLosCamposCompletos ? "border-primary/50 bg-gradient-to-br from-primary/5 to-transparent" : "border-dashed"
          )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Resultados de tu inversión
              </CardTitle>
              {!todosLosCamposCompletos && (
                <CardDescription>
                  Completa los 4 datos para ver los resultados
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {!todosLosCamposCompletos ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Calculator className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Rellena los datos para calcular tu ROI</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* ROI Principal */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
                    <div className="text-center space-y-2">
                      <div className="text-sm text-muted-foreground font-medium">Retorno de Inversión (ROI)</div>
                      <div className={cn("text-6xl font-bold", roiColor)}>
                        {roi.toFixed(0)}%
                      </div>
                      <Badge variant={roi >= 200 ? "default" : roi >= 100 ? "secondary" : "destructive"} className="text-sm">
                        {roiStatus}
                      </Badge>
                      <p className="text-xs text-muted-foreground pt-2">
                        Por cada €1 invertido, recuperas €{((roi/100) + 1).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Métricas clave */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="text-xs text-muted-foreground mb-1">Ahorro Anual</div>
                      <div className="text-2xl font-bold text-green-600">
                        €{ahorroAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="text-xs text-muted-foreground mb-1">Periodo de Retorno</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {paybackMeses.toFixed(1)} meses
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="text-xs text-muted-foreground mb-1">Empleados Retenidos</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {empleadosRetenidos.toFixed(1)}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <div className="text-xs text-muted-foreground mb-1">Reducción Rotación</div>
                      <div className="text-2xl font-bold text-orange-600">
                        -{(reduccionRotacion * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Explicación clara */}
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm space-y-2">
                      <p className="font-semibold">¿Cómo se calcula esto?</p>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Costo de rotación:</strong> {empleadosRotados.toFixed(1)} empleados × €{costoRotacionPorPersona.toLocaleString('es-ES', { maximumFractionDigits: 0 })} = €{costoRotacionAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}/año</li>
                        <li>• <strong>Con bienestar:</strong> Reduces 35% la rotación = {empleadosRetenidos.toFixed(1)} empleados retenidos</li>
                        <li>• <strong>Ahorro:</strong> €{ahorroAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })} - €{inversionBienestar.toLocaleString('es-ES', { maximumFractionDigits: 0 })} inversión = {roi.toFixed(0)}% ROI</li>
                      </ul>
                      <p className="text-xs text-muted-foreground pt-2">
                        📊 Basado en datos de Harvard Business Review, Gallup y McKinsey
                      </p>
                    </AlertDescription>
                  </Alert>

                  {/* CTA */}
                  <Button className="w-full h-12 text-base" size="lg">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Implementar Programa de Bienestar
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Nota metodológica */}
        <Card className="border-muted-foreground/20">
          <CardHeader>
            <CardTitle className="text-sm">Metodología de Cálculo</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p><strong>Costo de rotación por empleado:</strong> 1.5× salario anual (incluye reclutamiento, onboarding, pérdida de productividad durante 3-6 meses)</p>
            <p><strong>Reducción de rotación esperada:</strong> 35% promedio (estudios muestran rangos 25-40% con programas de bienestar efectivos)</p>
            <p><strong>Fuentes:</strong> Harvard Business Review (2023), Gallup State of Workplace (2024), McKinsey Health Institute</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimuladorWhatIf;
