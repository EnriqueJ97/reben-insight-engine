import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, CreditCard, Users, Building2, DollarSign } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  domain?: string;
  status: 'active' | 'suspended';
  subscription_plan: 'lite' | 'esencial' | 'profesional' | 'enterprise';
  subscription_status: 'active' | 'cancelled' | 'expired';
  max_users: number;
  contract_start_date?: string;
  contract_end_date?: string;
  mrr?: number;
  arr?: number;
  created_at: string;
  updated_at: string;
  settings: any;
}

interface TenantBilling {
  id: string;
  tenant_id: string;
  billing_email: string;
  billing_address?: any;
  payment_method: string;
  monthly_price: number;
  annual_price?: number;
  currency: string;
  payment_day: number;
  next_billing_date?: string;
  last_payment_date?: string;
  payment_status: string;
  tax_rate: number;
  notes?: string;
}

interface TenantEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  onUpdate: () => void;
}

export default function TenantEditDialog({ isOpen, onOpenChange, tenant, onUpdate }: TenantEditDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState<TenantBilling | null>(null);
  const [editedTenant, setEditedTenant] = useState<Tenant | null>(null);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    if (tenant && isOpen) {
      setEditedTenant({ ...tenant });
      fetchBillingData();
      fetchActiveUsers();
    }
  }, [tenant, isOpen]);

  const fetchBillingData = async () => {
    if (!tenant) return;
    
    try {
      const { data, error } = await supabase
        .from('tenant_billing')
        .select('*')
        .eq('tenant_id', tenant.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setBilling(data);
    } catch (error) {
      console.error('Error fetching billing:', error);
    }
  };

  const fetchActiveUsers = async () => {
    if (!tenant) return;
    
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenant.id);

      if (error) throw error;
      setActiveUsers(count || 0);
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  const updateTenant = async () => {
    if (!editedTenant) return;

    try {
      setLoading(true);
      
      const { error: tenantError } = await supabase
        .from('tenants')
        .update({
          name: editedTenant.name,
          domain: editedTenant.domain,
          subscription_plan: editedTenant.subscription_plan,
          subscription_status: editedTenant.subscription_status,
          max_users: editedTenant.max_users,
          contract_start_date: editedTenant.contract_start_date,
          contract_end_date: editedTenant.contract_end_date,
          mrr: editedTenant.mrr,
          arr: editedTenant.arr,
        })
        .eq('id', editedTenant.id);

      if (tenantError) throw tenantError;

      if (billing) {
        const { error: billingError } = await supabase
          .from('tenant_billing')
          .upsert({
            ...billing,
            tenant_id: editedTenant.id,
          });

        if (billingError) throw billingError;
      }

      toast({
        title: "Éxito",
        description: "Empresa actualizada correctamente.",
      });

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating tenant:', error);
      toast({
        title: "Error",
        description: "Error al actualizar la empresa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!editedTenant) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Gestionar Empresa: {editedTenant.name}
          </DialogTitle>
          <DialogDescription>
            Edita la configuración, facturación y usuarios de la empresa
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="billing">Facturación</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre de la Empresa</Label>
                    <Input
                      id="name"
                      value={editedTenant.name}
                      onChange={(e) => setEditedTenant(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="domain">Dominio</Label>
                    <Input
                      id="domain"
                      value={editedTenant.domain || ''}
                      onChange={(e) => setEditedTenant(prev => prev ? { ...prev, domain: e.target.value } : null)}
                      placeholder="empresa.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plan">Plan de Suscripción</Label>
                    <Select 
                      value={editedTenant.subscription_plan} 
                      onValueChange={(value) => setEditedTenant(prev => prev ? { ...prev, subscription_plan: value as any } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lite">Lite - €1,90/empleado/mes</SelectItem>
                        <SelectItem value="esencial">Esencial - €3,90/empleado/mes</SelectItem>
                        <SelectItem value="profesional">Profesional - €7,90/empleado/mes</SelectItem>
                        <SelectItem value="enterprise">Enterprise - Precio personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Estado de Suscripción</Label>
                    <Select 
                      value={editedTenant.subscription_status} 
                      onValueChange={(value) => setEditedTenant(prev => prev ? { ...prev, subscription_status: value as any } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activa</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                        <SelectItem value="expired">Expirada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="maxUsers">Máximo de Usuarios</Label>
                    <Input
                      id="maxUsers"
                      type="number"
                      value={editedTenant.max_users}
                      onChange={(e) => setEditedTenant(prev => prev ? { ...prev, max_users: parseInt(e.target.value) || 0 } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mrr">MRR (€)</Label>
                    <Input
                      id="mrr"
                      type="number"
                      step="0.01"
                      value={editedTenant.mrr || ''}
                      onChange={(e) => setEditedTenant(prev => prev ? { ...prev, mrr: parseFloat(e.target.value) || 0 } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="arr">ARR (€)</Label>
                    <Input
                      id="arr"
                      type="number"
                      step="0.01"
                      value={editedTenant.arr || ''}
                      onChange={(e) => setEditedTenant(prev => prev ? { ...prev, arr: parseFloat(e.target.value) || 0 } : null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contractStart">Inicio de Contrato</Label>
                    <Input
                      id="contractStart"
                      type="date"
                      value={editedTenant.contract_start_date || ''}
                      onChange={(e) => setEditedTenant(prev => prev ? { ...prev, contract_start_date: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contractEnd">Fin de Contrato</Label>
                    <Input
                      id="contractEnd"
                      type="date"
                      value={editedTenant.contract_end_date || ''}
                      onChange={(e) => setEditedTenant(prev => prev ? { ...prev, contract_end_date: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge className={getStatusColor(editedTenant.status)}>
                    {editedTenant.status === 'active' ? 'Activa' : 'Suspendida'}
                  </Badge>
                  <Badge className={getStatusColor(editedTenant.subscription_status)}>
                    {editedTenant.subscription_status === 'active' ? 'Suscripción Activa' : 
                     editedTenant.subscription_status === 'cancelled' ? 'Cancelada' : 'Expirada'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Configuración de Facturación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {billing && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingEmail">Email de Facturación</Label>
                        <Input
                          id="billingEmail"
                          value={billing.billing_email}
                          onChange={(e) => setBilling(prev => prev ? { ...prev, billing_email: e.target.value } : null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentMethod">Método de Pago</Label>
                        <Select 
                          value={billing.payment_method} 
                          onValueChange={(value) => setBilling(prev => prev ? { ...prev, payment_method: value } : null)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly_invoice">Factura Mensual</SelectItem>
                            <SelectItem value="annual_invoice">Factura Anual</SelectItem>
                            <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                            <SelectItem value="bank_transfer">Transferencia Bancaria</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="monthlyPrice">Precio Mensual (€)</Label>
                        <Input
                          id="monthlyPrice"
                          type="number"
                          step="0.01"
                          value={billing.monthly_price}
                          onChange={(e) => setBilling(prev => prev ? { ...prev, monthly_price: parseFloat(e.target.value) || 0 } : null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="annualPrice">Precio Anual (€)</Label>
                        <Input
                          id="annualPrice"
                          type="number"
                          step="0.01"
                          value={billing.annual_price || ''}
                          onChange={(e) => setBilling(prev => prev ? { ...prev, annual_price: parseFloat(e.target.value) || undefined } : null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="taxRate">Tasa de IVA (%)</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          step="0.01"
                          value={billing.tax_rate}
                          onChange={(e) => setBilling(prev => prev ? { ...prev, tax_rate: parseFloat(e.target.value) || 0 } : null)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paymentDay">Día de Facturación</Label>
                        <Input
                          id="paymentDay"
                          type="number"
                          min="1"
                          max="31"
                          value={billing.payment_day}
                          onChange={(e) => setBilling(prev => prev ? { ...prev, payment_day: parseInt(e.target.value) || 1 } : null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentStatus">Estado de Pago</Label>
                        <Select 
                          value={billing.payment_status} 
                          onValueChange={(value) => setBilling(prev => prev ? { ...prev, payment_status: value } : null)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current">Al día</SelectItem>
                            <SelectItem value="overdue">Atrasado</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nextBilling">Próxima Facturación</Label>
                        <Input
                          id="nextBilling"
                          type="date"
                          value={billing.next_billing_date || ''}
                          onChange={(e) => setBilling(prev => prev ? { ...prev, next_billing_date: e.target.value } : null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastPayment">Último Pago</Label>
                        <Input
                          id="lastPayment"
                          type="date"
                          value={billing.last_payment_date || ''}
                          onChange={(e) => setBilling(prev => prev ? { ...prev, last_payment_date: e.target.value } : null)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notas</Label>
                      <Textarea
                        id="notes"
                        value={billing.notes || ''}
                        onChange={(e) => setBilling(prev => prev ? { ...prev, notes: e.target.value } : null)}
                        placeholder="Notas adicionales sobre la facturación..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <Badge className={getPaymentStatusColor(billing.payment_status)}>
                        {billing.payment_status === 'current' ? 'Al día' : 
                         billing.payment_status === 'overdue' ? 'Atrasado' : 'Cancelado'}
                      </Badge>
                      <Badge variant="outline">
                        {billing.currency} {billing.monthly_price}/mes
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gestión de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Usuarios Activos</h4>
                    <div className="text-3xl font-bold text-primary">{activeUsers}</div>
                    <p className="text-sm text-muted-foreground">de {editedTenant.max_users} máximo</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Utilización</h4>
                    <div className="text-3xl font-bold text-orange-600">
                      {Math.round((activeUsers / editedTenant.max_users) * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground">capacidad utilizada</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usuarios disponibles:</span>
                    <span className="font-medium">{editedTenant.max_users - activeUsers}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((activeUsers / editedTenant.max_users) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Métricas Financieras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">MRR Actual</h4>
                    <div className="text-2xl font-bold text-green-600">
                      €{editedTenant.mrr?.toFixed(2) || '0.00'}
                    </div>
                    <p className="text-sm text-muted-foreground">Revenue mensual recurrente</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">ARR Proyectado</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      €{editedTenant.arr?.toFixed(2) || '0.00'}
                    </div>
                    <p className="text-sm text-muted-foreground">Revenue anual recurrente</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cliente desde:</span>
                    <span className="font-medium">
                      {editedTenant.created_at ? new Date(editedTenant.created_at).toLocaleDateString('es-ES') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Contrato hasta:</span>
                    <span className="font-medium">
                      {editedTenant.contract_end_date ? new Date(editedTenant.contract_end_date).toLocaleDateString('es-ES') : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={updateTenant} disabled={loading}>
            {loading ? 'Actualizando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}