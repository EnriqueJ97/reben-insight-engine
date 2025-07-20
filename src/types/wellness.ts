
export interface CheckIn {
  id: string;
  user_id: string;
  question_id: string;
  score: number;
  timestamp: string;
  question_text: string;
  category: 'burnout' | 'turnover' | 'satisfaction' | 'extra';
}

export interface WellnessAlert {
  id: string;
  user_id: string;
  type: 'ALERTA_BURNOUT_ALTO' | 'ALERTA_CINISMO' | 'ALERTA_BAJA_AUTOEFICACIA' | 'ALERTA_FUGA_TALENTO' | 'ALERTA_INSATISFACCION';
  severity: 'low' | 'medium' | 'high';
  message: string;
  created_at: string;
  acknowledged: boolean;
}

export interface WellnessMetrics {
  overall_score: number;
  burnout_risk: number;
  turnover_risk: number;
  satisfaction_score: number;
  trend: 'improving' | 'stable' | 'declining';
  alerts_count: number;
}

export interface TeamMetrics {
  team_id: string;
  team_name: string;
  member_count: number;
  avg_wellness: number;
  high_risk_members: number;
  recent_alerts: WellnessAlert[];
}

export interface Question {
  id: string;
  text: string;
  category: 'burnout' | 'turnover' | 'satisfaction' | 'extra';
  subcategory: string;
  scale_description: string;
}
