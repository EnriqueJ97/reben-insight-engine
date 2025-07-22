
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

      if (error) throw error;

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
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (name: string, managerId?: string) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name,
          manager_id: managerId,
          tenant_id: user.tenant_id
        })
        .select()
        .single();

      if (error) throw error;
      
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

      if (error) throw error;
      
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

      if (error) throw error;
      
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

      if (error) throw error;
      
      await fetchTeams(); // Refresh teams list
    } catch (error) {
      console.error('Error assigning employee to team:', error);
      throw error;
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
    assignEmployeeToTeam
  };
};
