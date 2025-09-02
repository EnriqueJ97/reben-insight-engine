import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  Wallet, 
  TrendingUp, 
  PieChart, 
  Lightbulb,
  Star,
  Euro,
  Calculator,
  Utensils,
  Car,
  Heart,
  Baby,
  GraduationCap,
  Laptop,
  Activity,
  CheckCircle
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const EmployeeFlexPlan = () => {
  const [selectedBenefits, setSelectedBenefits] = useState<Record<string, { selected: boolean; amount: number }>>({});

  // Mock employee data
  const employeeData = {
    grossSalary: 3500,
    currentNetSalary: 2380,
    flexibleLimit: 1050, // 30% of gross
    currentFlexibleUsed: 0,
  };

  const availableBenefits = [
    { id: '1', name: 'Tickets Comida', category: 'comida', icon: Utensils, monthlyPrice: 100, taxSaving: 30, maxAmount: 110, color: '#10B981' },
    { id: '2', name: 'Transporte Público', category: 'transporte', icon: Car, monthlyPrice: 80, taxSaving: 25, maxAmount: 136.36, color: '#3B82F6' },
    { id: '3', name: 'Seguro Médico Premium', category: 'salud', icon: Heart, monthlyPrice: 120, taxSaving: 35, maxAmount: 60, color: '#EF4444' },
    { id: '4', name: 'Cursos Online', category: 'formacion', icon: GraduationCap, monthlyPrice: 50, taxSaving: 100, maxAmount: 200, color: '#8B5CF6' },
    { id: '5', name: 'Laptop Personal', category: 'tech', icon: Laptop, monthlyPrice: 150, taxSaving: 100, maxAmount: 300, color: '#06B6D4' },
    { id: '6', name: 'Wellness Gimnasio', category: 'wellness', icon: Activity, monthlyPrice: 60, taxSaving: 100, maxAmount: 100, color: '#84CC16' },
  ];

  const totalSelected = Object.values(selectedBenefits).reduce((sum, benefit) => 
    benefit.selected ? sum + benefit.amount : sum, 0
  );

  const totalTaxSaving = Object.entries(selectedBenefits).reduce((sum, [id, selection]) => {
    if (!selection.selected) return sum;
    const benefit = availableBenefits.find(b => b.id === id);
    return sum + (selection.amount * (benefit?.taxSaving || 0) / 100);
  }, 0);

  const newNetSalary = employeeData.currentNetSalary + totalTaxSaving;
  const savingPercentage = ((totalTaxSaving / employeeData.currentNetSalary) * 100);

  const handleBenefitToggle = (benefitId: string) => {
    setSelectedBenefits(prev => {
      const benefit = availableBenefits.find(b => b.id === benefitId);
      if (!benefit) return prev;

      return {
        ...prev,
        [benefitId]: {
          selected: !prev[benefitId]?.selected,
          amount: prev[benefitId]?.amount || benefit.monthlyPrice
        }
      };
    });
  };

  const handleAmountChange = (benefitId: string, amount: number) => {
    setSelectedBenefits(prev => ({
      ...prev,
      [benefitId]: {
        ...prev[benefitId],
        amount: amount
      }
    }));
  };

  const pieData = Object.entries(selectedBenefits)
    .filter(([_, selection]) => selection.selected)
    .map(([id, selection]) => {
      const benefit = availableBenefits.find(b => b.id === id);
      return {
        name: benefit?.name || '',
        value: selection.amount,
        color: benefit?.color || '#gray'
      };
    });

  const comparisonData = [
    { name: 'Salario Actual', value: employeeData.currentNetSalary },
    { name: 'Con Plan Flexible', value: newNetSalary }
  ];

  const recommendations = [
    {
      icon: TrendingUp,
      title: "Optimización fiscal",
      message: `Destinando ${totalSelected}€ a beneficios, ahorras ${totalTaxSaving.toFixed(0)}€ en IRPF mensualmente.`
    },
    {
      icon: Activity,
      title: "Bienestar mejorado",
      message: "Tu plan flexible mejora tu conciliación +15% y reduce tu riesgo de burnout."
    },
    {
      icon: Star,
      title: "Rendimiento optimizado",
      message: `Estás ahorrando +${savingPercentage.toFixed(1)}% de tu salario neto anual.`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mi Plan Flexible</h1>
          <p className="text-muted-foreground">Personaliza tu retribución y maximiza tu ahorro fiscal</p>
        </div>
        {totalSelected > 0 && (
          <Button size="lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            Confirmar Mi Plan
          </Button>
        )}
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Salario Bruto</p>
                <p className="text-2xl font-bold">{employeeData.grossSalary}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Límite Flexible</p>
                <p className="text-2xl font-bold">{employeeData.flexibleLimit}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Disponible</p>
                <p className="text-2xl font-bold">{(employeeData.flexibleLimit - totalSelected).toFixed(0)}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Ahorro Mensual</p>
                <p className="text-2xl font-bold text-green-600">+{totalTaxSaving.toFixed(0)}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Benefits Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                Catálogo de Beneficios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableBenefits.map((benefit) => {
                  const IconComponent = benefit.icon;
                  const isSelected = selectedBenefits[benefit.id]?.selected || false;
                  const selectedAmount = selectedBenefits[benefit.id]?.amount || benefit.monthlyPrice;
                  
                  return (
                    <Card key={benefit.id} className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleBenefitToggle(benefit.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <IconComponent className="w-5 h-5" style={{ color: benefit.color }} />
                                <h3 className="font-medium">{benefit.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {benefit.taxSaving}% ahorro
                                </Badge>
                              </div>
                              
                              {isSelected && (
                                <div className="mt-3 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Cantidad mensual:</span>
                                    <Input
                                      type="number"
                                      value={selectedAmount}
                                      onChange={(e) => handleAmountChange(benefit.id, parseInt(e.target.value) || 0)}
                                      max={Math.min(benefit.maxAmount, employeeData.flexibleLimit)}
                                      className="w-20"
                                    />
                                    <span className="text-sm">€</span>
                                  </div>
                                  <p className="text-sm text-green-600">
                                    Ahorro fiscal: +{(selectedAmount * benefit.taxSaving / 100).toFixed(0)}€/mes
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-medium">{benefit.monthlyPrice}€</p>
                            <p className="text-sm text-muted-foreground">sugerido</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization & Insights */}
        <div className="space-y-4">
          {/* Current Plan Visualization */}
          {pieData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Mi Distribución
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}€`, '']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-1">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}€</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Salary Comparison */}
          {totalSelected > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Comparativa Salarial</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={comparisonData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip formatter={(value) => [`${value}€`, 'Salario Neto']} />
                    <Bar dataKey="value" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-green-600">
                    Incremento neto: +{(newNetSalary - employeeData.currentNetSalary).toFixed(0)}€/mes
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +{((newNetSalary - employeeData.currentNetSalary) * 12).toFixed(0)}€ anuales
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Smart Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Recomendaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-muted rounded-lg">
                    <rec.icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">{rec.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievement Badge */}
          {savingPercentage > 10 && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="font-bold text-green-700">¡Excelente Optimización!</p>
                <p className="text-sm text-green-600">
                  Estás ahorrando +{savingPercentage.toFixed(1)}% de tu salario
                </p>
                <Badge className="mt-2 bg-green-100 text-green-700">
                  Ahorrador Inteligente
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeFlexPlan;