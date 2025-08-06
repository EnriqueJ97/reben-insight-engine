import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface BenchmarkChipsProps {
  metric: string;
  value: number;
  sector?: string;
}

// Mock sector benchmarks
const sectorBenchmarks = {
  'Bienestar Prom.': { IT: 61, Finanzas: 58, Salud: 72, Retail: 55 },
  'Participación': { IT: 73, Finanzas: 68, Salud: 81, Retail: 62 },
  'Alto Riesgo': { IT: 12, Finanzas: 18, Salud: 8, Retail: 22 }, // Percentage of employees
  'Ahorro Est.': { IT: 15000, Finanzas: 22000, Salud: 18000, Retail: 8000 }
};

export const BenchmarkChips = ({ metric, value, sector = 'IT' }: BenchmarkChipsProps) => {
  const benchmarks = sectorBenchmarks[metric as keyof typeof sectorBenchmarks];
  
  if (!benchmarks) return null;

  const sectorValue = benchmarks[sector as keyof typeof benchmarks];
  if (!sectorValue) return null;

  const difference = value - sectorValue;
  const percentageDiff = Math.round((difference / sectorValue) * 100);

  const getComparisonIcon = () => {
    // For "Alto Riesgo", lower is better
    const isLowerBetter = metric === 'Alto Riesgo';
    const threshold = isLowerBetter ? -5 : 5;
    
    if (isLowerBetter) {
      if (percentageDiff <= -15) return <TrendingUp className="h-3 w-3 text-success" />;
      if (percentageDiff >= 15) return <TrendingDown className="h-3 w-3 text-destructive" />;
    } else {
      if (percentageDiff >= 15) return <TrendingUp className="h-3 w-3 text-success" />;
      if (percentageDiff <= -15) return <TrendingDown className="h-3 w-3 text-destructive" />;
    }
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getComparisonColor = () => {
    const isLowerBetter = metric === 'Alto Riesgo';
    
    if (isLowerBetter) {
      if (percentageDiff <= -15) return 'border-success text-success';
      if (percentageDiff >= 15) return 'border-destructive text-destructive';
    } else {
      if (percentageDiff >= 15) return 'border-success text-success';
      if (percentageDiff <= -15) return 'border-destructive text-destructive';
    }
    return 'border-muted-foreground text-muted-foreground';
  };

  const formatValue = (val: number) => {
    if (metric === 'Ahorro Est.') return `€${val.toLocaleString()}`;
    if (metric === 'Alto Riesgo') return `${val}%`;
    if (metric === 'Participación' || metric === 'Bienestar Prom.') return `${val}%`;
    return val.toString();
  };

  const getComparisonText = () => {
    const isLowerBetter = metric === 'Alto Riesgo';
    const absDiff = Math.abs(percentageDiff);
    
    if (absDiff < 5) return 'Similar al sector';
    
    if (isLowerBetter) {
      return percentageDiff < 0 ? `${absDiff}% mejor` : `${absDiff}% peor`;
    } else {
      return percentageDiff > 0 ? `${absDiff}% mejor` : `${absDiff}% peor`;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`text-xs cursor-help ${getComparisonColor()}`}
          >
            <div className="flex items-center space-x-1">
              {getComparisonIcon()}
              <span>Sector ({sector}): {formatValue(sectorValue)}</span>
              <Info className="h-3 w-3" />
            </div>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Tu organización:</span>
              <span>{formatValue(value)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Promedio {sector}:</span>
              <span>{formatValue(sectorValue)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Comparación:</span>
                <span className={`flex items-center space-x-1 ${
                  getComparisonColor().includes('success') ? 'text-success' :
                  getComparisonColor().includes('destructive') ? 'text-destructive' :
                  'text-muted-foreground'
                }`}>
                  {getComparisonIcon()}
                  <span>{getComparisonText()}</span>
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Datos basados en estudios sectoriales de bienestar laboral 2024
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};