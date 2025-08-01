import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, Activity, AlertTriangle, Plus, Edit, Ban, CheckCircle, BarChart3 } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  domain?: string;
  created_at: string;
  updated_at: string;
  settings: any;
}

interface PlatformMetrics {
  totalTenants: number;
  totalUsers: number;
  totalCheckins: number;
  totalAlerts: number;
}

interface TenantWithMetrics extends Tenant {
  userCount: number;
  checkinCount: number;
  alertCount: number;
}

type SubscriptionPlan = 'basic' | 'premium' | 'enterprise';

interface NewTenantForm {
  name: string;
  domain: string;
  subscription_plan: SubscriptionPlan;
  max_users: number;
}

export default function SuperAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tenants, setTenants] = useState<TenantWithMetrics[]>([]);
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTenant, setNewTenant] = useState<NewTenantForm>({
    name: '',
    domain: '',
    subscription_plan: 'basic',
    max_users: 50
  });

  // Verificar que el usuario es SUPER_ADMIN
  if (user?.role !== 'SUPER_ADMIN' as any) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground">No tienes permisos para acceder al panel de Super-Admin.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchTenants(), fetchMetrics()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      // Obtener tenants básicos
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*');

      if (tenantsError) throw tenantsError;

      // Obtener métricas por tenant
      const tenantsWithMetrics = await Promise.all(
        (tenantsData || []).map(async (tenant) => {
          const [usersResult, checkinsResult, alertsResult] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact' }).eq('tenant_id', tenant.id),
            supabase.from('checkins').select('id', { count: 'exact' }).in('user_id', 
              await supabase.from('profiles').select('id').eq('tenant_id', tenant.id).then(r => r.data?.map(p => p.id) || [])
            ),
            supabase.from('alerts').select('id', { count: 'exact' }).in('user_id',
              await supabase.from('profiles').select('id').eq('tenant_id', tenant.id).then(r => r.data?.map(p => p.id) || [])
            )
          ]);

          return {
            ...tenant,
            userCount: usersResult.count || 0,
            checkinCount: checkinsResult.count || 0,
            alertCount: alertsResult.count || 0,
          };
        })
      );

      setTenants(tenantsWithMetrics);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenants([]);
    }
  };

  const fetchMetrics = async () => {
    try {
      const [tenantsResult, usersResult, checkinsResult, alertsResult] = await Promise.all([
        supabase.from('tenants').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('checkins').select('id', { count: 'exact' }),
        supabase.from('alerts').select('id', { count: 'exact' })
      ]);

      setMetrics({
        totalTenants: tenantsResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalCheckins: checkinsResult.count || 0,
        totalAlerts: alertsResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const createTenant = async () => {
    try {
      const { error } = await supabase
        .from('tenants')
        .insert([{
          name: newTenant.name,
          domain: newTenant.domain || null,
          settings: {}
        }]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Empresa creada exitosamente.",
      });

      setNewTenant({ name: '', domain: '', subscription_plan: 'basic', max_users: 50 });
      setIsCreateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating tenant:', error);
      toast({
        title: "Error",
        description: "Error al crear la empresa.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel Super-Admin</h1>
          <p className="text-muted-foreground">Gestiona todas las empresas y la plataforma REBEN</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Empresa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Empresa</DialogTitle>
              <DialogDescription>
                Añade una nueva empresa cliente a la plataforma.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la Empresa</Label>
                <Input
                  id="name"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Empresa ABC S.A."
                />
              </div>
              <div>
                <Label htmlFor="domain">Dominio (opcional)</Label>
                <Input
                  id="domain"
                  value={newTenant.domain}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="empresa.com"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createTenant} disabled={!newTenant.name}>
                  Crear Empresa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Métricas de la Plataforma */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Total Empresas</span>
              </div>
              <div className="text-2xl font-bold">{metrics.totalTenants}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Total Usuarios</span>
              </div>
              <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Check-ins</span>
              </div>
              <div className="text-2xl font-bold">{metrics.totalCheckins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Alertas</span>
              </div>
              <div className="text-2xl font-bold">{metrics.totalAlerts}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs para diferentes secciones */}
      <Tabs defaultValue="tenants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tenants">Empresas</TabsTrigger>
          <TabsTrigger value="metrics">Métricas Detalladas</TabsTrigger>
          <TabsTrigger value="logs">Logs del Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Empresas</CardTitle>
              <CardDescription>
                Administra todas las empresas cliente de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Usuarios</TableHead>
                    <TableHead>Check-ins</TableHead>
                    <TableHead>Alertas</TableHead>
                    <TableHead>Creada</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tenant.name}</div>
                          {tenant.domain && (
                            <div className="text-sm text-muted-foreground">{tenant.domain}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{tenant.userCount}</TableCell>
                      <TableCell className="text-center">{tenant.checkinCount}</TableCell>
                      <TableCell className="text-center">{tenant.alertCount}</TableCell>
                      <TableCell>{new Date(tenant.created_at).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Métricas Detalladas</CardTitle>
              <CardDescription>
                Análisis profundo del uso de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Métricas detalladas próximamente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs del Sistema</CardTitle>
              <CardDescription>
                Registros de actividad de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Sistema de logs próximamente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}