import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bot, 
  User, 
  Send, 
  Brain, 
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
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

const FloatingChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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

  // Visible para todos los usuarios autenticados
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
          size="icon"
        >
          <Brain className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[90vw] animate-scale-in">
          <Card className="h-[600px] max-h-[80vh] flex flex-col shadow-2xl">
            {/* Header */}
            <CardHeader className="flex-shrink-0 p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Asistente Inteligente RRHH</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Especialista en bienestar organizacional
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Company Context */}
              {(companyContext && !isMinimized && (user?.role === 'HR_ADMIN' || user?.role === 'MANAGER')) && (
                <div className="flex items-center justify-between text-xs mt-2 p-2 bg-muted rounded">
                  <div className="text-center">
                    <div className="font-medium">{companyContext.totalEmployees}</div>
                    <div className="text-muted-foreground">Empleados</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{companyContext.avgMood}/5</div>
                    <div className="text-muted-foreground">Bienestar</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-warning">{companyContext.unresolvedAlerts}</div>
                    <div className="text-muted-foreground">Alertas</div>
                  </div>
                </div>
              )}
            </CardHeader>
            
            {!isMinimized && (
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 px-4 py-2" ref={scrollAreaRef}>
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-2 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <Bot className="h-3 w-3 text-primary" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </div>
                          <div className="flex items-center justify-end mt-1">
                            <div className="text-xs opacity-70 flex items-center space-x-1">
                              <Clock className="h-2 w-2" />
                              <span>{formatTime(message.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {message.role === 'user' && (
                          <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <Bot className="h-3 w-3 text-primary animate-pulse" />
                        </div>
                        <div className="bg-muted rounded-lg px-3 py-2">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-muted-foreground/50 rounded-full animate-bounce" />
                            <div className="w-1 h-1 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-1 h-1 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Quick Questions */}
                <div className="border-t p-2">
                  <div className="text-xs text-muted-foreground mb-2">Consultas rápidas:</div>
                  <div className="grid grid-cols-1 gap-1">
                    {quickQuestions.slice(0, 3).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-left justify-start"
                        onClick={() => handleQuickQuestion(question)}
                        disabled={isLoading}
                      >
                        <MessageSquare className="h-2 w-2 mr-1 flex-shrink-0" />
                        <span className="truncate">{question}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="border-t p-3">
                  <form onSubmit={handleSubmit} className="flex space-x-2">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Escribe tu consulta..."
                      disabled={isLoading}
                      className="flex-1 text-sm"
                    />
                    <Button 
                      type="submit" 
                      disabled={!inputMessage.trim() || isLoading}
                      size="icon"
                      className="h-9 w-9"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default FloatingChatWidget;