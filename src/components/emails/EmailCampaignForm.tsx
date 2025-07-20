
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/types/wellness';
import { Send } from 'lucide-react';

interface EmailCampaignFormProps {
  newCampaign: {
    name: string;
    question_id: string;
    subject: string;
    scheduled_time: string;
    is_active: boolean;
  };
  setNewCampaign: (campaign: any) => void;
  questions: Question[];
  testEmail: string;
  setTestEmail: (email: string) => void;
  onCreateCampaign: () => void;
  onSendTest: (questionId: string) => void;
  onCancel: () => void;
  onGenerateRandom: () => void;
  loading: boolean;
}

const CATEGORIES = [
  { value: 'burnout', label: 'Burnout', color: 'bg-red-100 text-red-800' },
  { value: 'turnover', label: 'Rotación', color: 'bg-orange-100 text-orange-800' },
  { value: 'satisfaction', label: 'Satisfacción', color: 'bg-green-100 text-green-800' },
  { value: 'extra', label: 'Extra', color: 'bg-blue-100 text-blue-800' }
];

export const EmailCampaignForm: React.FC<EmailCampaignFormProps> = ({
  newCampaign,
  setNewCampaign,
  questions,
  testEmail,
  setTestEmail,
  onCreateCampaign,
  onSendTest,
  onCancel,
  onGenerateRandom,
  loading
}) => {
  const selectedQuestion = questions.find(q => q.id === newCampaign.question_id);
  const questionCategory = selectedQuestion ? CATEGORIES.find(c => c.value === selectedQuestion.category) : null;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" onClick={onGenerateRandom} className="flex-1">
          🎲 Generar Campaña Aleatoria
        </Button>
      </div>
      
      <div>
        <Label htmlFor="name">Nombre de la Campaña</Label>
        <Input
          id="name"
          value={newCampaign.name}
          onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ej: Check de Burnout Semanal"
        />
      </div>

      <div>
        <Label htmlFor="question">Pregunta</Label>
        <Select 
          value={newCampaign.question_id} 
          onValueChange={(value) => setNewCampaign(prev => ({ ...prev, question_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una pregunta" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {questions.map((question) => {
              const category = CATEGORIES.find(c => c.value === question.category);
              return (
                <SelectItem key={question.id} value={question.id}>
                  <div className="flex flex-col gap-1 py-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">[{question.id}]</span>
                      <Badge className={category?.color} variant="outline">
                        {category?.label}
                      </Badge>
                    </div>
                    <span className="text-sm">{question.text.substring(0, 80)}...</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        
        {selectedQuestion && (
          <Card className="mt-2">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={questionCategory?.color}>
                    {questionCategory?.label}
                  </Badge>
                  <span className="font-mono text-sm">[{selectedQuestion.id}]</span>
                </div>
                <p className="text-sm">{selectedQuestion.text}</p>
                <p className="text-xs text-muted-foreground">
                  Escala: {selectedQuestion.scale_description}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <Label htmlFor="subject">Asunto del Email</Label>
        <Input
          id="subject"
          value={newCampaign.subject}
          onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="time">Hora de Envío Programada</Label>
        <Input
          id="time"
          type="time"
          value={newCampaign.scheduled_time}
          onChange={(e) => setNewCampaign(prev => ({ ...prev, scheduled_time: e.target.value }))}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={newCampaign.is_active}
          onCheckedChange={(checked) => setNewCampaign(prev => ({ ...prev, is_active: checked }))}
        />
        <Label htmlFor="active">Campaña Activa</Label>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Enviar Email de Prueba</h4>
        <div className="flex gap-2">
          <Input
            placeholder="email@ejemplo.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            type="email"
          />
          <Button 
            variant="outline" 
            onClick={() => onSendTest(newCampaign.question_id)}
            disabled={!newCampaign.question_id || !testEmail}
          >
            <Send className="w-4 h-4 mr-2" />
            Probar
          </Button>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={onCreateCampaign} disabled={loading} className="flex-1">
          Crear Campaña
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};
