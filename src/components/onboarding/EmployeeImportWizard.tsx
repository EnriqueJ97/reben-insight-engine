import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Download, AlertCircle, CheckCircle2, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmployeeImportWizardProps {
  onComplete: () => void;
}

export const EmployeeImportWizard = ({ onComplete }: EmployeeImportWizardProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: number;
    details: string[];
  } | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const downloadTemplate = () => {
    const csvContent = `full_name,email,role,team_name
Juan Pérez,juan.perez@empresa.com,EMPLOYEE,Equipo Desarrollo
María García,maria.garcia@empresa.com,MANAGER,Equipo Desarrollo
Pedro López,pedro.lopez@empresa.com,EMPLOYEE,Equipo Marketing`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_empleados_reben.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Formato inválido",
          description: "Por favor sube un archivo CSV",
          variant: "destructive"
        });
        return;
      }

      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const processCSV = async () => {
    if (!file || !user) return;

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('El archivo está vacío o no contiene datos');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['full_name', 'email', 'role'];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        throw new Error(`Faltan columnas requeridas: ${missingHeaders.join(', ')}`);
      }

      // Invoke edge function to process import
      const { data, error } = await supabase.functions.invoke('process-employee-import', {
        body: {
          csvData: text,
          tenant_id: user.tenant_id
        }
      });

      if (error) throw error;

      if (data.success) {
        setImportResult({
          success: data.imported,
          errors: data.errors,
          details: data.details || []
        });

        toast({
          title: "Importación completada",
          description: `${data.imported} empleados importados correctamente`,
          duration: 5000
        });
      } else {
        throw new Error(data.error || 'Error en la importación');
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Error en la importación",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Users className="w-12 h-12 mx-auto text-primary" />
        <h3 className="text-xl font-semibold">Importar Empleados</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Sube un archivo CSV con la información de tus empleados. 
          Descarga la plantilla para ver el formato correcto.
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Formato requerido:</strong> El CSV debe incluir las columnas:
          <code className="ml-2 px-2 py-0.5 bg-muted rounded">full_name</code>,
          <code className="ml-2 px-2 py-0.5 bg-muted rounded">email</code>,
          <code className="ml-2 px-2 py-0.5 bg-muted rounded">role</code> (EMPLOYEE, MANAGER, HR_ADMIN)
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar Plantilla CSV
        </Button>

        <div className="space-y-2">
          <Label htmlFor="csv-file">Subir archivo CSV</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={importing}
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              Archivo seleccionado: {file.name}
            </p>
          )}
        </div>

        {file && !importResult && (
          <Button
            onClick={processCSV}
            disabled={importing}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {importing ? 'Importando...' : 'Importar Empleados'}
          </Button>
        )}

        {importResult && (
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">Resultado de la Importación</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <p className="text-green-600 dark:text-green-400">
                ✓ {importResult.success} empleados importados correctamente
              </p>
              {importResult.errors > 0 && (
                <p className="text-yellow-600 dark:text-yellow-400">
                  ⚠ {importResult.errors} errores encontrados
                </p>
              )}
              
              {importResult.details.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Detalles:</p>
                  <ul className="space-y-1 text-xs">
                    {importResult.details.slice(0, 5).map((detail, idx) => (
                      <li key={idx} className="text-muted-foreground">• {detail}</li>
                    ))}
                    {importResult.details.length > 5 && (
                      <li className="text-muted-foreground">
                        ... y {importResult.details.length - 5} más
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => {
            if (importResult && importResult.success > 0) {
              onComplete();
            }
          }}
          disabled={!importResult || importResult.success === 0}
        >
          {importResult && importResult.success > 0 ? 'Continuar' : 'Saltar este paso'}
        </Button>
      </div>
    </div>
  );
};
