import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight, User, Clock, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Shift {
  id: string;
  employee_id: string;
  shift_template_id: string;
  day: string;
  status: 'AUTO' | 'MANUAL' | 'REQUESTED';
  employee_name: string;
  shift_name: string;
  start_time: string;
  end_time: string;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

const ShiftAssignmentCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadShifts(),
        loadEmployees(),
        loadShiftTemplates()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadShifts = async () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const { data, error } = await supabase
      .from('rotas')
      .select(`
        id,
        employee_id,
        shift_template_id,
        day,
        status
      `)
      .gte('day', startOfWeek.toISOString().split('T')[0])
      .lte('day', endOfWeek.toISOString().split('T')[0]);

    if (error) throw error;

    // Get employee and shift template data separately
    const employeeIds = [...new Set(data?.map(s => s.employee_id))];
    const shiftTemplateIds = [...new Set(data?.map(s => s.shift_template_id))];

    const [employeesData, templatesData] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name')
        .eq('tenant_id', user?.tenant_id)
        .in('id', employeeIds),
      supabase
        .from('shift_templates')
        .select('id, name, start_time, end_time')
        .in('id', shiftTemplateIds)
    ]);

    const employeesMap = new Map(employeesData.data?.map(emp => [emp.id, emp]) || []);
    const templatesMap = new Map(templatesData.data?.map(temp => [temp.id, temp]) || []);

    const formattedShifts = data?.map(shift => {
      const employee = employeesMap.get(shift.employee_id);
      const template = templatesMap.get(shift.shift_template_id);
      
      return {
        id: shift.id,
        employee_id: shift.employee_id,
        shift_template_id: shift.shift_template_id,
        day: shift.day,
        status: shift.status as 'AUTO' | 'MANUAL' | 'REQUESTED',
        employee_name: employee?.full_name || 'Empleado',
        shift_name: template?.name || 'Turno',
        start_time: template?.start_time || '00:00:00',
        end_time: template?.end_time || '00:00:00'
      };
    }) || [];

    setShifts(formattedShifts);
  };

  const loadEmployees = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('tenant_id', user?.tenant_id)
      .eq('role', 'EMPLOYEE');

    if (error) throw error;
    setEmployees(data || []);
  };

  const loadShiftTemplates = async () => {
    const { data, error } = await supabase
      .from('shift_templates')
      .select('id, name, start_time, end_time')
      .eq('tenant_id', user?.tenant_id)
      .eq('is_active', true);

    if (error) throw error;
    setShiftTemplates(data || []);
  };

  const handleAssignShift = async (date: string, employeeId?: string, templateId?: string) => {
    try {
      const empId = employeeId || selectedEmployee;
      const tempId = templateId || selectedTemplate;

      if (!empId || !tempId) {
        toast.error('Selecciona empleado y turno');
        return;
      }

      // Check if shift already exists for this employee on this day in the database
      const { data: existingShifts, error: checkError } = await supabase
        .from('rotas')
        .select('id')
        .eq('day', date)
        .eq('employee_id', empId);

      if (checkError) throw checkError;
      
      if (existingShifts && existingShifts.length > 0) {
        // Update existing shift
        const { error } = await supabase
          .from('rotas')
          .update({
            shift_template_id: tempId,
            status: 'MANUAL'
          })
          .eq('day', date)
          .eq('employee_id', empId);

        if (error) throw error;
        toast.success('Turno actualizado');
      } else {
        // Create new shift
        const { error } = await supabase
          .from('rotas')
          .insert({
            employee_id: empId,
            shift_template_id: tempId,
            day: date,
            status: 'MANUAL'
          });

        if (error) throw error;
        toast.success('Turno asignado');
      }

      loadShifts();
      setSelectedEmployee('');
      setSelectedTemplate('');
    } catch (error) {
      console.error('Error assigning shift:', error);
      toast.error('Error al asignar turno');
    }
  };

  const handleRemoveShift = async (shiftId: string) => {
    try {
      const { error } = await supabase
        .from('rotas')
        .delete()
        .eq('id', shiftId);

      if (error) throw error;
      toast.success('Turno eliminado');
      loadShifts();
    } catch (error) {
      console.error('Error removing shift:', error);
      toast.error('Error al eliminar turno');
    }
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getShiftsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(shift => shift.day === dateStr);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AUTO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MANUAL': return 'bg-green-100 text-green-800 border-green-200';
      case 'REQUESTED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const weekDays = getWeekDays();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Cargando calendario...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendario de Turnos
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(currentDate.getDate() - 7);
                  setCurrentDate(newDate);
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium min-w-[200px] text-center">
                {currentDate.toLocaleDateString('es-ES', { 
                  month: 'long', 
                  year: 'numeric',
                  day: 'numeric'
                })}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(currentDate.getDate() + 7);
                  setCurrentDate(newDate);
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Assignment Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {emp.full_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar turno" />
                </SelectTrigger>
                <SelectContent>
                  {shiftTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {template.name} ({formatTime(template.start_time)} - {formatTime(template.end_time)})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {/* Day Headers */}
            {weekDays.map((day, index) => (
              <div key={index} className="text-center pb-2 border-b">
                <div className="font-medium text-sm text-muted-foreground">
                  {day.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}
                </div>
                <div className={cn(
                  "text-lg font-semibold mt-1",
                  day.toDateString() === new Date().toDateString() ? 'text-primary' : ''
                )}>
                  {day.getDate()}
                </div>
              </div>
            ))}

            {/* Shift Cards */}
            {weekDays.map((day, index) => {
              const dayShifts = getShiftsForDay(day);
              const dateStr = day.toISOString().split('T')[0];
              
              return (
                <div key={index} className="min-h-[200px] space-y-2">
                  {dayShifts.map(shift => (
                    <Dialog key={shift.id}>
                      <DialogTrigger asChild>
                        <div 
                          className={cn(
                            "p-2 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                            getStatusColor(shift.status)
                          )}
                        >
                          <div className="text-xs font-medium truncate">
                            {shift.employee_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {shift.shift_name}
                          </div>
                          <div className="text-xs">
                            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-xs mt-1"
                          >
                            {shift.status === 'AUTO' ? 'Automático' : 
                             shift.status === 'MANUAL' ? 'Manual' : 'Solicitado'}
                          </Badge>
                        </div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Detalles del Turno</DialogTitle>
                          <DialogDescription>
                            Información y opciones para este turno
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Empleado:</span>
                              <p>{shift.employee_name}</p>
                            </div>
                            <div>
                              <span className="font-medium">Turno:</span>
                              <p>{shift.shift_name}</p>
                            </div>
                            <div>
                              <span className="font-medium">Horario:</span>
                              <p>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Estado:</span>
                              <p>{shift.status === 'AUTO' ? 'Automático' : 
                                 shift.status === 'MANUAL' ? 'Manual' : 'Solicitado'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleRemoveShift(shift.id)}
                            >
                              Eliminar Turno
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                  
                  {/* Add Shift Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-12 border-2 border-dashed border-muted-foreground/25 hover:border-primary"
                    onClick={() => handleAssignShift(dateStr)}
                    disabled={!selectedEmployee || !selectedTemplate}
                  >
                    + Asignar
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
              <span>Automático</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
              <span>Manual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></div>
              <span>Solicitado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftAssignmentCalendar;