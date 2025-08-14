import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FlexPolicy {
  id: string;
  name: string;
  min_on_site_days: number;
  core_hours: any;
  allowed_modes: string[];
  is_active: boolean;
}

interface ValidationResult {
  isValid: boolean;
  violations: string[];
  activePolicy: FlexPolicy | null;
}

export const useFlexPolicyEnforcement = () => {
  const { user } = useAuth();
  const [activePolicy, setActivePolicy] = useState<FlexPolicy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadActivePolicy();
    }
  }, [user]);

  const loadActivePolicy = async () => {
    try {
      const { data, error } = await supabase
        .from('flex_policies')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setActivePolicy(data || null);
    } catch (error) {
      console.error('Error loading active policy:', error);
      setActivePolicy(null);
    } finally {
      setLoading(false);
    }
  };

  const validateFlexRequest = (
    requestedMode: string,
    requestedHours?: { start: string; end: string }
  ): ValidationResult => {
    if (!activePolicy) {
      return {
        isValid: true,
        violations: [],
        activePolicy: null
      };
    }

    const violations: string[] = [];

    // Check if requested mode is allowed
    if (!activePolicy.allowed_modes.includes(requestedMode)) {
      violations.push(`La modalidad "${getModeLabel(requestedMode)}" no está permitida por la política activa`);
    }

    // Check core hours if requested hours are provided
    if (requestedHours && activePolicy.core_hours) {
      const policyStart = timeToMinutes(activePolicy.core_hours.start);
      const policyEnd = timeToMinutes(activePolicy.core_hours.end);
      const requestStart = timeToMinutes(requestedHours.start);
      const requestEnd = timeToMinutes(requestedHours.end);

      if (requestStart > policyStart || requestEnd < policyEnd) {
        violations.push(
          `El horario solicitado (${requestedHours.start}-${requestedHours.end}) debe incluir el horario núcleo (${activePolicy.core_hours.start}-${activePolicy.core_hours.end})`
        );
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
      activePolicy
    };
  };

  const validateWeeklySchedule = async (employeeId: string, weekDate: Date): Promise<ValidationResult> => {
    if (!activePolicy) {
      return {
        isValid: true,
        violations: [],
        activePolicy: null
      };
    }

    try {
      // Get the week's approved flex requests
      const startOfWeek = new Date(weekDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6); // Sunday

      const { data: weekRequests, error } = await supabase
        .from('flex_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('status', 'APPROVED')
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', endOfWeek.toISOString().split('T')[0]);

      if (error) throw error;

      const violations: string[] = [];
      
      // Count office days
      const officeDays = (weekRequests || []).filter(req => 
        req.requested_mode === 'OFFICE'
      ).length;

      if (officeDays < activePolicy.min_on_site_days) {
        violations.push(
          `Se requieren al menos ${activePolicy.min_on_site_days} días en oficina por semana. Actualmente programados: ${officeDays}`
        );
      }

      return {
        isValid: violations.length === 0,
        violations,
        activePolicy
      };
    } catch (error) {
      console.error('Error validating weekly schedule:', error);
      return {
        isValid: false,
        violations: ['Error al validar el horario semanal'],
        activePolicy
      };
    }
  };

  const getModeLabel = (mode: string): string => {
    switch (mode) {
      case 'OFFICE': return 'Oficina';
      case 'REMOTE': return 'Remoto';
      case 'HYBRID': return 'Híbrido';
      default: return mode;
    }
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  return {
    activePolicy,
    loading,
    validateFlexRequest,
    validateWeeklySchedule,
    refreshPolicy: loadActivePolicy
  };
};