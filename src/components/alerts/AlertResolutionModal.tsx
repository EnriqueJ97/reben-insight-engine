import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  user_id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  created_at: string;
  resolved: boolean;
  profiles?: {
    full_name: string;
  };
}

interface AlertResolutionModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: () => void;
}

export const AlertResolutionModal = ({ alert, isOpen, onClose, onResolve }: AlertResolutionModalProps) => {
  const [comment, setComment] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const { resolveAlert } = useAlerts();
  const { toast } = useToast();

  if (!alert) return null;

  const handleResolve = async () => {
    if (!comment.trim()) {
      toast({
        title: "Comentario requerido",
        description: "Por favor, añade un comentario sobre la resolución.",
        variant: "destructive"
      });
      return;
    }

    setIsResolving(true);
    try {
      await resolveAlert(alert.id);
      toast({
        title: "Alerta resuelta",
        description: "La alerta ha sido marcada como resuelta exitosamente.",
      });
      onResolve();
      onClose();
      setComment('');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo resolver la alerta. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsResolving(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'low': return 'bg-info/20 text-info border-info/30';
      default: return 'bg-muted';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return severity;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>Resolver Alerta</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la alerta */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <Badge className={getSeverityColor(alert.severity)}>
                Severidad: {getSeverityText(alert.severity)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(alert.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <h4 className="font-medium mb-1">
              {alert.profiles?.full_name || 'Usuario'}
            </h4>
            
            <p className="text-sm text-muted-foreground">
              {alert.message}
            </p>
          </div>

          {/* Campo de comentario */}
          <div className="space-y-2">
            <Label htmlFor="resolution-comment">
              Comentario de resolución *
            </Label>
            <Textarea
              id="resolution-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe las acciones tomadas para resolver esta alerta..."
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Este comentario será registrado en el historial de la alerta.
            </p>
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isResolving}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleResolve}
            disabled={isResolving || !comment.trim()}
            className="bg-success hover:bg-success/90 text-white"
          >
            {isResolving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Resolviendo...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar Resuelto
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};