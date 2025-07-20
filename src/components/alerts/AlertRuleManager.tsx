import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Settings, AlertTriangle, Clock, TrendingDown, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  threshold: number;
  severity: 'low' | 'medium' | 'high';
  type: string;
}

export const AlertRuleManager = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState<AlertRule[]>([
    {
      id: 'burnout_rule',
      name: 'Detección de Burnout',
      description: 'Alertas automáticas basadas en estado de ánimo bajo',
      enabled: true,
      threshold: 3,
      severity: 'high',
      type: 'mood_based'
    },
    {
      id: 'attendance_rule',
      name: 'Problemas de Asistencia',
      description: 'Alertas por faltas frecuentes o check-ins perdidos',
      enabled: true,
      threshold: 5,
      severity: 'medium',
      type: 'attendance_based'
    },
    {
      id: 'satisfaction_rule',
      name: 'Baja Satisfacción',
      description: 'Alertas por puntuaciones de satisfacción bajas',
      enabled: true,
      threshold: 40,
      severity: 'medium',
      type: 'satisfaction_based'
    },
    {
      id: 'stress_rule',
      name: 'Alto Estrés',
      description: 'Alertas por niveles de estrés elevados',
      enabled: false,
      threshold: 7,
      severity: 'high',
      type: 'stress_based'
    }
  ]);
  
  const [isSaving, setIsSaving] = useState(false);

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ));
  };

  const updateThreshold = (ruleId: string, threshold: number) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, threshold }
        : rule
    ));
  };

  const updateSeverity = (ruleId: string, severity: 'low' | 'medium' | 'high') => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, severity }
        : rule
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you would typically save to your backend/database
      // For now, we'll just simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuración guardada",
        description: "Las reglas de alertas han sido actualizadas exitosamente."
      });
      
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mood_based': return <TrendingDown className="h-4 w-4" />;
      case 'attendance_based': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configurar Reglas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Gestión de Reglas de Alertas</span>
          </DialogTitle>
          <DialogDescription>
            Configura las reglas automáticas para la generación de alertas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {rules.map((rule) => (
            <Card key={rule.id} className={rule.enabled ? 'border-primary/20' : 'border-muted'}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(rule.type)}
                    <CardTitle className="text-base">{rule.name}</CardTitle>
                    <Badge variant={getSeverityColor(rule.severity) as any} className="text-xs">
                      {rule.severity === 'high' ? 'Alta' : 
                       rule.severity === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{rule.description}</p>
              </CardHeader>
              
              {rule.enabled && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`threshold-${rule.id}`}>
                        Umbral {rule.type === 'satisfaction_based' ? '(%)' : '(días)'}
                      </Label>
                      <Input
                        id={`threshold-${rule.id}`}
                        type="number"
                        value={rule.threshold}
                        onChange={(e) => updateThreshold(rule.id, parseInt(e.target.value) || 0)}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`severity-${rule.id}`}>Severidad</Label>
                      <select
                        id={`severity-${rule.id}`}
                        value={rule.severity}
                        onChange={(e) => updateSeverity(rule.id, e.target.value as 'low' | 'medium' | 'high')}
                        className="w-full px-3 py-2 rounded border border-input bg-background"
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <div className="w-4 h-4 animate-spin rounded-full border border-current border-t-transparent mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};