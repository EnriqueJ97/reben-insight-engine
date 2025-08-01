import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Brain, 
  MessageSquare,
  Lightbulb,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CompanyContext {
  totalEmployees: number;
  avgMood: number;
  unresolvedAlerts: number;
  highSeverityAlerts: number;
  totalCheckins: number;
}

const HRChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente especializado en Recursos Humanos. Puedo ayudarte con estrategias de bienestar, análisis de métricas, gestión de equipos y mucho más. ¿En qué puedo asistirte hoy?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [companyContext, setCompanyContext] = useState<CompanyContext | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickQuestions = [
    "¿Cómo puedo mejorar el engagement de mi equipo?",
    "¿Qué estrategias recomiendas para reducir el burnout?",
    "¿Cómo interpretar las métricas de bienestar actuales?",
    "¿Cuáles son las mejores prácticas para retención de talento?",
    "¿Cómo implementar un programa de bienestar mental?",
    "¿Qué hacer con empleados en riesgo alto?"
  ];

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('hr-ai-chat', {
        body: {
          message: messageText,
          conversation_history: conversationHistory,
          user_id: user.id,
          tenant_id: user.tenant_id
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.fallback_response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.context) {
        setCompanyContext(data.context);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo en unos momentos.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Error al procesar tu mensaje');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-screen flex flex-col max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span>Asistente IA para RRHH</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Consultor especializado en bienestar organizacional y gestión de talento
          </p>
        </div>
        
        {/* Company Context */}
        {companyContext && (
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-sm font-medium">{companyContext.totalEmployees}</div>
              <div className="text-xs text-muted-foreground">Empleados</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{companyContext.avgMood}/5</div>
              <div className="text-xs text-muted-foreground">Bienestar</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-warning">{companyContext.unresolvedAlerts}</div>
              <div className="text-xs text-muted-foreground">Alertas</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Questions Sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Lightbulb className="h-5 w-5" />
                <span>Consultas Frecuentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto py-3 px-3 whitespace-normal"
                  onClick={() => handleQuickQuestion(question)}
                  disabled={isLoading}
                >
                  <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-xs">{question}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>Conversación</span>
                <Badge variant="outline" className="ml-auto">
                  {messages.length - 1} mensajes
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs opacity-70 flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(message.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bot className="h-5 w-5 text-primary animate-pulse" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Escribe tu consulta sobre RRHH..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={!inputMessage.trim() || isLoading}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  Asistente especializado en bienestar organizacional • Respuestas basadas en mejores prácticas de RRHH
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HRChat;