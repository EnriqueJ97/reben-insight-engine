import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, Filter, Send, RefreshCw } from 'lucide-react';

interface FeedbackItem {
  id: string;
  category: string;
  message: string;
  metadata: any;
  created_at: string;
}

const categories = [
  { value: 'all', label: 'Todas' },
  { value: 'wellness', label: 'Bienestar' },
  { value: 'policy', label: 'Políticas' },
  { value: 'manager', label: 'Manager' },
  { value: 'workload', label: 'Carga de trabajo' },
  { value: 'culture', label: 'Cultura' },
  { value: 'other', label: 'Otra' },
];

const AnonymousFeedback: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [from, setFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [sendingDigest, setSendingDigest] = useState(false);

  const fetchFeedback = async () => {
    if (!user?.tenant_id) return;
    setLoading(true);
    try {
      let query = supabase
        .from('anonymous_feedback')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false });

      const fromISO = new Date(from).toISOString();
      const toISO = new Date(new Date(to).setDate(new Date(to).getDate() + 1)).toISOString();
      query = query.gte('created_at', fromISO).lt('created_at', toISO);

      if (category !== 'all') query = query.eq('category', category);

      const { data, error } = await query;
      if (error) throw error;

      const list = (data || []) as FeedbackItem[];
      setFeedback(list);
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: 'No se pudo cargar el feedback', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.tenant_id]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return feedback;
    return feedback.filter(f => f.message.toLowerCase().includes(s));
  }, [feedback, search]);

  const exportCSV = () => {
    const rows = [
      ['Fecha', 'Categoría', 'Mensaje'],
      ...filtered.map(f => [new Date(f.created_at).toLocaleString('es-ES'), f.category, f.message.replace(/\n/g, ' ')]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_anonimo_${from}_a_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendWeeklyDigest = async () => {
    if (!user?.tenant_id) return;
    try {
      setSendingDigest(true);
      await supabase.functions.invoke('send-weekly-digest', {
        body: { tenantId: user.tenant_id, from, to },
      });
      toast({ title: 'Enviado', description: 'Digest semanal enviado a RRHH' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: 'No se pudo enviar el digest', variant: 'destructive' });
    } finally {
      setSendingDigest(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Feedback anónimo</h1>
        <p className="text-muted-foreground">Escucha activa del equipo, totalmente anónima.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-6">
          <div className="md:col-span-2"><Input placeholder="Buscar texto..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div>
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Filter className="h-3 w-3" /> Categoría</div>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded-md h-9 bg-background">
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Desde</div>
            <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Hasta</div>
            <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={fetchFeedback} variant="outline" disabled={loading}><RefreshCw className="h-4 w-4 mr-2" />Actualizar</Button>
            <Button onClick={exportCSV} variant="secondary"><Download className="h-4 w-4 mr-2" />Exportar</Button>
            <Button onClick={sendWeeklyDigest} disabled={sendingDigest}><Send className="h-4 w-4 mr-2" />Digest semanal</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entradas ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Mensaje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">{new Date(item.created_at).toLocaleString('es-ES')}</TableCell>
                  <TableCell className="whitespace-nowrap"><Badge variant="outline">{item.category}</Badge></TableCell>
                  <TableCell>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{item.message}</div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">Sin resultados</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnonymousFeedback;
