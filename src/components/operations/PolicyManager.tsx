import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Plus, Settings, Clock, MapPin, Users, CheckCircle } from 'lucide-react';

interface FlexPolicy {
  id: string;
  name: string;
  min_on_site_days: number;
  core_hours: any;
  allowed_modes: string[];
  is_active: boolean;
  created_at: string;
  tenant_id: string;
}

const PolicyManager = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<FlexPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    min_on_site_days: 3,
    core_hours_start: '09:00',
    core_hours_end: '17:00',
    allowed_modes: ['OFFICE', 'REMOTE', 'HYBRID'] as string[]
  });

  useEffect(() => {
    if (user) {
      loadPolicies();
    }
  }, [user]);

  const loadPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('flex_policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Error al cargar las políticas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createPolicy = async () => {
    try {
      // Get current user's tenant
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('flex_policies')
        .insert({
          name: newPolicy.name,
          min_on_site_days: newPolicy.min_on_site_days,
          core_hours: {
            start: newPolicy.core_hours_start,
            end: newPolicy.core_hours_end
          },
          allowed_modes: newPolicy.allowed_modes,
          is_active: false,
          tenant_id: userProfile?.tenant_id
        })
        .select()
        .single();

      if (error) throw error;

      setPolicies([data, ...policies]);
      setShowCreateDialog(false);
      setNewPolicy({
        name: '',
        description: '',
        min_on_site_days: 3,
        core_hours_start: '09:00',
        core_hours_end: '17:00',
        allowed_modes: ['OFFICE', 'REMOTE', 'HYBRID']
      });

      toast({
        title: 'Éxito',
        description: 'Política creada correctamente'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Error al crear la política',
        variant: 'destructive'
      });
    }
  };

  const togglePolicyStatus = async (policyId: string, isActive: boolean) => {
    try {
      // If activating this policy, deactivate all others first
      if (isActive) {
        await supabase
          .from('flex_policies')
          .update({ is_active: false })
          .neq('id', policyId);
      }

      const { error } = await supabase
        .from('flex_policies')
        .update({ is_active: isActive })
        .eq('id', policyId);

      if (error) throw error;

      setPolicies(policies.map(p => 
        p.id === policyId 
          ? { ...p, is_active: isActive }
          : { ...p, is_active: isActive ? false : p.is_active }
      ));

      toast({
        title: 'Éxito',
        description: `Política ${isActive ? 'activada' : 'desactivada'} correctamente`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Error al actualizar la política',
        variant: 'destructive'
      });
    }
  };

  const handleModeChange = (mode: string, checked: boolean) => {
    if (checked) {
      setNewPolicy({
        ...newPolicy,
        allowed_modes: [...newPolicy.allowed_modes, mode]
      });
    } else {
      setNewPolicy({
        ...newPolicy,
        allowed_modes: newPolicy.allowed_modes.filter(m => m !== mode)
      });
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'OFFICE': return <MapPin className="w-4 h-4" />;
      case 'REMOTE': return <Settings className="w-4 h-4" />;
      case 'HYBRID': return <Users className="w-4 h-4" />;
      default: return null;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'OFFICE': return 'Oficina';
      case 'REMOTE': return 'Remoto';
      case 'HYBRID': return 'Híbrido';
      default: return mode;
    }
  };

  if (loading) {
    return <div className="p-6">Cargando políticas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Políticas de Flexibilidad</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Política
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Política</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="policy-name">Nombre de la Política</Label>
                <Input
                  id="policy-name"
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                  placeholder="Ej: Política Personalizada"
                />
              </div>

              <div>
                <Label htmlFor="min-days">Días mínimos en oficina</Label>
                <Select
                  value={newPolicy.min_on_site_days.toString()}
                  onValueChange={(value) => setNewPolicy({ ...newPolicy, min_on_site_days: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 días</SelectItem>
                    <SelectItem value="1">1 día</SelectItem>
                    <SelectItem value="2">2 días</SelectItem>
                    <SelectItem value="3">3 días</SelectItem>
                    <SelectItem value="4">4 días</SelectItem>
                    <SelectItem value="5">5 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Hora inicio</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={newPolicy.core_hours_start}
                    onChange={(e) => setNewPolicy({ ...newPolicy, core_hours_start: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">Hora fin</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={newPolicy.core_hours_end}
                    onChange={(e) => setNewPolicy({ ...newPolicy, core_hours_end: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Modalidades permitidas</Label>
                <div className="flex gap-4 mt-2">
                  {['OFFICE', 'REMOTE', 'HYBRID'].map((mode) => (
                    <div key={mode} className="flex items-center space-x-2">
                      <Checkbox
                        id={mode}
                        checked={newPolicy.allowed_modes.includes(mode)}
                        onCheckedChange={(checked) => handleModeChange(mode, checked as boolean)}
                      />
                      <label htmlFor={mode} className="text-sm flex items-center gap-1">
                        {getModeIcon(mode)}
                        {getModeLabel(mode)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={createPolicy} disabled={!newPolicy.name.trim()}>
                  Crear Política
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {policies.map((policy) => (
          <Card key={policy.id} className={policy.is_active ? 'ring-2 ring-primary/20' : ''}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{policy.name}</CardTitle>
                  {policy.is_active && (
                    <Badge variant="default" className="bg-primary">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Activa
                    </Badge>
                  )}
                </div>
                <Switch
                  checked={policy.is_active}
                  onCheckedChange={(checked) => togglePolicyStatus(policy.id, checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>Min. {policy.min_on_site_days} días oficina</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{policy.core_hours.start} - {policy.core_hours.end}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    {policy.allowed_modes.map((mode) => (
                      <Badge key={mode} variant="secondary" className="text-xs">
                        {getModeLabel(mode)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {policies.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Settings className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                No hay políticas configuradas. Crea una nueva política para empezar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PolicyManager;