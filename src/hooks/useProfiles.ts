import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserProfile } from '@/contexts/AuthContext';

export interface TeamMember extends UserProfile {
  teams?: {
    name: string;
  };
}

export const useProfiles = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTeamMembers = async (teamId?: string) => {
    if (!user) {
      return;
    }
    
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', user.tenant_id);

      // Filter based on user role and teamId
      if (user.role === 'MANAGER') {
        if (teamId) {
          query = query.eq('team_id', teamId);
        } else if (user.team_id) {
          query = query.eq('team_id', user.team_id);
        } else {
          // If manager doesn't have team_id, find their team through teams table
          const { data: managerTeams } = await supabase
            .from('teams')
            .select('id')
            .eq('manager_id', user.id);
          
          if (managerTeams && managerTeams.length > 0) {
            query = query.eq('team_id', managerTeams[0].id);
          } else {
            // Manager has no team assigned, return empty
            setProfiles([]);
            return;
          }
        }
      }
      // HR_ADMIN can see all profiles in tenant (no additional filter needed)
      
      const { data, error } = await query.order('full_name');

      if (error) {
        throw error;
      }
      
      const enhancedProfiles = (data || []).map(profile => ({
        ...profile,
        name: profile.full_name || profile.email,
        avatar: getAvatarForRole(profile.role)
      }));
      
      setProfiles(enhancedProfiles);
    } catch (error) {
      console.error('useProfiles - Catch block error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarForRole = (role: string): string => {
    switch (role) {
      case 'HR_ADMIN': return '👩‍💼';
      case 'MANAGER': return '👨‍💼';
      case 'EMPLOYEE': return '👩‍💻';
      default: return '👤';
    }
  };

  const updateProfile = async (profileId: string, updates: Partial<UserProfile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setProfiles(prev => prev.map(profile => 
        profile.id === profileId 
          ? { ...profile, ...updates }
          : profile
      ));
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const getProfileStats = async (profileId?: string) => {
    const targetProfileId = profileId || user?.id;
    if (!targetProfileId) return null;

    try {
      // Get checkin stats (most recent first)
      const { data: checkins, error: checkinsError } = await supabase
        .from('checkins')
        .select('mood, created_at')
        .eq('user_id', targetProfileId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (checkinsError) throw checkinsError;

      // Get alert stats
      const { data: alerts, error: alertsError } = await supabase
        .from('alerts')
        .select('severity, resolved, created_at')
        .eq('user_id', targetProfileId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (alertsError) throw alertsError;

      const averageMood = checkins && checkins.length > 0
        ? checkins.reduce((sum, c) => sum + c.mood, 0) / checkins.length
        : 0;

      const totalAlerts = alerts?.length || 0;
      const unresolvedAlerts = alerts?.filter(a => !a.resolved).length || 0;

      const lastCheckin = checkins && checkins.length > 0 ? checkins[0].created_at : null;
      
      return {
        totalCheckins: checkins?.length || 0,
        averageMood,
        totalAlerts,
        unresolvedAlerts,
        lastCheckin
      };
    } catch (error) {
      console.error('Error getting profile stats:', error);
      return null;
    }
  };

  const getTeamOverview = async () => {
    if (!user || (user.role !== 'MANAGER' && user.role !== 'HR_ADMIN')) {
      return null;
    }

    try {
      // Fetch fresh team members data and wait for it to complete
      await fetchTeamMembers();
      
      // Fetch profiles again to ensure we have the latest data with proper filtering
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', user.tenant_id);

      if (user.role === 'MANAGER') {
        if (user.team_id) {
          query = query.eq('team_id', user.team_id);
        } else {
          // If manager doesn't have team_id, find their team through teams table
          const { data: managerTeams } = await supabase
            .from('teams')
            .select('id')
            .eq('manager_id', user.id);
          
          if (managerTeams && managerTeams.length > 0) {
            query = query.eq('team_id', managerTeams[0].id);
          } else {
            // Manager has no team assigned, return empty
            return {
              totalMembers: 0,
              memberStats: [],
              averageTeamMood: 0,
              totalTeamAlerts: 0
            };
          }
        }
      }
      
      const { data: currentProfiles, error } = await query.order('full_name');
      if (error) throw error;

      const enhancedProfiles = (currentProfiles || []).map(profile => ({
        ...profile,
        name: profile.full_name || profile.email,
        avatar: getAvatarForRole(profile.role)
      }));
      
      // Get stats for all team members using the fresh profiles data
      const stats = await Promise.all(
        enhancedProfiles.map(async (member) => {
          const memberStats = await getProfileStats(member.id);
          return {
            ...member,
            stats: memberStats
          };
        })
      );

      return {
        totalMembers: enhancedProfiles.length,
        memberStats: stats,
        averageTeamMood: stats.length > 0 ? stats.reduce((sum, s) => sum + (s.stats?.averageMood || 0), 0) / stats.length : 0,
        totalTeamAlerts: stats.reduce((sum, s) => sum + (s.stats?.totalAlerts || 0), 0)
      };
    } catch (error) {
      console.error('Error getting team overview:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user && (user.role === 'MANAGER' || user.role === 'HR_ADMIN')) {
      fetchTeamMembers();
    }
  }, [user]);

  return {
    profiles,
    loading,
    fetchTeamMembers,
    updateProfile,
    getProfileStats,
    getTeamOverview
  };
};