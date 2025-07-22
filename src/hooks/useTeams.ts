
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Team {
  id: string;
  name: string;
  manager_id?: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  invite_code?: string | null;
  manager?: {
    id: string;
    full_name?: string | null;
    email: string;
  } | null;
  member_count?: number;
}

interface TeamInsert {
  name: string;
  manager_id?: string | null;
  tenant_id: string;
  invite_code: string;
}

interface TeamUpdate {
  name?: string;
  manager_id?: string | null;
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
          } as Team;
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

      const teamData: TeamInsert = {
        name,
        manager_id: managerId || null,
        tenant_id: user.tenant_id,
        invite_code: inviteCode
      };

      const { data, error } = await supabase
        .from('teams')
        .insert(teamData)
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

  const updateTeam = async (teamId: string, updates: TeamUpdate) => {
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

  const generateInviteLink = (teamId: string): string | null => {
    const team = teams.find(t => t.id === teamId);
    if (!team?.invite_code) return null;
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/join-team/${team.invite_code}`;
  };

  const getTeamByInviteCode = async (inviteCode: string): Promise<Team | null> => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('invite_code', inviteCode)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        name: data.name,
        manager_id: data.manager_id,
        tenant_id: data.tenant_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        invite_code: data.invite_code
      };
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
