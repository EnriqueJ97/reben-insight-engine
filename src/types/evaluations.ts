export interface ScientificInstrument {
  id: string;
  name: string;
  abbreviation: string;
  category: 'burnout' | 'engagement' | 'satisfaction' | 'climate' | 'leadership' | 'wellbeing' | 'inclusion' | 'flexibility' | 'commitment';
  authors: string;
  yearDeveloped: number;
  totalItems: number;
  dimensions: InstrumentDimension[];
  description: string;
  estimatedMinutes: number;
  validated: boolean;
  benchmarksAvailable: boolean;
  scaleType: 'likert_5' | 'likert_7' | 'frequency' | 'agreement' | 'custom';
  scaleDescription: string;
  references: string[];  
}

export interface InstrumentDimension {
  id: string;
  name: string;
  items: number;
  description: string;
  itemIds: string[];
}

export interface InstrumentItem {
  id: string;
  instrumentId: string;
  dimensionId: string;
  text: string;
  reverseScored: boolean;
  order: number;
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  estimatedMinutes: number;
  totalItems: number;
  components: EvaluationComponent[];
  configuration: EvaluationConfiguration;
}

export interface EvaluationComponent {
  id: string;
  type: 'instrument' | 'dimension' | 'custom_item';
  instrumentId?: string;
  dimensionId?: string;
  customItems?: InstrumentItem[];
  order: number;
  required: boolean;
}

export interface EvaluationConfiguration {
  anonymous: boolean;
  frequency: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  scheduling: {
    startDate?: string;
    endDate?: string;
    time?: string;
    daysOfWeek?: number[];
  };
  targeting: {
    allEmployees?: boolean;
    specificTeams?: string[];
    specificRoles?: string[];
    specificUsers?: string[];
  };
  gamification: {
    enabled: boolean;
    progressBar: boolean;
    motivationalMessages: boolean;
    rewards: boolean;
  };
  notifications: {
    email: boolean;
    slack: boolean;
    teams: boolean;
    inApp: boolean;
  };
}

export interface EvaluationCampaign {
  id: string;
  templateId: string;
  name: string;
  description: string;
  tenantId: string;
  createdBy: string;
  createdAt: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  launchedAt?: string;
  completedAt?: string;
  participants: number;
  responses: number;
  responseRate: number;
  configuration: EvaluationConfiguration;
}

export interface EvaluationResponse {
  id: string;
  campaignId: string;
  userId: string;
  completedAt: string;
  timeSpent: number;
  responses: ItemResponse[];
  metadata: {
    deviceType: string;
    platform: string;
    startedAt: string;
    ipAddress?: string;
  };
}

export interface ItemResponse {
  itemId: string;
  instrumentId: string;
  dimensionId: string;
  value: number;
  responseTime: number;
}

export interface EvaluationResults {
  campaignId: string;
  instrument: string;
  dimension: string;
  score: number;
  percentile?: number;
  benchmark?: BenchmarkResult;
  interpretation: string;
  participants: number;
  reliability: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface BenchmarkResult {
  score: number;
  percentile: number;
  industry: string;
  companySize: string;
  sampleSize: number;
  normativeGroup: string;
  interpretation: 'very_low' | 'low' | 'average' | 'high' | 'very_high';
}

export interface EvaluationAnalytics {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalResponses: number;
    averageResponseRate: number;
    averageCompletionTime: number;
  };
  trends: {
    period: string;
    burnoutTrend: number[];
    engagementTrend: number[];
    satisfactionTrend: number[];
    turnoverRiskTrend: number[];
  };
  riskIndicators: {
    highBurnoutRisk: number;
    highTurnoverRisk: number;
    lowEngagement: number;
    interventionsTriggered: number;
  };
  correlations: {
    burnoutTurnover: number;
    engagementSatisfaction: number;
    leadershipEngagement: number;
    flexibilityWellbeing: number;
  };
}