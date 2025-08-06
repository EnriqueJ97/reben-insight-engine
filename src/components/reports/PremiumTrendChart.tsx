import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Users, Calendar } from 'lucide-react';

interface TrendData {
  date: string;
  wellness: number;
  participation: number;
  alerts: number;
  burnout_risk: number;
  satisfaction: number;
  productivity: number;
}

interface PremiumTrendChartProps {
  data: TrendData[];
  height?: number;
  onDataPointClick?: (data: any) => void;
}

export const PremiumTrendChart = ({ data, height = 400, onDataPointClick }: PremiumTrendChartProps) => {
  const [activeView, setActiveView] = useState<'combined' | 'wellness' | 'alerts' | 'detailed'>('combined');
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  // Calculate trend indicators
  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2];
  
  const trends = {
    wellness: latestData && previousData ? latestData.wellness - previousData.wellness : 0,
    participation: latestData && previousData ? latestData.participation - previousData.participation : 0,
    alerts: latestData && previousData ? latestData.alerts - previousData.alerts : 0,
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border shadow-lg bg-background/95 backdrop-blur">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{label}</p>
            </div>
            <div className="space-y-1">
              {payload.map((entry: any, index: number) => (
                <div key={index} className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {entry.dataKey === 'wellness' && 'Bienestar'}
                      {entry.dataKey === 'participation' && 'Participación'}
                      {entry.dataKey === 'alerts' && 'Alertas'}
                      {entry.dataKey === 'burnout_risk' && 'Riesgo Burnout'}
                      {entry.dataKey === 'satisfaction' && 'Satisfacción'}
                      {entry.dataKey === 'productivity' && 'Productividad'}
                    </span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: entry.color }}>
                    {entry.dataKey === 'alerts' ? entry.value : `${entry.value}%`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  const TrendIndicator = ({ value, label }: { value: number; label: string }) => (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
      {value > 0 ? (
        <TrendingUp className="h-4 w-4 text-emerald-500" />
      ) : value < 0 ? (
        <TrendingDown className="h-4 w-4 text-red-500" />
      ) : (
        <Activity className="h-4 w-4 text-muted-foreground" />
      )}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">
          {value > 0 ? '+' : ''}{value.toFixed(1)}
          {label !== 'Alertas' ? '%' : ''}
        </p>
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Análisis de Tendencias
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Evolución de métricas clave en tiempo real
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeView === 'combined' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('combined')}
            >
              General
            </Button>
            <Button
              variant={activeView === 'wellness' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('wellness')}
            >
              Bienestar
            </Button>
            <Button
              variant={activeView === 'alerts' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('alerts')}
            >
              Alertas
            </Button>
          </div>
        </div>
        
        {/* Trend indicators */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <TrendIndicator value={trends.wellness} label="Bienestar" />
          <TrendIndicator value={trends.participation} label="Participación" />
          <TrendIndicator value={trends.alerts} label="Alertas" />
        </div>
      </CardHeader>

      <CardContent>
        {activeView === 'combined' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Métricas Principales</h4>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-primary rounded"></div>
                    <span>Bienestar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                    <span>Participación</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={height}>
                <ComposedChart 
                  data={data} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  onMouseMove={(e) => setHoveredPoint(e)}
                >
                  <defs>
                    <linearGradient id="wellnessGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  <Area
                    type="monotone"
                    dataKey="wellness"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#wellnessGradient)"
                  />
                  
                  <Line 
                    type="monotone" 
                    dataKey="participation" 
                    stroke="hsl(var(--emerald-500))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--emerald-500))", strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: "hsl(var(--emerald-500))", strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeView === 'wellness' && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Análisis Detallado de Bienestar
            </h4>
            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                
                <Line 
                  type="monotone" 
                  dataKey="wellness" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="satisfaction" 
                  stroke="hsl(var(--emerald-500))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "hsl(var(--emerald-500))", strokeWidth: 2, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="burnout_risk" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 bg-primary rounded"></div>
                <span>Bienestar General</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 bg-emerald-500 rounded border-dashed border"></div>
                <span>Satisfacción</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 bg-destructive rounded"></div>
                <span>Riesgo Burnout</span>
              </div>
            </div>
          </div>
        )}

        {activeView === 'alerts' && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Evolución de Alertas
            </h4>
            <ResponsiveContainer width="100%" height={height}>
              <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="alerts"
                  stroke="hsl(var(--destructive))"
                  fillOpacity={1}
                  fill="url(#alertGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Data insights */}
        {hoveredPoint && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 En esta fecha se registró un {hoveredPoint.activePayload?.[0]?.value > 75 ? 'alto' : 'bajo'} nivel de bienestar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};