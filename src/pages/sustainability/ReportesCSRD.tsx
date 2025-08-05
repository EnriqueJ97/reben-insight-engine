import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

const ReportesCSRD = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Mail className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Reportes CSRD</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Módulo en Desarrollo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            El generador de reportes CSRD estará disponible próximamente. 
            Incluirá generación XHTML/ESEF y exportación PDF.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportesCSRD;