import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Brain, Bell, BarChart3, RefreshCw, Zap } from 'lucide-react';

export const CSRDArchitectureDiagram = () => {
  const rings = [
    {
      level: 1,
      name: 'Fuentes de Datos',
      icon: Database,
      color: 'bg-blue-500',
      items: [
        'Check-ins diarios',
        'Datos RRHH',
        'Sistemas externos',
        'Pulsos emocionales',
        'Métricas ESG',
        'Calendario corporativo'
      ]
    },
    {
      level: 2,
      name: 'Procesamiento e IA',
      icon: Brain,
      color: 'bg-purple-500',
      items: [
        'Motor EIE',
        'Análisis materialidad',
        'Predicción burnout',
        'Cálculo KPIs ESRS',
        'Detección anomalías',
        'Correlación bienestar-negocio'
      ]
    },
    {
      level: 3,
      name: 'Activación y Alertas',
      icon: Bell,
      color: 'bg-orange-500',
      items: [
        'Alertas cumplimiento',
        'Notificaciones gaps',
        'Recordatorios deadline',
        'Validación datos',
        'Control calidad',
        'Seguimiento tareas'
      ]
    },
    {
      level: 4,
      name: 'Visualización Estratégica',
      icon: BarChart3,
      color: 'bg-green-500',
      items: [
        'Dashboard CSRD',
        'Reportes ESRS',
        'Panel ejecutivo',
        'Análisis materialidad',
        'Simulador What-If',
        'ROI bienestar'
      ]
    },
    {
      level: 5,
      name: 'Retroalimentación',
      icon: RefreshCw,
      color: 'bg-yellow-500',
      items: [
        'Auditorías externas',
        'Feedback stakeholders',
        'Mejora continua',
        'Verificación aseguramiento',
        'Actualización estándares',
        'Optimización procesos'
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Arquitectura Circular CSRD - 5 Anillos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">
              Arquitectura end-to-end para cumplimiento normativo CSRD conectada al motor EIE de REBEN
            </p>
          </div>

          {/* Anillos en formato visual */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rings.map((ring) => (
              <Card key={ring.level} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${ring.color}`}>
                      <ring.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-1">
                        Anillo {ring.level}
                      </Badge>
                      <h3 className="font-semibold text-sm">{ring.name}</h3>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {ring.items.map((item, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${ring.color} mt-1.5 flex-shrink-0`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Flujo de datos */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4 text-center">Flujo de Datos Integrado</h4>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {rings.map((ring, idx) => (
                <div key={ring.level} className="flex items-center gap-3">
                  <Badge className={ring.color}>
                    {idx + 1}
                  </Badge>
                  {idx < rings.length - 1 && (
                    <span className="text-muted-foreground">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Características clave */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">100%</div>
              <p className="text-xs text-muted-foreground">Cumplimiento RGPD</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">1,100+</div>
              <p className="text-xs text-muted-foreground">Data Points ESRS</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">Real-time</div>
              <p className="text-xs text-muted-foreground">Monitoreo Continuo</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
