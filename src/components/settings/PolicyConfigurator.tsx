import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Settings,
  Clock,
  Users,
  CheckCircle,
  Calendar,
  Zap,
  Plus,
  Edit,
  Trash2,
  Save
} from 'lucide-react';

interface PolicyConfig {
  id?: string;
  policy_type: string;
  config_name: string;
  config_data: any;
  is_active: boolean;
  created_at?: string;
}

const PolicyConfigurator = () => {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<PolicyConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PolicyConfig | null>(null);

  // Form states
  const [policyType, setPolicyType] = useState('check_ins');
  const [configName, setConfigName] = useState('');
  const [configData, setConfigData] = useState<any>({});

  const policyTypes = [
    { value: 'check_ins', label: 'Check-ins', icon: Clock },
    { value: 'shift_rules', label: 'Reglas de Turnos', icon: Calendar },
    { value: 'auto_approval', label: 'Aprobación Automática', icon: CheckCircle },
    { value: 'notifications', label: 'Notificaciones', icon: Zap },
    { value: 'team_management', label: 'Gestión de Equipos', icon: Users }
  ];

  useEffect(() => {
    if (user) {
      loadConfigs();
    }
  }, [user]);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('hr_policy_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error loading configs:', error);
      toast.error('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      // Get user profile to access tenant_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user?.id)
        .single();

      const configToSave = {
        policy_type: policyType,
        config_name: configName,
        config_data: configData,
        is_active: true,
        created_by: user?.id,
        tenant_id: profile?.tenant_id
      };

      if (editingConfig?.id) {
        const { error } = await supabase
          .from('hr_policy_configs')
          .update(configToSave)
          .eq('id', editingConfig.id);

        if (error) throw error;
        toast.success('Configuración actualizada');
      } else {
        const { error } = await supabase
          .from('hr_policy_configs')
          .insert(configToSave);

        if (error) throw error;
        toast.success('Configuración creada');
      }

      setShowCreateDialog(false);
      setEditingConfig(null);
      resetForm();
      loadConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar configuración');
    }
  };

  const deleteConfig = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hr_policy_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Configuración eliminada');
      loadConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      toast.error('Error al eliminar configuración');
    }
  };

  const resetForm = () => {
    setPolicyType('check_ins');
    setConfigName('');
    setConfigData({});
  };

  const openEditDialog = (config: PolicyConfig) => {
    setEditingConfig(config);
    setPolicyType(config.policy_type);
    setConfigName(config.config_name);
    setConfigData(config.config_data);
    setShowCreateDialog(true);
  };

  const renderConfigForm = () => {
    switch (policyType) {
      case 'check_ins':
        return (
          <div className="space-y-4">
            <div>
              <Label>Frecuencia de Check-ins</Label>
              <Select 
                value={configData.frequency || 'weekly'} 
                onValueChange={(value) => setConfigData({ ...configData, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="biweekly">Quincenal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Número de Preguntas por Check-in</Label>
              <Slider
                value={[configData.questions_count || 3]}
                onValueChange={(value) => setConfigData({ ...configData, questions_count: value[0] })}
                max={10}
                min={1}
                step={1}
                className="mt-2"
              />
              <span className="text-sm text-muted-foreground">
                {configData.questions_count || 3} preguntas
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={configData.mandatory_response || false}
                onCheckedChange={(checked) => setConfigData({ ...configData, mandatory_response: checked })}
              />
              <Label>Respuesta Obligatoria</Label>
            </div>

            <div>
              <Label>Recordatorios Automáticos</Label>
              <div className="flex items-center space-x-4 mt-2">
                <Switch
                  checked={configData.auto_reminders || false}
                  onCheckedChange={(checked) => setConfigData({ ...configData, auto_reminders: checked })}
                />
                {configData.auto_reminders && (
                  <Input
                    type="number"
                    placeholder="Horas hasta recordatorio"
                    value={configData.reminder_hours || 24}
                    onChange={(e) => setConfigData({ ...configData, reminder_hours: parseInt(e.target.value) })}
                    className="w-48"
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 'shift_rules':
        return (
          <div className="space-y-4">
            <div>
              <Label>Máximo Días Consecutivos</Label>
              <Slider
                value={[configData.max_consecutive_days || 5]}
                onValueChange={(value) => setConfigData({ ...configData, max_consecutive_days: value[0] })}
                max={14}
                min={1}
                step={1}
                className="mt-2"
              />
              <span className="text-sm text-muted-foreground">
                {configData.max_consecutive_days || 5} días
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={configData.weekend_rotation || false}
                onCheckedChange={(checked) => setConfigData({ ...configData, weekend_rotation: checked })}
              />
              <Label>Rotación de Fines de Semana</Label>
            </div>

            <div>
              <Label>Horas Mínimas de Descanso</Label>
              <Slider
                value={[configData.min_rest_hours || 11]}
                onValueChange={(value) => setConfigData({ ...configData, min_rest_hours: value[0] })}
                max={24}
                min={8}
                step={1}
                className="mt-2"
              />
              <span className="text-sm text-muted-foreground">
                {configData.min_rest_hours || 11} horas
              </span>
            </div>

            <div>
              <Label>Máximo Horas Semanales</Label>
              <Input
                type="number"
                value={configData.max_weekly_hours || 40}
                onChange={(e) => setConfigData({ ...configData, max_weekly_hours: parseInt(e.target.value) })}
                min={20}
                max={60}
              />
            </div>
          </div>
        );

      case 'auto_approval':
        return (
          <div className="space-y-4">
            <div>
              <Label>Umbrales de Auto-aprobación</Label>
            </div>

            <div>
              <Label>Solicitudes de Tiempo Libre (días)</Label>
              <Slider
                value={[configData.vacation_auto_approve_days || 3]}
                onValueChange={(value) => setConfigData({ ...configData, vacation_auto_approve_days: value[0] })}
                max={10}
                min={1}
                step={1}
                className="mt-2"
              />
              <span className="text-sm text-muted-foreground">
                Hasta {configData.vacation_auto_approve_days || 3} días
              </span>
            </div>

            <div>
              <Label>Cambios de Turno (horas de antelación)</Label>
              <Slider
                value={[configData.shift_change_hours || 24]}
                onValueChange={(value) => setConfigData({ ...configData, shift_change_hours: value[0] })}
                max={168}
                min={2}
                step={2}
                className="mt-2"
              />
              <span className="text-sm text-muted-foreground">
                {configData.shift_change_hours || 24} horas de antelación
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={configData.remote_work_auto_approve || false}
                onCheckedChange={(checked) => setConfigData({ ...configData, remote_work_auto_approve: checked })}
              />
              <Label>Auto-aprobar Trabajo Remoto</Label>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Label>Configuración JSON</Label>
            <Textarea
              value={JSON.stringify(configData, null, 2)}
              onChange={(e) => {
                try {
                  setConfigData(JSON.parse(e.target.value));
                } catch (error) {
                  // Invalid JSON, ignore
                }
              }}
              rows={8}
              className="font-mono"
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurador de Políticas</h2>
          <p className="text-muted-foreground">
            Personaliza las reglas y parámetros de las políticas de RR.HH.
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingConfig(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Configuración
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? 'Editar Configuración' : 'Nueva Configuración'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <Label>Tipo de Política</Label>
                <Select value={policyType} onValueChange={setPolicyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {policyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Nombre de la Configuración</Label>
                <Input
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  placeholder="Ej: Check-ins Semanales por Equipo"
                />
              </div>

              {renderConfigForm()}

              <div className="flex gap-2 pt-4">
                <Button onClick={saveConfig} disabled={!configName}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingConfig ? 'Actualizar' : 'Crear'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue={policyTypes[0].value}>
        <TabsList className="grid w-full grid-cols-5">
          {policyTypes.map((type) => (
            <TabsTrigger key={type.value} value={type.value}>
              <type.icon className="w-4 h-4 mr-2" />
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {policyTypes.map((type) => (
          <TabsContent key={type.value} value={type.value} className="space-y-4">
            {configs.filter(config => config.policy_type === type.value).length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <type.icon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay configuraciones</h3>
                  <p className="text-muted-foreground mb-4">
                    Aún no has creado configuraciones para {type.label.toLowerCase()}
                  </p>
                  <Button onClick={() => { setPolicyType(type.value); setShowCreateDialog(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Configuración
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {configs
                  .filter(config => config.policy_type === type.value)
                  .map((config) => (
                    <Card key={config.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <type.icon className="w-5 h-5 text-primary" />
                            <div>
                              <CardTitle className="text-lg">{config.config_name}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Creado {new Date(config.created_at!).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={config.is_active ? 'default' : 'secondary'}>
                              {config.is_active ? 'Activa' : 'Inactiva'}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(config)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteConfig(config.id!)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {Object.entries(config.config_data).map(([key, value]) => (
                            <div key={key}>
                              <p className="text-muted-foreground capitalize">
                                {key.replace(/_/g, ' ')}
                              </p>
                              <p className="font-medium">
                                {typeof value === 'boolean' 
                                  ? (value ? 'Sí' : 'No')
                                  : String(value)
                                }
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PolicyConfigurator;