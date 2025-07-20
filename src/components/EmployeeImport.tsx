import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle, AlertCircle, Users, Download } from 'lucide-react';

interface CSVRow {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  equipo: string;
  valid: boolean;
  errors: string[];
}

interface ImportStats {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  imported: number;
}

const EmployeeImport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [stats, setStats] = useState<ImportStats>({ total: 0, valid: 0, invalid: 0, duplicates: 0, imported: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [progress, setProgress] = useState(0);

  const validateCSVRow = async (row: any): Promise<{ valid: boolean; errors: string[] }> => {
    const errors: string[] = [];
    
    // Validar campos requeridos
    if (!row.nombre?.trim()) errors.push('Nombre es requerido');
    if (!row.email?.trim()) errors.push('Email es requerido');
    if (!row.rol?.trim()) errors.push('Rol es requerido');
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (row.email && !emailRegex.test(row.email)) {
      errors.push('Formato de email inválido');
    }
    
    // Validar rol válido
    const validRoles = ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'];
    if (row.rol && !validRoles.includes(row.rol.toUpperCase())) {
      errors.push('Rol debe ser: EMPLOYEE, MANAGER o HR_ADMIN');
    }
    
    // Verificar si el email ya existe
    if (row.email) {
      const { data } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', row.email.toLowerCase())
        .eq('tenant_id', user?.tenant_id);
      
      if (data && data.length > 0) {
        errors.push('Email ya existe en el sistema');
      }
    }
    
    return { valid: errors.length === 0, errors };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo CSV válido",
        variant: "destructive"
      });
    }
  };

  const parseCSV = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setStep('preview');
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('El archivo debe contener al menos una fila de datos además del encabezado');
      }
      
      // Parsear encabezados
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const expectedHeaders = ['id', 'nombre', 'email', 'rol', 'equipo'];
      
      // Verificar encabezados requeridos
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        throw new Error(`Encabezados faltantes: ${missingHeaders.join(', ')}`);
      }
      
      // Parsear datos
      const rows: CSVRow[] = [];
      let valid = 0;
      let invalid = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });
        
        const validation = await validateCSVRow(rowData);
        
        const csvRow: CSVRow = {
          id: rowData.id || `emp_${Date.now()}_${i}`,
          nombre: rowData.nombre,
          email: rowData.email.toLowerCase(),
          rol: rowData.rol.toUpperCase(),
          equipo: rowData.equipo,
          valid: validation.valid,
          errors: validation.errors
        };
        
        rows.push(csvRow);
        
        if (validation.valid) {
          valid++;
        } else {
          invalid++;
        }
        
        setProgress(Math.round((i / (lines.length - 1)) * 100));
      }
      
      setCsvData(rows);
      setStats({ total: rows.length, valid, invalid, duplicates: 0, imported: 0 });
      
    } catch (error) {
      toast({
        title: "Error al procesar CSV",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const importEmployees = async () => {
    setStep('importing');
    setIsProcessing(true);
    setProgress(0);
    
    const validRows = csvData.filter(row => row.valid);
    let imported = 0;
    
    try {
      // Crear o encontrar equipos
      const teams = new Set(validRows.map(row => row.equipo).filter(Boolean));
      const teamMap = new Map<string, string>();
      
      for (const teamName of teams) {
        if (teamName) {
          const { data: existingTeam } = await supabase
            .from('teams')
            .select('id, name')
            .eq('name', teamName)
            .eq('tenant_id', user?.tenant_id)
            .single();
          
          if (existingTeam) {
            teamMap.set(teamName, existingTeam.id);
          } else {
            const { data: newTeam } = await supabase
              .from('teams')
              .insert({
                name: teamName,
                tenant_id: user?.tenant_id
              })
              .select('id')
              .single();
            
            if (newTeam) {
              teamMap.set(teamName, newTeam.id);
            }
          }
        }
      }
      
      // Importar empleados por lotes
      const batchSize = 10;
      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize);
        
        const insertData = batch.map(row => ({
          tenant_id: user?.tenant_id,
          team_id: row.equipo ? teamMap.get(row.equipo) : null,
          email: row.email,
          full_name: row.nombre,
          role: row.rol as 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN'
        }));
        
        // Crear usuarios en auth si no existen
        for (const row of batch) {
          try {
            const { error } = await supabase.auth.admin.createUser({
              email: row.email,
              email_confirm: true,
              user_metadata: {
                full_name: row.nombre,
                role: row.rol
              }
            });
            
            if (!error) {
              imported++;
            }
          } catch (authError) {
            console.error(`Error creating auth user for ${row.email}:`, authError);
          }
        }
        
        setProgress(Math.round(((i + batch.length) / validRows.length) * 100));
      }
      
      setStats(prev => ({ ...prev, imported }));
      setStep('complete');
      
      toast({
        title: "Importación completada",
        description: `Se importaron ${imported} empleados exitosamente`,
      });
      
    } catch (error) {
      console.error('Error importing employees:', error);
      toast({
        title: "Error en la importación",
        description: "Ocurrió un error durante la importación",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = `id,nombre,email,rol,equipo
emp_001,Juan Pérez,juan.perez@empresa.com,EMPLOYEE,Desarrollo
emp_002,María García,maria.garcia@empresa.com,MANAGER,Desarrollo
emp_003,Carlos López,carlos.lopez@empresa.com,HR_ADMIN,RRHH`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_empleados.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setFile(null);
    setCsvData([]);
    setStats({ total: 0, valid: 0, invalid: 0, duplicates: 0, imported: 0 });
    setStep('upload');
    setProgress(0);
  };

  if (user?.role !== 'HR_ADMIN') {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Acceso Denegado</h2>
        <p className="text-muted-foreground">Solo los administradores de RRHH pueden importar empleados.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
          <Users className="h-8 w-8 text-primary" />
          <span>Importar Empleados</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Carga masiva de empleados desde archivo CSV
        </p>
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subir archivo CSV</CardTitle>
              <CardDescription>
                Selecciona un archivo CSV con la información de los empleados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">Archivo CSV</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                />
              </div>
              
              {file && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Archivo seleccionado: {file.name} ({Math.round(file.size / 1024)} KB)
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex space-x-2">
                <Button onClick={parseCSV} disabled={!file || isProcessing}>
                  <Upload className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Procesando...' : 'Procesar CSV'}
                </Button>
                
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Plantilla
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle>Formato requerido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Columnas requeridas:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>id:</strong> Identificador único del empleado</li>
                  <li><strong>nombre:</strong> Nombre completo</li>
                  <li><strong>email:</strong> Dirección de correo electrónico</li>
                  <li><strong>rol:</strong> EMPLOYEE, MANAGER o HR_ADMIN</li>
                  <li><strong>equipo:</strong> Nombre del equipo (opcional)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vista previa de importación</CardTitle>
              <CardDescription>
                Revisa los datos antes de importar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
                  <div className="text-sm text-muted-foreground">Válidos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.invalid}</div>
                  <div className="text-sm text-muted-foreground">Inválidos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.duplicates}</div>
                  <div className="text-sm text-muted-foreground">Duplicados</div>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {csvData.slice(0, 10).map((row, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${row.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{row.nombre}</div>
                        <div className="text-sm text-muted-foreground">{row.email} - {row.rol}</div>
                        {row.equipo && <div className="text-xs text-muted-foreground">Equipo: {row.equipo}</div>}
                      </div>
                      <div className="flex items-center space-x-2">
                        {row.valid ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Válido
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!row.valid && (
                      <div className="mt-2 text-xs text-red-600">
                        {row.errors.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
                {csvData.length > 10 && (
                  <div className="text-center text-sm text-muted-foreground">
                    ... y {csvData.length - 10} registros más
                  </div>
                )}
              </div>

              <div className="flex space-x-2 mt-6">
                <Button 
                  onClick={importEmployees} 
                  disabled={stats.valid === 0}
                  className="flex-1"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Importar {stats.valid} empleados válidos
                </Button>
                <Button variant="outline" onClick={resetImport}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Importing */}
      {step === 'importing' && (
        <Card>
          <CardHeader>
            <CardTitle>Importando empleados...</CardTitle>
            <CardDescription>
              Por favor espera mientras se procesan los datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} />
              <div className="text-center text-sm text-muted-foreground">
                {progress}% completado
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">¡Importación completada!</CardTitle>
            <CardDescription>
              Se han importado los empleados exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Procesados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.imported}</div>
                <div className="text-sm text-muted-foreground">Importados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.invalid}</div>
                <div className="text-sm text-muted-foreground">Rechazados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total - stats.invalid}</div>
                <div className="text-sm text-muted-foreground">Cuentas creadas</div>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Los empleados importados recibirán un email para activar su cuenta y establecer su contraseña.
              </AlertDescription>
            </Alert>

            <Button onClick={resetImport} className="w-full mt-4">
              Importar más empleados
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployeeImport;