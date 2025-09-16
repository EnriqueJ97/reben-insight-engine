import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EvaluationCampaign {
  id: string;
  name: string;
  description: string;
  status: string;
  launch_date: string;
  anonymous: boolean;
  total_participants: number;
  completed_responses: number;
  response_rate: number;
  template_data: any;
}

export interface EvaluationAnalytics {
  id: string;
  campaign_id: string;
  instrument_id: string;
  dimension_id?: string;
  team_id?: string;
  metric_key: string;
  score: number;
  percentile?: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  sample_size: number;
  confidence_interval?: {
    low: number;
    high: number;
  };
  benchmark_data?: any;
  calculated_at: string;
}

export interface EvaluationNotification {
  id: string;
  campaign_id: string;
  user_id: string;
  notification_type: 'invitation' | 'reminder' | 'completion';
  status: 'pending' | 'sent' | 'opened' | 'failed';
  sent_at?: string;
  opened_at?: string;
  metadata: any;
}

export const useEvaluations = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<EvaluationCampaign[]>([]);
  const [analytics, setAnalytics] = useState<EvaluationAnalytics[]>([]);
  const [notifications, setNotifications] = useState<EvaluationNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('evaluation_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const campaignsWithRates = data.map(campaign => ({
        ...campaign,
        response_rate: campaign.total_participants > 0 
          ? (campaign.completed_responses / campaign.total_participants) * 100 
          : 0
      }));

      setCampaigns(campaignsWithRates);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to fetch campaigns');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('evaluation_analytics')
        .select('*')
        .order('calculated_at', { ascending: false });

      if (error) throw error;
      setAnalytics(data as any || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch analytics');
    }
  };

  const fetchNotifications = async () => {
    if (user?.role !== 'HR_ADMIN') return;

    try {
      const { data, error } = await supabase
        .from('evaluation_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setNotifications(data as any || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    }
  };

  const getMyEvaluations = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('evaluation_campaigns')
        .select('*')
        .eq('status', 'active')
        .not('id', 'in', `(
          SELECT campaign_id FROM evaluation_responses 
          WHERE user_id = '${user.id}' AND completion_status = 'completed'
        )`);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching my evaluations:', err);
      return [];
    }
  };

  const getEvaluationResponse = async (campaignId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('evaluation_responses')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching evaluation response:', err);
      return null;
    }
  };

  const submitEvaluationResponse = async (
    campaignId: string,
    responses: Record<string, number>,
    anonymous: boolean = false
  ) => {
    if (!user) throw new Error('User not authenticated');

    const alias = anonymous ? 
      await generateAnonymousAlias(campaignId) : undefined;

    const { data, error } = await supabase
      .from('evaluation_responses')
      .insert({
        tenant_id: user.tenant_id,
        campaign_id: campaignId,
        user_id: anonymous ? null : user.id,
        user_alias: alias,
        responses: responses,
        completion_status: 'completed',
        completed_at: new Date().toISOString(),
        time_spent_minutes: 5 // This would be calculated properly in real implementation
      });

    if (error) throw error;

    // Update campaign completed responses
    await supabase
      .from('evaluation_campaigns')
      .update({ 
        completed_responses: campaigns.find(c => c.id === campaignId)?.completed_responses! + 1 
      })
      .eq('id', campaignId);

    // Trigger analytics calculation
    await supabase.functions.invoke('calculate-evaluation-analytics', {
      body: { campaignId }
    });

    return data;
  };

  const generateAnonymousAlias = async (campaignId: string) => {
    const { data, error } = await supabase.rpc('generate_evaluation_alias', {
      campaign_uuid: campaignId,
      user_uuid: user?.id
    });
    if (error) throw error;
    return data;
  };

  const getAnalyticsByInstrument = (instrumentId: string) => {
    return analytics.filter(a => a.instrument_id === instrumentId);
  };

  const getAnalyticsByTeam = (teamId: string) => {
    return analytics.filter(a => a.team_id === teamId);
  };

  const getOrganizationalAnalytics = () => {
    return analytics.filter(a => a.team_id === null); // Organization-level analytics
  };

  const getCampaignAnalytics = (campaignId: string) => {
    return analytics.filter(a => a.campaign_id === campaignId);
  };

  const getRiskAssessment = () => {
    const orgAnalytics = getOrganizationalAnalytics();
    const riskCounts = {
      critical: orgAnalytics.filter(a => a.risk_level === 'critical').length,
      high: orgAnalytics.filter(a => a.risk_level === 'high').length,
      medium: orgAnalytics.filter(a => a.risk_level === 'medium').length,
      low: orgAnalytics.filter(a => a.risk_level === 'low').length
    };

    const totalRisks = Object.values(riskCounts).reduce((sum, count) => sum + count, 0);
    const overallRisk = totalRisks > 0 ? 
      (riskCounts.critical * 4 + riskCounts.high * 3 + riskCounts.medium * 2 + riskCounts.low * 1) / totalRisks
      : 0;

    return {
      riskCounts,
      overallRisk,
      riskLevel: overallRisk >= 3 ? 'critical' : 
                 overallRisk >= 2.5 ? 'high' :
                 overallRisk >= 2 ? 'medium' : 'low'
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCampaigns(),
        fetchAnalytics(),
        fetchNotifications()
      ]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  return {
    campaigns,
    analytics,
    notifications,
    loading,
    error,
    
    // Methods
    fetchCampaigns,
    fetchAnalytics,
    getMyEvaluations,
    getEvaluationResponse,
    submitEvaluationResponse,
    getAnalyticsByInstrument,
    getAnalyticsByTeam,
    getOrganizationalAnalytics,
    getCampaignAnalytics,
    getRiskAssessment,
    
    // Computed values
    activeCampaigns: campaigns.filter(c => c.status === 'active'),
    completedCampaigns: campaigns.filter(c => c.status === 'completed'),
    pendingNotifications: notifications.filter(n => n.status === 'pending')
  };
};