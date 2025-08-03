import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'alert' | 'reminder' | 'report' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  alert_notifications: boolean;
  report_notifications: boolean;
  reminder_notifications: boolean;
  notification_frequency: 'immediate' | 'hourly' | 'daily';
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const NotificationCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    alert_notifications: true,
    report_notifications: true,
    reminder_notifications: true,
    notification_frequency: 'immediate',
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user?.tenant_id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    if (!user?.tenant_id) return;

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .single();

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      toast({
        title: "Notificación marcada como leída",
        description: "La notificación ha sido actualizada"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar la notificación como leída",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('tenant_id', user?.tenant_id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));

      toast({
        title: "Todas las notificaciones marcadas como leídas",
        description: "Se han actualizado todas las notificaciones"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron marcar las notificaciones como leídas",
        variant: "destructive"
      });
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          tenant_id: user?.tenant_id,
          ...settings,
          ...newSettings
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...newSettings }));

      toast({
        title: "Configuración actualizada",
        description: "Los cambios se han guardado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive"
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'reminder':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'report':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'system':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Alta</Badge>;
      case 'medium':
        return <Badge variant="secondary">Media</Badge>;
      case 'low':
        return <Badge variant="outline">Baja</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const getNotificationsByType = (type: string) => {
    return notifications.filter(n => n.type === type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Centro de Notificaciones</h2>
          <p className="text-muted-foreground">
            Gestiona tus alertas y notificaciones del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {getUnreadCount()} sin leer
          </Badge>
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={getUnreadCount() === 0}
          >
            Marcar todas como leídas
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
          <TabsTrigger value="alerts">Alertas ({getNotificationsByType('alert').length})</TabsTrigger>
          <TabsTrigger value="reminders">Recordatorios ({getNotificationsByType('reminder').length})</TabsTrigger>
          <TabsTrigger value="reports">Reportes ({getNotificationsByType('report').length})</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <NotificationsList 
            notifications={notifications} 
            onMarkAsRead={markAsRead}
            getNotificationIcon={getNotificationIcon}
            getPriorityBadge={getPriorityBadge}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <NotificationsList 
            notifications={getNotificationsByType('alert')} 
            onMarkAsRead={markAsRead}
            getNotificationIcon={getNotificationIcon}
            getPriorityBadge={getPriorityBadge}
          />
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <NotificationsList 
            notifications={getNotificationsByType('reminder')} 
            onMarkAsRead={markAsRead}
            getNotificationIcon={getNotificationIcon}
            getPriorityBadge={getPriorityBadge}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <NotificationsList 
            notifications={getNotificationsByType('report')} 
            onMarkAsRead={markAsRead}
            getNotificationIcon={getNotificationIcon}
            getPriorityBadge={getPriorityBadge}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>
                Personaliza cómo recibes las notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Channels */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Canales de Notificación</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div>
                        <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones en tu correo electrónico
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.email_notifications}
                      onCheckedChange={(checked) => updateSettings({ email_notifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-green-500" />
                      <div>
                        <Label htmlFor="push-notifications">Notificaciones Push</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones en tiempo real
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.push_notifications}
                      onCheckedChange={(checked) => updateSettings({ push_notifications: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Notification Types */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tipos de Notificación</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div>
                        <Label htmlFor="alert-notifications">Alertas de Bienestar</Label>
                        <p className="text-sm text-muted-foreground">
                          Notificaciones sobre alertas de burnout y estrés
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="alert-notifications"
                      checked={settings.alert_notifications}
                      onCheckedChange={(checked) => updateSettings({ alert_notifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <Label htmlFor="report-notifications">Reportes Semanales</Label>
                        <p className="text-sm text-muted-foreground">
                          Resúmenes semanales del bienestar del equipo
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="report-notifications"
                      checked={settings.report_notifications}
                      onCheckedChange={(checked) => updateSettings({ report_notifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <div>
                        <Label htmlFor="reminder-notifications">Recordatorios de Check-in</Label>
                        <p className="text-sm text-muted-foreground">
                          Recordatorios para completar check-ins diarios
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="reminder-notifications"
                      checked={settings.reminder_notifications}
                      onCheckedChange={(checked) => updateSettings({ reminder_notifications: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Frequency Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Frecuencia de Notificaciones</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notification-frequency">Frecuencia</Label>
                    <Select
                      value={settings.notification_frequency}
                      onValueChange={(value) => updateSettings({ notification_frequency: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Inmediata</SelectItem>
                        <SelectItem value="hourly">Cada hora</SelectItem>
                        <SelectItem value="daily">Diaria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quiet-hours-start">Inicio Horas Silenciosas</Label>
                      <input
                        type="time"
                        id="quiet-hours-start"
                        value={settings.quiet_hours_start}
                        onChange={(e) => updateSettings({ quiet_hours_start: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiet-hours-end">Fin Horas Silenciosas</Label>
                      <input
                        type="time"
                        id="quiet-hours-end"
                        value={settings.quiet_hours_end}
                        onChange={(e) => updateSettings({ quiet_hours_end: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  getNotificationIcon: (type: string) => React.ReactNode;
  getPriorityBadge: (priority: string) => React.ReactNode;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  onMarkAsRead,
  getNotificationIcon,
  getPriorityBadge
}) => {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No hay notificaciones</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <Card key={notification.id} className={!notification.read ? 'border-l-4 border-l-blue-500' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{notification.title}</h4>
                    {getPriorityBadge(notification.priority)}
                    {!notification.read && (
                      <Badge variant="default" className="text-xs">Nuevo</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {!notification.read && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  Marcar como leída
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotificationCenter; 