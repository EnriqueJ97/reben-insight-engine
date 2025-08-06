import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calculator } from 'lucide-react';

interface InteractiveROIProps {
  reportData: any;
}

export const InteractiveROI = ({ reportData }: InteractiveROIProps) => {
  const [avgSalary, setAvgSalary] = useState([45000]); // Default average salary
  const [programInvestment, setProgramInvestment] = useState([12000]); // Default program investment
  
  // Calculate metrics based on slider values
  const calculateROI = () => {
    const salary = avgSalary[0];
    const investment = programInvestment[0];
    
    // ROI calculation based on wellness impact
    const wellnessImprovement = Math.max(0, (reportData?.wellness_score || 70) - 50) / 100; // Normalized improvement
    const productivityGain = wellnessImprovement * 0.2; // 20% max productivity gain
    const retentionSaving = wellnessImprovement * 0.15; // 15% max retention saving
    const absenteeismReduction = wellnessImprovement * 0.12; // 12% max absenteeism reduction
    
    const annualProductivitySaving = salary * productivityGain * (reportData?.team_breakdown?.reduce((sum: number, team: any) => sum + team.unique_employees, 0) || 50);
    const annualRetentionSaving = salary * 0.75 * retentionSaving * ((reportData?.team_breakdown?.reduce((sum: number, team: any) => sum + team.unique_employees, 0) || 50) * 0.1); // Assume 10% turnover rate
    const annualAbsenteeismSaving = salary * 0.05 * absenteeismReduction * (reportData?.team_breakdown?.reduce((sum: number, team: any) => sum + team.unique_employees, 0) || 50); // 5% of salary for absenteeism costs
    
    const totalSavings = annualProductivitySaving + annualRetentionSaving + annualAbsenteeismSaving;
    const roi = ((totalSavings - investment) / investment) * 100;
    const paybackMonths = (investment / (totalSavings / 12));
    
    return {
      totalSavings: Math.round(totalSavings),
      roi: Math.round(roi),
      paybackMonths: Math.round(paybackMonths * 10) / 10,
      productivity: Math.round(annualProductivitySaving),
      retention: Math.round(annualRetentionSaving),
      absenteeism: Math.round(annualAbsenteeismSaving)
    };
  };

  const metrics = calculateROI();

  const getROIColor = (roi: number) => {
    if (roi >= 200) return 'text-success';
    if (roi >= 100) return 'text-primary';
    if (roi >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getROIStatus = (roi: number) => {
    if (roi >= 200) return 'Excelente';
    if (roi >= 100) return 'Muy bueno';
    if (roi >= 50) return 'Positivo';
    return 'Requiere optimización';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Calculadora ROI Interactiva</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Salario Promedio</label>
              <Badge variant="outline">€{avgSalary[0].toLocaleString()}</Badge>
            </div>
            <Slider
              value={avgSalary}
              onValueChange={setAvgSalary}
              min={25000}
              max={80000}
              step={1000}
              className="w-full"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Inversión en Programa</label>
              <Badge variant="outline">€{programInvestment[0].toLocaleString()}</Badge>
            </div>
            <Slider
              value={programInvestment}
              onValueChange={setProgramInvestment}
              min={5000}
              max={50000}
              step={500}
              className="w-full"
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className={`text-xl font-bold ${getROIColor(metrics.roi)}`}>
                  {metrics.roi > 0 ? '+' : ''}{metrics.roi}%
                </div>
                <p className="text-xs text-muted-foreground">ROI Anual</p>
                <Badge variant="outline" className="text-[10px] mt-1">
                  {getROIStatus(metrics.roi)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-xl font-bold text-success">
                  €{metrics.totalSavings.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Ahorro Total</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-xl font-bold text-primary">
                  {metrics.paybackMonths}
                </div>
                <p className="text-xs text-muted-foreground">Meses Payback</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-xl font-bold text-accent">
                  {Math.round((metrics.totalSavings / programInvestment[0]) * 10) / 10}x
                </div>
                <p className="text-xs text-muted-foreground">Múltiplo</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Desglose de Ahorros</span>
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-success/5 rounded-lg">
              <div>
                <span className="font-medium">Ganancia en Productividad</span>
                <p className="text-xs text-muted-foreground">Reducción de distracciones y mejor enfoque</p>
              </div>
              <Badge className="bg-success text-success-foreground">
                €{metrics.productivity.toLocaleString()}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
              <div>
                <span className="font-medium">Ahorro en Retención</span>
                <p className="text-xs text-muted-foreground">Reducción de costes de rotación</p>
              </div>
              <Badge className="bg-primary text-primary-foreground">
                €{metrics.retention.toLocaleString()}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-accent/5 rounded-lg">
              <div>
                <span className="font-medium">Reducción Absentismo</span>
                <p className="text-xs text-muted-foreground">Menos días de baja por estrés</p>
              </div>
              <Badge className="bg-accent text-accent-foreground">
                €{metrics.absenteeism.toLocaleString()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Business Case */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <h5 className="font-medium mb-2 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Business Case</span>
          </h5>
          <p className="text-sm text-muted-foreground">
            Con una inversión de €{programInvestment[0].toLocaleString()} en bienestar, 
            generas un retorno de €{metrics.totalSavings.toLocaleString()} anuales 
            ({metrics.roi > 0 ? '+' : ''}{metrics.roi}% ROI). 
            El programa se paga solo en {metrics.paybackMonths} meses 
            y produce {Math.round((metrics.totalSavings / programInvestment[0]) * 10) / 10}€ 
            por cada euro invertido.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};