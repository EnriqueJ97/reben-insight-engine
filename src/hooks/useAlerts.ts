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
  priority?: 'low' | 'medium' | 'high';
  sla_due_at?: string;
  last_action_at?: string;
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

  const resolveAlert = async (alertId: string, note?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // 1) Log resolution action
      if (note && note.trim()) {
        const { error: actionError } = await supabase
          .from('alert_actions')
          .insert({
            alert_id: alertId,
            user_id: user.id,
            action_type: 'resolve',
            note,
          });
        if (actionError) throw actionError;
      }

      // 2) Mark alert as resolved and set status
      const { data, error } = await supabase
        .from('alerts')
        .update({
          resolved: true,
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
          status: 'resolved',
          last_action_at: new Date().toISOString(),
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;

      // 3) Update local state
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId
          ? { ...alert, resolved: true, resolved_by: user.id, resolved_at: data.resolved_at, status: 'resolved', last_action_at: data.last_action_at }
          : alert
      ));

      return data;
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  };

  // Assign alert to a user (defaults to current user) and mark in progress
  const assignAlert = async (alertId: string, assigneeId?: string) => {
    if (!user) throw new Error('User not authenticated');
    const assignedId = assigneeId || user.id;
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({ assigned_to: assignedId, status: 'in_progress', last_action_at: new Date().toISOString() })
        .eq('id', alertId)
        .select()
        .single();
      if (error) throw error;

      // Log action
      const { error: actionError } = await supabase
        .from('alert_actions')
        .insert({ alert_id: alertId, user_id: user.id, action_type: 'assign', metadata: { assigned_to: assignedId } });
      if (actionError) throw actionError;

      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, assigned_to: assignedId, status: 'in_progress', last_action_at: data.last_action_at } : a));
      return data;
    } catch (error) {
      console.error('Error assigning alert:', error);
      throw error;
    }
  };

  // Set SLA in hours (relative deadline)
  const setAlertSLA = async (alertId: string, hours: number) => {
    if (!user) throw new Error('User not authenticated');
    const dueAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({ sla_due_at: dueAt, last_action_at: new Date().toISOString() })
        .eq('id', alertId)
        .select()
        .single();
      if (error) throw error;

      // Log action
      const { error: actionError } = await supabase
        .from('alert_actions')
        .insert({ alert_id: alertId, user_id: user.id, action_type: 'sla_update', metadata: { hours, sla_due_at: dueAt } });
      if (actionError) throw actionError;

      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, sla_due_at: dueAt, last_action_at: data.last_action_at } : a));
      return data;
    } catch (error) {
      console.error('Error setting SLA:', error);
      throw error;
    }
  };

  // Add a note to an alert
  const addAlertNote = async (alertId: string, note: string) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const { error } = await supabase
        .from('alert_actions')
        .insert({ alert_id: alertId, user_id: user.id, action_type: 'note', note });
      if (error) throw error;
      // Optimistic: update last action time locally
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, last_action_at: new Date().toISOString() } : a));
    } catch (error) {
      console.error('Error adding note to alert:', error);
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

  // AI-based prioritization (client-side, non-persistent)
  const getAIPrioritizedAlerts = () => {
    const now = Date.now();

    const scoreFor = (a: Alert) => {
      let score = 0;
      // Severity weight
      score += a.severity === 'high' ? 50 : a.severity === 'medium' ? 30 : 10;

      // SLA urgency
      if (!a.resolved && a.sla_due_at) {
        const due = new Date(a.sla_due_at).getTime();
        const diffH = Math.round((due - now) / (1000 * 60 * 60));
        if (diffH < 0) {
          // Overdue
          score += 40 + Math.min(30, Math.abs(diffH));
        } else if (diffH <= 12) {
          score += 30;
        } else if (diffH <= 24) {
          score += 20;
        }
      }

      // Status
      if (a.status === 'pending' || !a.status) score += 10;

      // Inactivity since last action
      if (a.last_action_at) {
        const hours = Math.max(0, Math.round((now - new Date(a.last_action_at).getTime()) / (1000 * 60 * 60)));
        score += Math.min(20, Math.floor(hours / 6)); // +1 per 6h stalled, capped at 20
      }

      // Type weighting
      const typeWeights: Record<string, number> = {
        burnout_risk: 10,
        high_stress: 8,
        workload_critical: 8,
        turnover_risk: 7,
      };
      score += typeWeights[a.type] || 0;

      return score;
    };

    const withScores = alerts.map((a) => {
      const s = scoreFor(a as Alert);
      const label: 'low' | 'medium' | 'high' = s >= 80 ? 'high' : s >= 50 ? 'medium' : 'low';
      return {
        ...(a as Alert),
        aiPriorityScore: s,
        aiPriority: label,
      } as Alert & { aiPriorityScore: number; aiPriority: 'low' | 'medium' | 'high' };
    });

    return withScores.sort(
      (a: any, b: any) => b.aiPriorityScore - a.aiPriorityScore
    );
  };

  // SLA metrics per team (client-side)
  const getTeamSLAMetrics = () => {
    const result: Record<string, any> = {};

    const groups = alerts.reduce((acc, a) => {
      const teamName = a.profiles?.teams?.name || 'Sin equipo';
      if (!acc[teamName]) acc[teamName] = [] as Alert[];
      acc[teamName].push(a);
      return acc;
    }, {} as Record<string, Alert[]>);

    const now = new Date();

    for (const [teamName, list] of Object.entries(groups)) {
      const total = list.length;
      const unresolved = list.filter((a) => !a.resolved);
      const breaches = unresolved.filter(
        (a) => a.sla_due_at && new Date(a.sla_due_at) < now
      ).length;
      const dueSoon = unresolved.filter(
        (a) =>
          a.sla_due_at &&
          new Date(a.sla_due_at).getTime() - now.getTime() <= 24 * 60 * 60 * 1000 &&
          new Date(a.sla_due_at) >= now
      ).length;

      const resolvedWithTimes = list.filter(
        (a) => a.resolved && a.resolved_at && a.created_at
      );
      const avgResMs = resolvedWithTimes.length
        ? resolvedWithTimes.reduce(
            (sum, a) =>
              sum +
              (new Date(a.resolved_at!).getTime() -
                new Date(a.created_at).getTime()),
            0
          ) / resolvedWithTimes.length
        : 0;
      const avgResolutionHours = Math.round(avgResMs / (1000 * 60 * 60));

      const resolvedWithinSLA = list.filter(
        (a) =>
          a.resolved &&
          a.resolved_at &&
          a.sla_due_at &&
          new Date(a.resolved_at) <= new Date(a.sla_due_at)
      ).length;
      const resolvedWithSLA = list.filter((a) => a.resolved && a.sla_due_at).length;
      const complianceRate = resolvedWithSLA > 0
        ? Math.round((resolvedWithinSLA / resolvedWithSLA) * 100)
        : 0;

      result[teamName] = {
        total,
        unresolved: unresolved.length,
        breaches,
        dueSoon,
        avgResolutionHours,
        complianceRate,
        teamId: (list[0] as any)?.profiles?.team_id,
      };
    }

    return result;
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
    assignAlert,
    setAlertSLA,
    addAlertNote,
    checkForBurnoutAlerts,
    getAlertStats,
    getGlobalAlertStats,
    getAIPrioritizedAlerts,
    getTeamSLAMetrics,
  };
};