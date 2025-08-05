import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NotificationCenter = () => {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Centro de Notificaciones</span>
          </CardTitle>
          <CardDescription>
            Funcionalidad en desarrollo. Las tablas de notificaciones se han creado correctamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Centro de Notificaciones</h3>
            <p className="text-muted-foreground mb-4">
              Esta funcionalidad estará disponible una vez que se regeneren los tipos de TypeScript.
            </p>
            <Button 
              onClick={() => toast({ 
                title: "En desarrollo", 
                description: "El centro de notificaciones estará disponible pronto." 
              })}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar Notificaciones
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;