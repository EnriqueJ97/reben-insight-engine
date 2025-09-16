import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SCIENTIFIC_INSTRUMENTS, getInstrumentsByCategory } from '@/data/scientific-instruments';
import { ScientificInstrument, InstrumentDimension } from '@/types/evaluations';
import { 
  Search, 
  Plus, 
  BookOpen, 
  Award, 
  Clock, 
  Users,
  Target,
  CheckCircle2,
  Filter,
  Star
} from 'lucide-react';

const CATEGORY_CONFIG = {
  'burnout': { label: 'Instrumentos de Burnout', icon: '🔥', color: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-800' },
  'engagement': { label: 'Engagement & Motivación', icon: '⚡', color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-800' },
  'satisfaction': { label: 'Satisfacción Laboral', icon: '😊', color: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-800' },
  'climate': { label: 'Clima & Cultura Organizacional', icon: '🌤️', color: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-800' },
  'leadership': { label: 'Liderazgo', icon: '👑', color: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-800' },
  'wellbeing': { label: 'Bienestar Psicológico', icon: '🧘', color: 'bg-teal-50 border-teal-200', badge: 'bg-teal-100 text-teal-800' },
  'inclusion': { label: 'Diversidad e Inclusión', icon: '🤝', color: 'bg-pink-50 border-pink-200', badge: 'bg-pink-100 text-pink-800' },
  'flexibility': { label: 'Flexibilidad y Conciliación', icon: '⚖️', color: 'bg-indigo-50 border-indigo-200', badge: 'bg-indigo-100 text-indigo-800' },
  'commitment': { label: 'Compromiso Organizacional', icon: '💪', color: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-800' }
};

interface ProfessionalInstrumentSelectorProps {
  onInstrumentSelect: (instrument: ScientificInstrument, type: 'full' | 'dimension', dimensionId?: string) => void;
  selectedInstruments: string[];
}

export const ProfessionalInstrumentSelector: React.FC<ProfessionalInstrumentSelectorProps> = ({
  onInstrumentSelect,
  selectedInstruments
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyValidated, setShowOnlyValidated] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<ScientificInstrument | null>(null);
  const { toast } = useToast();

  const filteredInstruments = SCIENTIFIC_INSTRUMENTS.filter(instrument => {
    const matchesSearch = instrument.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instrument.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instrument.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instrument.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || instrument.category === selectedCategory;
    const matchesValidation = !showOnlyValidated || instrument.validated;
    
    return matchesSearch && matchesCategory && matchesValidation;
  });

  const handleInstrumentSelect = (instrument: ScientificInstrument, type: 'full' | 'dimension' = 'full', dimensionId?: string) => {
    onInstrumentSelect(instrument, type, dimensionId);
    setSelectedInstrument(null);
    
    const selectionText = type === 'full' 
      ? `${instrument.abbreviation} completo`
      : `${instrument.abbreviation} - ${instrument.dimensions.find(d => d.id === dimensionId)?.name}`;
    
    toast({
      title: "Instrumento añadido",
      description: `${selectionText} se añadió a la evaluación`,
    });
  };

  const InstrumentCard = ({ instrument }: { instrument: ScientificInstrument }) => {
    const config = CATEGORY_CONFIG[instrument.category];
    const isSelected = selectedInstruments.includes(instrument.id);
    
    return (
      <Card 
        className={`${config.color} hover:shadow-lg transition-all duration-200 cursor-pointer ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => setSelectedInstrument(instrument)}
      >
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{instrument.abbreviation}</h3>
                  <p className="text-sm font-medium text-gray-700">{instrument.name}</p>
                  <p className="text-xs text-gray-600">{instrument.authors} ({instrument.yearDeveloped})</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {instrument.validated && (
                  <Badge className="bg-green-100 text-green-800">
                    <Award className="w-3 h-3 mr-1" />
                    Validado
                  </Badge>
                )}
                {instrument.benchmarksAvailable && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <Target className="w-3 h-3 mr-1" />
                    Benchmarks
                  </Badge>
                )}
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 leading-relaxed">{instrument.description}</p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/60 rounded-lg p-3">
                <div className="text-lg font-bold text-gray-900">{instrument.totalItems}</div>
                <div className="text-xs text-gray-600">ítems</div>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <div className="text-lg font-bold text-gray-900">{instrument.estimatedMinutes}</div>
                <div className="text-xs text-gray-600">minutos</div>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <div className="text-lg font-bold text-gray-900">{instrument.dimensions.length}</div>
                <div className="text-xs text-gray-600">dimensiones</div>
              </div>
            </div>

            {/* Dimensions Preview */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">Dimensiones:</h4>
              <div className="flex flex-wrap gap-1">
                {instrument.dimensions.slice(0, 3).map((dimension) => (
                  <Badge key={dimension.id} variant="outline" className="text-xs">
                    {dimension.name} ({dimension.items})
                  </Badge>
                ))}
                {instrument.dimensions.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{instrument.dimensions.length - 3} más
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleInstrumentSelect(instrument, 'full');
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Añadir Completo
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedInstrument(instrument);
                }}
              >
                <Target className="w-4 h-4 mr-1" />
                Seleccionar Dimensiones
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const InstrumentDetailModal = ({ instrument }: { instrument: ScientificInstrument }) => {
    const config = CATEGORY_CONFIG[instrument.category];
    
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className={`${config.color} border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{config.icon}</span>
              <div>
                <CardTitle className="text-xl">{instrument.name}</CardTitle>
                <p className="text-muted-foreground">{instrument.abbreviation} • {instrument.authors} ({instrument.yearDeveloped})</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setSelectedInstrument(null)}>×</Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Info */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-sm text-muted-foreground">{instrument.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm">Total de Ítems</h4>
                  <p className="text-2xl font-bold text-primary">{instrument.totalItems}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Tiempo Estimado</h4>
                  <p className="text-2xl font-bold text-primary">{instrument.estimatedMinutes} min</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => handleInstrumentSelect(instrument, 'full')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Instrumento Completo
                </Button>
              </div>
            </div>

            {/* Right Column - Dimensions */}
            <div>
              <h3 className="font-semibold mb-4">Selección Individual de Dimensiones</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {instrument.dimensions.map((dimension) => (
                  <Card key={dimension.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{dimension.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {dimension.items} ítems
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{dimension.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleInstrumentSelect(instrument, 'dimension', dimension.id)}
                          className="ml-2"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* References */}
          {instrument.references.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Referencias Científicas</h4>
              <div className="space-y-1">
                {instrument.references.map((ref, index) => (
                  <p key={index} className="text-xs text-muted-foreground">{ref}</p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Catálogo de Instrumentos Científicos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar instrumentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-background border-input z-50">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent className="bg-background border-input shadow-lg z-[100]">
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.icon} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="validated"
                checked={showOnlyValidated}
                onCheckedChange={(checked) => setShowOnlyValidated(checked === true)}
              />
              <Label htmlFor="validated" className="text-sm">Solo instrumentos validados</Label>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Mostrando {filteredInstruments.length} de {SCIENTIFIC_INSTRUMENTS.length} instrumentos</span>
            <Badge variant="outline">{filteredInstruments.filter(i => i.validated).length} validados científicamente</Badge>
            <Badge variant="outline">{filteredInstruments.filter(i => i.category === 'climate').length} de clima</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Instruments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstruments.map((instrument) => (
          <InstrumentCard key={instrument.id} instrument={instrument} />
        ))}
      </div>

      {filteredInstruments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontraron instrumentos</h3>
            <p className="text-muted-foreground">
              Intenta ajustar los filtros de búsqueda para encontrar el instrumento que necesitas.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedInstrument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[200]">
          <InstrumentDetailModal instrument={selectedInstrument} />
        </div>
      )}
    </div>
  );
};