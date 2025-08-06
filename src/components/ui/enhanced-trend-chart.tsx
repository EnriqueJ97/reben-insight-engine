import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';

interface TrendData {
  date: string;
  wellness: number;
  participation: number;
  alerts: number;
}

interface EnhancedTrendChartProps {
  data: TrendData[];
  height?: number;
}

export const EnhancedTrendChart = ({ data, height = 300 }: EnhancedTrendChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'wellness' && `Bienestar: ${entry.value}%`}
              {entry.dataKey === 'participation' && `Participación: ${entry.value}%`}
              {entry.dataKey === 'alerts' && `Alertas: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Gráfico combinado: Línea para bienestar, barras para participación */}
      <div>
        <h4 className="text-sm font-medium mb-3">Bienestar y Participación Semanal</h4>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Barras para participación */}
            <Bar 
              dataKey="participation" 
              fill="hsl(var(--primary))" 
              opacity={0.6}
              radius={[2, 2, 0, 0]}
            />
            
            {/* Línea para bienestar */}
            <Line 
              type="monotone" 
              dataKey="wellness" 
              stroke="hsl(var(--accent))" 
              strokeWidth={3}
              dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "hsl(var(--accent))", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-primary/60 rounded"></div>
            <span>Participación (%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-2 bg-accent rounded"></div>
            <span>Bienestar (%)</span>
          </div>
        </div>
      </div>

      {/* Gráfico de alertas */}
      <div>
        <h4 className="text-sm font-medium mb-3">Alertas Generadas</h4>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="alerts" 
              fill="hsl(var(--destructive))" 
              opacity={0.7}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};