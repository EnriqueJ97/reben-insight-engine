import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WELLNESS_QUESTIONS, getRandomDailyQuestion } from '@/data/questions';
import { Mail, Send, Clock, Users, CheckCircle, AlertCircle, Plus, Eye } from 'lucide-react';

interface EmailCampaign {
  id: string;
  name: string;
  question_id: string;
  subject: string;
  scheduled_time: string;
  is_active: boolean;
  created_at: string;
  sent_at: string | null;
  total_recipients: number;
}

interface EmailLog {
  id: string;
  campaign_id: string;
  email: string;
  sent_at: string;
  delivery_status: string;
}

export const EmailCampaignManager = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const { toast } = useToast();

  // Formulario para nueva campaña
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    question_id: '',
    subject: '🧠 Tu pregunta de bienestar diaria',
    scheduled_time: '09:00',
    is_active: true
  });

  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al cargar campañas: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailLogs = async (campaignId: string) => {
    try {
      const { data, error } = await supabase
        .from('email_sent_log')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      setEmailLogs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al cargar logs: " + error.message,
        variant: "destructive"
      });
    }
  };

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.question_id) {
      toast({
        title: "Error",
        description: "Completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { error } = await supabase
        .from('email_campaigns')
        .insert({
          ...newCampaign,
          tenant_id: profile?.tenant_id,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Campaña creada correctamente"
      });

      setShowCreateDialog(false);
      setNewCampaign({
        name: '',
        question_id: '',
        subject: '🧠 Tu pregunta de bienestar diaria',
        scheduled_time: '09:00',
        is_active: true
      });
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al crear campaña: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async (questionId: string) => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Ingresa un email para la prueba",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-daily-question', {
        body: {
          questionId,
          testEmail
        }
      });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Email de prueba enviado correctamente"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al enviar email de prueba: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendCampaign = async (campaignId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-daily-question', {
        body: { campaignId }
      });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Campaña enviada a ${data.totalSent} usuarios`
      });

      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al enviar campaña: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaignStatus = async (campaignId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({ is_active: isActive })
        .eq('id', campaignId);

      if (error) throw error;
      
      fetchCampaigns();
      toast({
        title: "Éxito",
        description: `Campaña ${isActive ? 'activada' : 'desactivada'}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al actualizar campaña: " + error.message,
        variant: "destructive"
      });
    }
  };

  const generateRandomCampaign = () => {
    const randomQuestion = getRandomDailyQuestion();
    setNewCampaign(prev => ({
      ...prev,
      name: `Campaña ${randomQuestion.category} - ${new Date().toLocaleDateString()}`,
      question_id: randomQuestion.id,
      subject: `🧠 ${randomQuestion.category === 'burnout' ? 'Check de Burnout' : 
                     randomQuestion.category === 'turnover' ? 'Check de Retención' : 
                     'Check de Satisfacción'} - ${new Date().toLocaleDateString()}`
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Campañas de Email</h2>
          <p className="text-muted-foreground">Envía preguntas de bienestar diarias a toda la organización</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Campaña
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Campaña de Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={generateRandomCampaign} className="flex-1">
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
                  <SelectContent>
                    {WELLNESS_QUESTIONS.map((question) => (
                      <SelectItem key={question.id} value={question.id}>
                        [{question.id}] {question.text.substring(0, 60)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    onClick={() => sendTestEmail(newCampaign.question_id)}
                    disabled={!newCampaign.question_id || !testEmail}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Probar
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={createCampaign} disabled={loading} className="flex-1">
                  Crear Campaña
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {campaigns.map((campaign) => {
          const question = WELLNESS_QUESTIONS.find(q => q.id === campaign.question_id);
          
          return (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      {campaign.name}
                      {campaign.is_active ? (
                        <Badge variant="default">Activa</Badge>
                      ) : (
                        <Badge variant="secondary">Inactiva</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {campaign.subject}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Switch
                      checked={campaign.is_active}
                      onCheckedChange={(checked) => toggleCampaignStatus(campaign.id, checked)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Pregunta:</p>
                      <p className="text-sm text-muted-foreground">
                        [{campaign.question_id}] {question?.text}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        Programada: {campaign.scheduled_time}
                      </div>
                      {campaign.sent_at && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Enviada: {new Date(campaign.sent_at).toLocaleString()}
                        </div>
                      )}
                      {campaign.total_recipients > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4" />
                          {campaign.total_recipients} destinatarios
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => sendCampaign(campaign.id)}
                      disabled={loading || !campaign.is_active}
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Ahora
                    </Button>
                    
                    {campaign.sent_at && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          fetchEmailLogs(campaign.id);
                        }}
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Logs
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {campaigns.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay campañas creadas</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera campaña para empezar a enviar preguntas de bienestar
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Campaña
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog para ver logs */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Logs de Envío - {selectedCampaign?.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {emailLogs.map((log) => (
                <div key={log.id} className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">{log.email}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={log.delivery_status === 'sent' ? 'default' : 'destructive'}>
                      {log.delivery_status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.sent_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};