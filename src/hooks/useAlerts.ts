import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Alert {
  id: string;
  user_id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
    role: string;
  };
}

export const useAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('alerts')
        .select(`
          *,
          profiles!alerts_user_id_fkey (
            full_name,
            email,
            role
          )
        `)
        .order('created_at', { ascending: false });

      // Filter based on user role
      if (user.role === 'EMPLOYEE') {
        query = query.eq('user_id', user.id);
      } else if (user.role === 'MANAGER') {
        // Manager can see alerts from their team members
        query = query.in('user_id', await getTeamMemberIds());
      } else if (user.role === 'HR_ADMIN') {
        // HR_ADMIN can see all alerts in their tenant
        const { data: tenantProfiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('tenant_id', user.tenant_id);
        
        const userIds = tenantProfiles?.map(p => p.id) || [];
        query = query.in('user_id', userIds);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAlerts((data as Alert[]) || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTeamMemberIds = async (): Promise<string[]> => {
    if (!user?.team_id) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('team_id', user.team_id);

      if (error) throw error;
      return data?.map(p => p.id) || [];
    } catch (error) {
      console.error('Error getting team member IDs:', error);
      return [];
    }
  };

  const createAlert = async (
    userId: string, 
    type: string, 
    severity: 'low' | 'medium' | 'high',
    message: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .insert({
          user_id: userId,
          type,
          severity,
          message,
          resolved: false
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setAlerts(prev => [data as Alert, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  };

  const resolveAlert = async (alertId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({
          resolved: true,
          resolved_by: user.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true, resolved_by: user.id, resolved_at: data.resolved_at }
          : alert
      ));
      
      return data;
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  };

  const checkForBurnoutAlerts = async (userId: string) => {
    try {
      // Get last 3 checkins for the user
      const { data: recentCheckins, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      // Check if last 3 checkins have mood <= 2 (low mood)
      if (recentCheckins && recentCheckins.length >= 3) {
        const lowMoodDays = recentCheckins.filter(checkin => checkin.mood <= 2);
        
        if (lowMoodDays.length >= 3) {
          // Check if alert already exists for this user
          const { data: existingAlert } = await supabase
            .from('alerts')
            .select('id')
            .eq('user_id', userId)
            .eq('type', 'burnout_risk')
            .eq('resolved', false)
            .single();

          if (!existingAlert) {
            await createAlert(
              userId,
              'burnout_risk',
              'high',
              '3 días consecutivos de estado de ánimo bajo detectados'
            );
          }
        }
      }
    } catch (error) {
      console.error('Error checking for burnout alerts:', error);
    }
  };

  const getAlertStats = () => {
    const unresolved = alerts.filter(alert => !alert.resolved);
    const byType = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: alerts.length,
      unresolved: unresolved.length,
      byType,
      bySeverity
    };
  };

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  return {
    alerts,
    loading,
    fetchAlerts,
    createAlert,
    resolveAlert,
    checkForBurnoutAlerts,
    getAlertStats
  };
};