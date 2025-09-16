import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SCIENTIFIC_INSTRUMENTS } from '@/data/scientific-instruments';

export const InstrumentDebugPanel = () => {
  const climateInstruments = SCIENTIFIC_INSTRUMENTS.filter(i => i.category === 'climate');
  
  return (
    <Card className="mb-4 bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-sm">🔍 Debug: Instrumentos de Clima</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-xs">
          <p><strong>Total instrumentos:</strong> {SCIENTIFIC_INSTRUMENTS.length}</p>
          <p><strong>Instrumentos de clima:</strong> {climateInstruments.length}</p>
          <div className="space-y-1">
            {climateInstruments.map(instrument => (
              <div key={instrument.id} className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs ${instrument.category === 'climate' ? 'bg-yellow-100' : ''}`}>
                  {instrument.abbreviation}
                </Badge>
                <span>{instrument.name}</span>
                <span className="text-muted-foreground">({instrument.authors})</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};