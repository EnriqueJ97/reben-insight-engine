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
  assigned_to?: string;
  status?: 'pending' | 'in_progress' | 'resolved';
  profiles?: {
    full_name: string;
    email: string;
    role: string;
    team_id?: string;
    teams?: {
      id: string;
      name: string;
    };
  };
}

export const useAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async (teamId?: string) => {
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
            role,
            team_id,
            teams!profiles_team_id_fkey (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      // Filter based on user role
      if (user.role === 'EMPLOYEE') {
        query = query.eq('user_id', user.id);
      } else if (user.role === 'MANAGER') {
        // Manager can only see alerts from their team members
        const teamMemberIds = await getTeamMemberIds();
        if (teamMemberIds.length > 0) {
          query = query.in('user_id', teamMemberIds);
        } else {
          // If no team members, return empty array
          setAlerts([]);
          return;
        }
      } else if (user.role === 'HR_ADMIN') {
        // HR_ADMIN can see all alerts in their tenant
        const { data: tenantProfiles } = await supabase
          .from('profiles')
          .select('id, team_id')
          .eq('tenant_id', user.tenant_id);
        
        const userIds = tenantProfiles?.map(p => p.id) || [];
        
        if (userIds.length > 0) {
          query = query.in('user_id', userIds);
          
          // If specific team filter is applied
          if (teamId) {
            const teamUserIds = tenantProfiles
              ?.filter(p => p.team_id === teamId)
              .map(p => p.id) || [];
            if (teamUserIds.length > 0) {
              query = query.in('user_id', teamUserIds);
            }
          }
        } else {
          setAlerts([]);
          return;
        }
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
    if (!user) return [];

    try {
      let query = supabase
        .from('profiles')
        .select('id')
        .eq('tenant_id', user.tenant_id);

      // For managers, get their team members
      if (user.role === 'MANAGER') {
        if (user.team_id) {
          // If user has team_id, get all members of that team
          query = query.eq('team_id', user.team_id);
        } else {
          // If manager doesn't have team_id, find teams where they are the manager
          const { data: teams } = await supabase
            .from('teams')
            .select('id')
            .eq('manager_id', user.id)
            .eq('tenant_id', user.tenant_id);
          
          if (teams && teams.length > 0) {
            const teamIds = teams.map(t => t.id);
            query = query.in('team_id', teamIds);
          } else {
            return [];
          }
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data?.map(p => p.id) || [];
    } catch (error) {
      console.error('Error getting team member IDs:', error);
      return [];
    }
  };

  const getGlobalAlertStats = () => {
    const stats = getAlertStats();
    
    // Group by teams for HR_ADMIN
    const teamStats = alerts.reduce((acc, alert) => {
      const teamName = alert.profiles?.teams?.name || 'Sin equipo';
      if (!acc[teamName]) {
        acc[teamName] = {
          total: 0,
          critical: 0,
          resolved: 0,
          teamId: alert.profiles?.team_id
        };
      }
      acc[teamName].total++;
      if (alert.severity === 'high') acc[teamName].critical++;
      if (alert.resolved) acc[teamName].resolved++;
      return acc;
    }, {} as Record<string, any>);

    return {
      ...stats,
      teamBreakdown: teamStats
    };
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
    getAlertStats,
    getGlobalAlertStats
  };
};