import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { useAlerts } from '@/hooks/useAlerts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CreateAlertDialog = () => {
  const { user } = useAuth();
  const { profiles: teamMembers } = useProfiles();
  const { createAlert, fetchAlerts } = useAlerts();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    type: '',
    severity: '' as 'low' | 'medium' | 'high',
    message: ''
  });

  const alertTypes = [
    { value: 'burnout_risk', label: 'Riesgo de Burnout' },
    { value: 'turnover_risk', label: 'Riesgo de Fuga' },
    { value: 'low_satisfaction', label: 'Baja Satisfacción' },
    { value: 'high_stress', label: 'Alto Estrés' },
    { value: 'attendance_issue', label: 'Problema de Asistencia' },
    { value: 'performance_decline', label: 'Declive de Rendimiento' },
    { value: 'general_concern', label: 'Preocupación General' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.type || !formData.severity || !formData.message.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      await createAlert(
        formData.userId,
        formData.type,
        formData.severity,
        formData.message.trim()
      );

      toast({
        title: "Alerta creada",
        description: "La alerta ha sido creada exitosamente."
      });

      setOpen(false);
      setFormData({
        userId: '',
        type: '',
        severity: '' as 'low' | 'medium' | 'high',
        message: ''
      });
      
      fetchAlerts(); // Refresh alerts
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la alerta. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Filter team members based on user role
  const availableMembers = teamMembers.filter(member => {
    if (user?.role === 'HR_ADMIN') return true; // HR can create alerts for anyone
    if (user?.role === 'MANAGER') {
      // Managers can only create alerts for their team members
      return member.team_id === user.team_id;
    }
    return false; // Employees can't create alerts for others
  });

  if (user?.role === 'EMPLOYEE') {
    return null; // Employees can't create alerts for others
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear Alerta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Crear Nueva Alerta</span>
          </DialogTitle>
          <DialogDescription>
            Crea una alerta manual para un miembro del equipo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">Empleado *</Label>
            <Select value={formData.userId} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, userId: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un empleado" />
              </SelectTrigger>
              <SelectContent>
                {availableMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name || member.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Alerta *</Label>
            <Select value={formData.type} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, type: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {alertTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severidad *</Label>
            <Select value={formData.severity} onValueChange={(value: 'low' | 'medium' | 'high') => 
              setFormData(prev => ({ ...prev, severity: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la severidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje *</Label>
            <Textarea
              id="message"
              placeholder="Describe la situación o preocupación..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <div className="w-4 h-4 animate-spin rounded-full border border-current border-t-transparent mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Crear Alerta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};