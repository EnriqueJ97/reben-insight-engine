import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Euro, 
  PieChart,
  Calendar,
  Shield,
  Utensils,
  Car,
  Heart,
  Baby,
  GraduationCap,
  Laptop,
  Activity
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const HRCompensationPanel = () => {
  const [maxFlexPercentage, setMaxFlexPercentage] = useState([30]);
  const [selectionWindow, setSelectionWindow] = useState({ start: 1, end: 10 });

  const benefitCategories = [
    { id: 'comida', name: 'Comida', icon: Utensils, color: '#10B981', maxLimit: 11 },
    { id: 'transporte', name: 'Transporte', icon: Car, color: '#3B82F6', maxLimit: 136.36 },
    { id: 'salud', name: 'Salud', icon: Heart, color: '#EF4444', maxLimit: 60 },
    { id: 'guarderia', name: 'Guardería', icon: Baby, color: '#F59E0B', maxLimit: 0 },
    { id: 'formacion', name: 'Formación', icon: GraduationCap, color: '#8B5CF6', maxLimit: 0 },
    { id: 'tech', name: 'Tecnología', icon: Laptop, color: '#06B6D4', maxLimit: 0 },
    { id: 'wellness', name: 'Wellness', icon: Activity, color: '#84CC16', maxLimit: 0 },
  ];

  const benefits = [
    { id: '1', name: 'Tickets Comida', category: 'comida', monthlyPrice: 100, taxSaving: 30, requiresApproval: false, isActive: true },
    { id: '2', name: 'Transporte Público', category: 'transporte', monthlyPrice: 80, taxSaving: 25, requiresApproval: false, isActive: true },
    { id: '3', name: 'Seguro Médico Premium', category: 'salud', monthlyPrice: 120, taxSaving: 35, requiresApproval: true, isActive: true },
    { id: '4', name: 'Cheques Guardería', category: 'guarderia', monthlyPrice: 200, taxSaving: 100, requiresApproval: true, isActive: false },
    { id: '5', name: 'Cursos Online', category: 'formacion', monthlyPrice: 50, taxSaving: 100, requiresApproval: false, isActive: true },
    { id: '6', name: 'Laptop Personal', category: 'tech', monthlyPrice: 150, taxSaving: 100, requiresApproval: true, isActive: true },
    { id: '7', name: 'Gimnasio', category: 'wellness', monthlyPrice: 60, taxSaving: 100, requiresApproval: false, isActive: true },
  ];

  // Mock analytics data
  const adoptionData = [
    { name: 'Tickets Comida', adoption: 85, cost: 12500 },
    { name: 'Transporte', adoption: 65, cost: 8600 },
    { name: 'Seguro Médico', adoption: 45, cost: 15400 },
    { name: 'Formación', adoption: 35, cost: 4200 },
    { name: 'Tecnología', adoption: 25, cost: 7800 },
    { name: 'Wellness', adoption: 40, cost: 5100 },
  ];

  const impactData = [
    { metric: 'Motivación', current: 72, withFlex: 85 },
    { metric: 'Retención', current: 78, withFlex: 89 },
    { metric: 'Burnout', current: 35, withFlex: 22 },
  ];

  const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4'];

  const getCategoryIcon = (categoryId: string) => {
    const category = benefitCategories.find(c => c.id === categoryId);
    return category ? category.icon : Utensils;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compensación y Beneficios</h1>
          <p className="text-muted-foreground">Configura y analiza el plan de retribución flexible</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Simular en ROI
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Guardar Configuración
          </Button>
        </div>
      </div>

      <Tabs defaultValue="configuration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configuration">
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analítica
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          {/* General Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Límite máximo de retribución flexible</Label>
                  <div className="px-4">
                    <Slider
                      value={maxFlexPercentage}
                      onValueChange={setMaxFlexPercentage}
                      max={50}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>10%</span>
                      <span className="font-medium">{maxFlexPercentage[0]}% del salario bruto</span>
                      <span>50%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Ventana de selección mensual</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="start-day" className="text-sm">Del día</Label>
                      <Input
                        id="start-day"
                        type="number"
                        min="1"
                        max="31"
                        value={selectionWindow.start}
                        onChange={(e) => setSelectionWindow(prev => ({ ...prev, start: parseInt(e.target.value) }))}
                        className="w-16"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="end-day" className="text-sm">al día</Label>
                      <Input
                        id="end-day"
                        type="number"
                        min="1"
                        max="31"
                        value={selectionWindow.end}
                        onChange={(e) => setSelectionWindow(prev => ({ ...prev, end: parseInt(e.target.value) }))}
                        className="w-16"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Catalog */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Catálogo de Beneficios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefits.map((benefit) => {
                  const IconComponent = getCategoryIcon(benefit.category);
                  return (
                    <Card key={benefit.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-5 h-5 text-primary" />
                            <h3 className="font-medium">{benefit.name}</h3>
                          </div>
                          <Switch checked={benefit.isActive} />
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Precio/mes:</span>
                            <span className="font-medium">{benefit.monthlyPrice}€</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ahorro fiscal:</span>
                            <span className="font-medium text-green-600">{benefit.taxSaving}%</span>
                          </div>
                          {benefit.requiresApproval && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Requiere aprobación
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Adopción Total</p>
                    <p className="text-2xl font-bold">68%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Coste Total/Mes</p>
                    <p className="text-2xl font-bold">53.6K€</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ahorro Medio</p>
                    <p className="text-2xl font-bold">187€</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Impacto Bienestar</p>
                    <p className="text-2xl font-bold">+24%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Adoption Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Adopción por Beneficio</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={adoptionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="adoption" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Costes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={adoptionData}
                      dataKey="cost"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {adoptionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}€`, 'Coste']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Impact Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Impacto en Bienestar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={impactData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#94A3B8" name="Actual" />
                  <Bar dataKey="withFlex" fill="#10B981" name="Con Retribución Flexible" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRCompensationPanel;