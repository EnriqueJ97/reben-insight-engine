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

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.1),transparent_70%)]" />
        
        <div className="container mx-auto px-4 z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Transforma el bienestar de tu empresa en resultados reales
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
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
                <div className="text-6xl font-bold text-warning">54%</div>
                <p className="text-lg font-semibold">de compañías reportan más rotación en los últimos 12 meses</p>
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
            <p className="text-xl text-muted-foreground">Tecnología avanzada para el bienestar organizacional</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <Brain className="h-12 w-12 text-primary" />
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
                <h3 className="text-lg font-semibold">Check-ins Emocionales</h3>
                <p className="text-muted-foreground">Medición contextual del estado emocional del equipo</p>
              </CardContent>
            </Card>
            
            <Card className="p-6">
              <CardContent className="space-y-4">
                <BarChart3 className="h-10 w-10 text-success" />
                <h3 className="text-lg font-semibold">Dashboard Interactivo</h3>
                <p className="text-muted-foreground">Visualización en tiempo real del bienestar organizacional</p>
              </CardContent>
            </Card>
            
            <Card className="p-6">
              <CardContent className="space-y-4">
                <Users className="h-10 w-10 text-info" />
                <h3 className="text-lg font-semibold">Pulsos Temáticos</h3>
                <p className="text-muted-foreground">Encuestas personalizadas por departamento y rol</p>
              </CardContent>
            </Card>
            
            <Card className="p-6">
              <CardContent className="space-y-4">
                <TrendingUp className="h-10 w-10 text-warning" />
                <h3 className="text-lg font-semibold">Simulador What-If</h3>
                <p className="text-muted-foreground">Calcula el ROI de diferentes escenarios</p>
              </CardContent>
            </Card>
            
            <Card className="p-6">
              <CardContent className="space-y-4">
                <Brain className="h-10 w-10 text-primary" />
                <h3 className="text-lg font-semibold">Chat IA</h3>
                <p className="text-muted-foreground">Asistente inteligente para insights instantáneos</p>
              </CardContent>
            </Card>
            
            <Card className="p-6">
              <CardContent className="space-y-4">
                <Shield className="h-10 w-10 text-success" />
                <h3 className="text-lg font-semibold">Reportes ESG</h3>
                <p className="text-muted-foreground">Cumplimiento automático de normativas</p>
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
                  <p className="text-2xl font-bold text-success">€124,000</p>
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
            <Card className="p-6">
              <CardContent className="space-y-4">
                <div className="flex text-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="italic">"Redujimos la rotación del 22% al 8% en solo 6 meses. El ROI fue inmediato."</p>
                <div className="pt-4 border-t">
                  <p className="font-semibold">María González</p>
                  <p className="text-sm text-muted-foreground">CHRO, TechCorp España</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-6">
              <CardContent className="space-y-4">
                <div className="flex text-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="italic">"El cumplimiento CSRD pasó de ser una pesadilla a un proceso automático."</p>
                <div className="pt-4 border-t">
                  <p className="font-semibold">Carlos Ruiz</p>
                  <p className="text-sm text-muted-foreground">Director Sostenibilidad, InnovaS.A.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-6">
              <CardContent className="space-y-4">
                <div className="flex text-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
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
              <span className="font-semibold">100% Cumplimiento RGPD • Certificación ISO 27001</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ¿Listo para transformar tu organización?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a más de 150 empresas que ya mejoran su bienestar organizacional con REBEN
            </p>
            
            <Card className="p-8 bg-white/10 backdrop-blur border-white/20">
              <CardContent className="space-y-6">
                <h3 className="text-2xl font-bold">Solicita tu demo gratuita</h3>
                <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <Input placeholder="Tu nombre" className="bg-white/20 border-white/30 text-white placeholder:text-white/70" />
                  <Input placeholder="Email corporativo" className="bg-white/20 border-white/30 text-white placeholder:text-white/70" />
                  <Input placeholder="Empresa" className="bg-white/20 border-white/30 text-white placeholder:text-white/70" />
                  <Input placeholder="Nº empleados" className="bg-white/20 border-white/30 text-white placeholder:text-white/70" />
                </div>
                <Button size="lg" variant="secondary" className="w-full md:w-auto px-8 py-6 text-lg">
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