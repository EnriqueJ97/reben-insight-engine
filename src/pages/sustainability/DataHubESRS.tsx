import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';

const DataHubESRS = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Upload className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Data Hub ESRS</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Módulo en Desarrollo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            El Data Hub ESRS estará disponible próximamente. 
            Permitirá gestionar todos los puntos de datos requeridos por los estándares ESRS.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataHubESRS;