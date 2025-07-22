
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Team {
  id: string;
  name: string;
  manager_id?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  manager?: {
    id: string;
    full_name?: string;
    email: string;
  };
  member_count?: number;
  invite_code?: string;
}

export const useTeams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTeams = async () => {
    if (!user || user.role !== 'HR_ADMIN') return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          manager:profiles!teams_manager_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('tenant_id', user.tenant_id)
        .order('name');

      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }

      // Get member counts for each team
      const teamsWithCounts = await Promise.all(
        (data || []).map(async (team) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id);

          return {
            ...team,
            member_count: count || 0
          };
        })
      );

      setTeams(teamsWithCounts);
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (name: string, managerId?: string) => {
    if (!user) throw new Error('No user logged in');

    try {
      // Generate a unique invite code
      const inviteCode = `team-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

      const { data, error } = await supabase
        .from('teams')
        .insert({
          name,
          manager_id: managerId,
          tenant_id: user.tenant_id,
          invite_code: inviteCode
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating team:', error);
        throw error;
      }
      
      await fetchTeams(); // Refresh teams list
      return data;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  };

  const updateTeam = async (teamId: string, updates: { name?: string; manager_id?: string }) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId);

      if (error) {
        console.error('Error updating team:', error);
        throw error;
      }
      
      await fetchTeams(); // Refresh teams list
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      // First, remove team assignments from profiles
      await supabase
        .from('profiles')
        .update({ team_id: null })
        .eq('team_id', teamId);

      // Then delete the team
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) {
        console.error('Error deleting team:', error);
        throw error;
      }
      
      await fetchTeams(); // Refresh teams list
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  };

  const assignEmployeeToTeam = async (employeeId: string, teamId: string | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ team_id: teamId })
        .eq('id', employeeId);

      if (error) {
        console.error('Error assigning employee to team:', error);
        throw error;
      }
      
      await fetchTeams(); // Refresh teams list
    } catch (error) {
      console.error('Error assigning employee to team:', error);
      throw error;
    }
  };

  const generateInviteLink = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team?.invite_code) return null;
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/join-team/${team.invite_code}`;
  };

  const getTeamByInviteCode = async (inviteCode: string) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting team by invite code:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user && user.role === 'HR_ADMIN') {
      fetchTeams();
    }
  }, [user]);

  return {
    teams,
    loading,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    assignEmployeeToTeam,
    generateInviteLink,
    getTeamByInviteCode
  };
};
