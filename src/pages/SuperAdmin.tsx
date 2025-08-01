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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Tenant {
  id: string;
  name: string;
  domain?: string;
  status: 'active' | 'suspended';
  subscription_plan: 'basic' | 'premium' | 'enterprise';
  subscription_status: 'active' | 'cancelled' | 'expired';
  max_users: number;
  created_at: string;
  updated_at: string;
}

interface PlatformMetrics {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalCheckins: number;
  totalAlerts: number;
}

interface TenantWithMetrics extends Tenant {
  userCount: number;
  checkinCount: number;
  alertCount: number;
}

export default function SuperAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tenants, setTenants] = useState<TenantWithMetrics[]>([]);
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [newTenant, setNewTenant] = useState({
    name: '',
    domain: '',
    subscription_plan: 'basic' as const,
    max_users: 50
  });

  // Verificar que el usuario es SUPER_ADMIN
  if (user?.role !== 'SUPER_ADMIN') {
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
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        profiles:profiles(count),
        checkins:checkins(count),
        alerts:alerts(count)
      `);

    if (error) throw error;

    const tenantsWithMetrics = data?.map(tenant => ({
      ...tenant,
      userCount: tenant.profiles?.[0]?.count || 0,
      checkinCount: tenant.checkins?.[0]?.count || 0,
      alertCount: tenant.alerts?.[0]?.count || 0,
    })) || [];

    setTenants(tenantsWithMetrics);
  };

  const fetchMetrics = async () => {
    const [tenantsResult, usersResult, checkinsResult, alertsResult] = await Promise.all([
      supabase.from('tenants').select('id, status'),
      supabase.from('profiles').select('id'),
      supabase.from('checkins').select('id'),
      supabase.from('alerts').select('id')
    ]);

    const totalTenants = tenantsResult.data?.length || 0;
    const activeTenants = tenantsResult.data?.filter(t => t.status === 'active').length || 0;
    const totalUsers = usersResult.data?.length || 0;
    const totalCheckins = checkinsResult.data?.length || 0;
    const totalAlerts = alertsResult.data?.length || 0;

    setMetrics({
      totalTenants,
      activeTenants,
      totalUsers,
      totalCheckins,
      totalAlerts
    });
  };

  const createTenant = async () => {
    try {
      const { error } = await supabase
        .from('tenants')
        .insert([{
          name: newTenant.name,
          domain: newTenant.domain || null,
          subscription_plan: newTenant.subscription_plan,
          max_users: newTenant.max_users,
          status: 'active',
          subscription_status: 'active'
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

  const updateTenantStatus = async (tenantId: string, status: 'active' | 'suspended') => {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ status })
        .eq('id', tenantId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Empresa ${status === 'active' ? 'activada' : 'suspendida'} exitosamente.`,
      });

      fetchData();
    } catch (error) {
      console.error('Error updating tenant status:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el estado de la empresa.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Activa
      </Badge>
    ) : (
      <Badge variant="destructive">
        <Ban className="w-3 h-3 mr-1" />
        Suspendida
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      basic: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    };
    return (
      <Badge variant="outline" className={colors[plan as keyof typeof colors]}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
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
              <div>
                <Label htmlFor="plan">Plan de Suscripción</Label>
                <Select 
                  value={newTenant.subscription_plan} 
                  onValueChange={(value: 'basic' | 'premium' | 'enterprise') => 
                    setNewTenant(prev => ({ ...prev, subscription_plan: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maxUsers">Máximo de Usuarios</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={newTenant.max_users}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, max_users: parseInt(e.target.value) || 50 }))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Empresas Activas</span>
              </div>
              <div className="text-2xl font-bold">{metrics.activeTenants}</div>
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
                    <TableHead>Estado</TableHead>
                    <TableHead>Plan</TableHead>
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
                      <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                      <TableCell>{getPlanBadge(tenant.subscription_plan)}</TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{tenant.userCount}</div>
                          <div className="text-xs text-muted-foreground">/ {tenant.max_users}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{tenant.checkinCount}</TableCell>
                      <TableCell className="text-center">{tenant.alertCount}</TableCell>
                      <TableCell>{new Date(tenant.created_at).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3" />
                          </Button>
                          {tenant.status === 'active' ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Ban className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Suspender Empresa</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Estás seguro de que quieres suspender "{tenant.name}"? Los usuarios no podrán acceder hasta que se reactive.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => updateTenantStatus(tenant.id, 'suspended')}>
                                    Suspender
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateTenantStatus(tenant.id, 'active')}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
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