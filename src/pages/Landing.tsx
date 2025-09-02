import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  Shield, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  MessageSquare,
  Calendar,
  FileText,
  Play,
  ArrowRight,
  Star
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.1),transparent_70%)]" />
        
        <div className="container mx-auto px-4 z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground text-shadow-soft">
              Transforma el <span className="text-primary-deep">bienestar</span> de tu empresa en <span className="text-primary-deep">resultados reales</span>
            </h1>
            <p className="text-xl md:text-2xl text-strong mb-8 max-w-3xl mx-auto">
              Prevén el burnout, reduce la rotación y cumple con la CSRD mientras impulsas productividad
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-6">
                Solicitar demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <Play className="mr-2 h-5 w-5" />
                Ver cómo funciona
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problema Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">El costo del malestar organizacional</h2>
            <p className="text-xl text-muted-foreground">Datos que no puedes ignorar</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-destructive/20">
              <CardContent className="space-y-4">
                <div className="text-6xl font-bold text-destructive">70%</div>
                <p className="text-lg font-semibold">de empleados españoles han sufrido síntomas de burnout</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 border-warning/20">
              <CardContent className="space-y-4">
                <div className="text-6xl font-bold text-warning-strong">54%</div>
                <p className="text-lg font-bold">de compañías reportan más rotación en los últimos 12 meses</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 border-success/20">
              <CardContent className="space-y-4">
                <div className="text-6xl font-bold text-success">41%</div>
                <p className="text-lg font-semibold">más productividad en empresas con programas de bienestar</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Propuesta de Valor */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">La solución inteligente que necesitas</h2>
            <p className="text-xl text-muted-strong">Tecnología avanzada para el bienestar organizacional</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <Brain className="h-12 w-12 text-primary-deep" />
                <h3 className="text-xl font-semibold">IA Predictiva</h3>
                <p className="text-muted-foreground">Algoritmos avanzados que anticipan riesgos de burnout</p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <TrendingUp className="h-12 w-12 text-success" />
                <h3 className="text-xl font-semibold">Motor de Impacto</h3>
                <p className="text-muted-foreground">Calcula el ROI real de tus iniciativas de bienestar</p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <FileText className="h-12 w-12 text-info" />
                <h3 className="text-xl font-semibold">Reportes CSRD</h3>
                <p className="text-muted-foreground">Cumplimiento automático de normativas ESG</p>
              </CardContent>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <AlertTriangle className="h-12 w-12 text-warning" />
                <h3 className="text-xl font-semibold">Alertas Inteligentes</h3>
                <p className="text-muted-foreground">Notificaciones proactivas para intervención temprana</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Funcionalidades que marcan la diferencia</h2>
            <p className="text-xl text-muted-foreground">Todo lo que necesitas en una plataforma integral</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="space-y-4">
                <MessageSquare className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-semibold">Check-ins Emocionales</h3>
                <p className="text-muted-strong">Medición contextual del estado emocional del equipo</p>
              </CardContent>
            </Card>
            
            <Card className="p-6">
              <CardContent className="space-y-4">
                <BarChart3 className="h-10 w-10 text-success" />
                <h3 className="text-xl font-semibold">Dashboard Interactivo</h3>
                <p className="text-muted-strong">Visualización en tiempo real del bienestar organizacional</p>
              </CardContent>
            </Card>
            
            <Card className="p-6">
              <CardContent className="space-y-4">
                <Users className="h-10 w-10 text-info" />
                <h3 className="text-xl font-semibold">Pulsos Temáticos</h3>
                <p className="text-muted-strong">Encuestas personalizadas por departamento y rol</p>
              </CardContent>
            </Card>
            
            <Card className="p-6">
              <CardContent className="space-y-4">
                <TrendingUp className="h-10 w-10 text-warning" />
                <h3 className="text-xl font-semibold">Simulador What-If</h3>
                <p className="text-muted-strong">Calcula el ROI de diferentes escenarios</p>
              </CardContent>
            </Card>
            
            <Card className="p-6">
              <CardContent className="space-y-4">
                <Brain className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-semibold">Chat Inteligente</h3>
                <p className="text-muted-strong">Asistente inteligente para insights instantáneos</p>
              </CardContent>
            </Card>
            
            <Card className="p-6">
              <CardContent className="space-y-4">
                <Shield className="h-10 w-10 text-success" />
                <h3 className="text-xl font-semibold">Reportes ESG</h3>
                <p className="text-muted-strong">Cumplimiento automático de normativas</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Beneficios Tangibles */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Beneficios que puedes medir</h2>
            <p className="text-xl text-muted-foreground">Impacto real en tu organización</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-8 w-8 text-success mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Reduce rotación hasta 40%</h3>
                  <p className="text-muted-foreground">Identificación temprana de riesgos de abandono</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-8 w-8 text-success mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Mejora engagement 35%</h3>
                  <p className="text-muted-foreground">Programas personalizados de bienestar</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-8 w-8 text-success mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Cumplimiento CSRD sin fricción</h3>
                  <p className="text-muted-foreground">Reportes automáticos y auditorías simplificadas</p>
                </div>
              </div>
            </div>
            
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="space-y-6">
                <h3 className="text-2xl font-bold text-center">Calculadora de ROI</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="employees">Número de empleados</Label>
                    <Input id="employees" type="number" placeholder="250" />
                  </div>
                  <div>
                    <Label htmlFor="turnover">Tasa de rotación anual (%)</Label>
                    <Input id="turnover" type="number" placeholder="15" />
                  </div>
                  <Button className="w-full">Calcular mi ROI</Button>
                </div>
                <div className="text-center pt-4 border-t">
                  <p className="text-2xl font-bold"><span className="text-primary-deep">€</span><span className="text-foreground">124,000</span></p>
                  <p className="text-sm text-muted-foreground">Ahorro anual estimado</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-xl text-muted-foreground">Casos reales de éxito</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 shadow-sm">
              <CardContent className="space-y-4">
                <div className="flex text-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-current" />
                  ))}
                </div>
                <p className="italic">"Redujimos la rotación del 22% al 8% en solo 6 meses. El ROI fue inmediato."</p>
                <div className="pt-4 border-t">
                  <p className="font-semibold">María González</p>
                  <p className="text-sm text-muted-foreground">CHRO, TechCorp España</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-6 shadow-sm">
              <CardContent className="space-y-4">
                <div className="flex text-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-current" />
                  ))}
                </div>
                <p className="italic">"El cumplimiento CSRD pasó de ser una pesadilla a un proceso automático."</p>
                <div className="pt-4 border-t">
                  <p className="font-semibold">Carlos Ruiz</p>
                  <p className="text-sm text-muted-foreground">Director Sostenibilidad, InnovaS.A.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-6 shadow-sm">
              <CardContent className="space-y-4">
                <div className="flex text-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-current" />
                  ))}
                </div>
                <p className="italic">"Nuestro índice de engagement subió del 6.2 al 8.7. Los equipos están más motivados."</p>
                <div className="pt-4 border-t">
                  <p className="font-semibold">Ana Martínez</p>
                  <p className="text-sm text-muted-foreground">HR Manager, DigitalPlus</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Integraciones */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Integraciones que funcionan</h2>
            <p className="text-xl text-muted-foreground">Conecta con las herramientas que ya usas</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="flex items-center justify-center h-20 bg-card rounded-lg border">
              <span className="font-bold text-lg">Slack</span>
            </div>
            <div className="flex items-center justify-center h-20 bg-card rounded-lg border">
              <span className="font-bold text-lg">Teams</span>
            </div>
            <div className="flex items-center justify-center h-20 bg-card rounded-lg border">
              <span className="font-bold text-lg">Asana</span>
            </div>
            <div className="flex items-center justify-center h-20 bg-card rounded-lg border">
              <span className="font-bold text-lg">Calendar</span>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-4 px-6 py-3 bg-success/10 rounded-full">
              <Shield className="h-6 w-6 text-success" />
              <span className="font-semibold text-primary-deep">100% Cumplimiento RGPD • Certificación ISO 27001</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparativa de Planes */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">Planes que escalan contigo</h2>
            <p className="text-lg text-muted-strong">Empieza sencillo y desbloquea todo el valor predictivo cuando lo necesites.</p>
          </div>

          <div className="relative w-full overflow-x-auto">
            <div className="min-w-[900px]">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[28%]">Funcionalidad</TableHead>
                    <TableHead className="text-center">Lite<br /><span className="text-muted-strong text-sm">1,90 €/empleado/mes</span></TableHead>
                    <TableHead className="text-center">Esencial<br /><span className="text-muted-strong text-sm">3,90 €/empleado/mes</span></TableHead>
                    <TableHead className="text-center ring-1 ring-primary bg-secondary/40 shadow-sm">Profesional<br /><span className="text-muted-strong text-sm">7,90 €/empleado/mes</span><div className="mt-1 text-xs font-semibold text-primary">Más popular</div></TableHead>
                    <TableHead className="text-center">Enterprise<br /><span className="text-muted-strong text-sm">A medida</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: 'Check-ins emocionales básicos', vals: ['✅','✅','✅','✅'] },
                    { name: 'Check-ins automáticos contextuales', vals: ['','✅','✅','✅'] },
                    { name: 'Pulsos temáticos configurables', vals: ['','✅','✅','✅'] },
                    { name: 'Registro horario con autoevaluación', vals: ['','✅','✅','✅'] },
                    { name: 'Dashboard segmentado por equipo', vals: ['','✅','✅','✅'] },
                    { name: 'Chat Inteligente básico', vals: ['','✅','✅','✅'] },
                    { name: 'Alertas proactivas simples', vals: ['','✅','✅','✅'] },
                    { name: 'Diagnóstico burnout y cultura organizacional', vals: ['','','✅','✅'] },
                    { name: 'Score de bienestar organizacional', vals: ['','','✅','✅'] },
                    { name: 'Alertas predictivas con IA', vals: ['','','✅','✅'] },
                    { name: 'Simulador What If', vals: ['','','✅','✅'] },
                    { name: 'Panel ejecutivo con KPIs e impacto económico', vals: ['','','✅','✅'] },
                    { name: 'Cumplimiento normativo (CSRD)', vals: ['','','✅','✅'] },
                    { name: 'Integraciones (Slack, Teams, Outlook, HRIS)', vals: ['','','✅','✅'] },
                    { name: 'Exportaciones avanzadas (PDF, Excel)', vals: ['','','✅','✅'] },
                    { name: 'Implementación y onboarding in company', vals: ['','','','✅'] },
                    { name: 'Integración de datos en tiempo real', vals: ['','','','✅'] },
                    { name: 'Cultura de trabajo flexible y turnos inteligentes', vals: ['','','','✅'] },
                    { name: 'Modelos IA personalizados', vals: ['','','','✅'] },
                    { name: 'Customer Success Manager dedicado', vals: ['','','','✅'] },
                    { name: 'Soporte prioritario 24/7', vals: ['','','','✅'] },
                    { name: 'Formación managers y RRHH', vals: ['','','','✅'] },
                    { name: 'API abierta', vals: ['','','','✅'] },
                  ].map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-center text-lg">{row.vals[0]}</TableCell>
                      <TableCell className="text-center text-lg">{row.vals[1]}</TableCell>
                      <TableCell className="text-center text-lg ring-1 ring-primary bg-secondary/30 shadow-sm">{row.vals[2]}</TableCell>
                      <TableCell className="text-center text-lg">{row.vals[3]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <p className="mt-4 text-center text-muted-foreground text-sm">Descuentos por volumen desde 500 empleados. Facturación mensual o anual.</p>

          <div className="mt-8 flex justify-center">
            <Link to="/login">
              <Button size="lg" className="px-8">Ir al login</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-foreground">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ¿Listo para transformar tu organización?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a más de 150 empresas que ya mejoran su bienestar organizacional con REBEN
            </p>
            
            <Card className="p-8 bg-card border">
              <CardContent className="space-y-6">
                <h3 className="text-2xl font-bold">Solicita tu demo gratuita</h3>
                <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <Input placeholder="Tu nombre" />
                  <Input placeholder="Email corporativo" />
                  <Input placeholder="Empresa" />
                  <Input placeholder="Nº empleados" />
                </div>
                <Button size="lg" className="w-full md:w-auto px-8 py-6 text-lg">
                  Solicitar demo gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">REBEN</h3>
              <p className="text-muted-foreground">Transformando el bienestar organizacional con inteligencia artificial</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Funcionalidades</li>
                <li>Integraciones</li>
                <li>Precios</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Sobre nosotros</li>
                <li>Blog</li>
                <li>Carreras</li>
                <li>Contacto</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Privacidad</li>
                <li>Términos</li>
                <li>Cookies</li>
                <li>RGPD</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 REBEN. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;