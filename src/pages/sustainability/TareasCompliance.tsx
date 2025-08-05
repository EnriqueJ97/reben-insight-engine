import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const TareasCompliance = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Tareas de Compliance</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Módulo en Desarrollo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            El módulo de tareas de compliance estará disponible próximamente. 
            Incluirá kanban de tareas, asignaciones y seguimiento de progreso.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TareasCompliance;