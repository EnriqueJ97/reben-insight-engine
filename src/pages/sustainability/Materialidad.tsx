import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const Materialidad = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Análisis de Materialidad</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Módulo en Desarrollo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            El módulo de análisis de materialidad estará disponible próximamente. 
            Incluirá matriz interactiva de doble materialidad y gestión de IROs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Materialidad;