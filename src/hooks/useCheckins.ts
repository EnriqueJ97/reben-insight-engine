import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CheckIn {
  id: string;
  user_id: string;
  mood: number;
  question_id: string;
  response_value: number;
  created_at: string;
}

export interface CheckInStats {
  total: number;
  average_mood: number;
  trend: 'up' | 'down' | 'stable';
  recent_checkins: CheckIn[];
}

export const useCheckins = () => {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCheckins = async (userId?: string) => {
    if (!user && !userId) return;
    
    setLoading(true);
    try {
      const targetUserId = userId || user?.id;
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCheckins(data || []);
    } catch (error) {
      console.error('Error fetching checkins:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCheckin = async (questionId: string, mood: number, responseValue: number) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('checkins')
        .insert({
          user_id: user.id,
          question_id: questionId,
          mood,
          response_value: responseValue
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setCheckins(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating checkin:', error);
      throw error;
    }
  };

  const getCheckinStats = async (userId?: string, days: number = 30): Promise<CheckInStats> => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) throw new Error('No user ID provided');

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const total = data?.length || 0;
      const averageMood = total > 0 
        ? data.reduce((sum, checkin) => sum + checkin.mood, 0) / total 
        : 0;

      // Calculate trend (compare last 7 days vs previous 7 days)
      const lastWeek = data?.filter(c => {
        const checkinDate = new Date(c.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return checkinDate >= weekAgo;
      }) || [];

      const previousWeek = data?.filter(c => {
        const checkinDate = new Date(c.created_at);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return checkinDate >= twoWeeksAgo && checkinDate < weekAgo;
      }) || [];

      const lastWeekAvg = lastWeek.length > 0 
        ? lastWeek.reduce((sum, c) => sum + c.mood, 0) / lastWeek.length 
        : 0;
      const previousWeekAvg = previousWeek.length > 0 
        ? previousWeek.reduce((sum, c) => sum + c.mood, 0) / previousWeek.length 
        : 0;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (lastWeekAvg > previousWeekAvg + 0.2) trend = 'up';
      else if (lastWeekAvg < previousWeekAvg - 0.2) trend = 'down';

      return {
        total,
        average_mood: averageMood,
        trend,
        recent_checkins: data?.slice(0, 10) || []
      };
    } catch (error) {
      console.error('Error getting checkin stats:', error);
      return {
        total: 0,
        average_mood: 0,
        trend: 'stable',
        recent_checkins: []
      };
    }
  };

  const getTeamCheckinStats = async (teamId?: string, days: number = 30) => {
    if (!user || (user.role !== 'MANAGER' && user.role !== 'HR_ADMIN')) {
      throw new Error('Unauthorized');
    }

    try {
      let query = supabase
        .from('checkins')
        .select(`
          *,
          profiles!inner (
            id,
            full_name,
            email,
            role,
            team_id,
            tenant_id
          )
        `)
        .eq('profiles.tenant_id', user.tenant_id);

      if (teamId && user.role === 'MANAGER') {
        query = query.eq('profiles.team_id', teamId);
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query = query.gte('created_at', startDate.toISOString());

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting team checkin stats:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      fetchCheckins();
    }
  }, [user]);

  return {
    checkins,
    loading,
    fetchCheckins,
    createCheckin,
    getCheckinStats,
    getTeamCheckinStats
  };
};