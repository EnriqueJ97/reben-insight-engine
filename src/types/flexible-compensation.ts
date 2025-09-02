export interface Benefit {
  id: string;
  name: string;
  category: 'comida' | 'transporte' | 'salud' | 'guarderia' | 'formacion' | 'tech' | 'wellness';
  description: string;
  icon: string;
  monthlyPrice: number;
  taxSaving: number; // percentage
  maxLimit?: number;
  requiresApproval: boolean;
  isActive: boolean;
}

export interface BenefitCategory {
  id: string;
  name: string;
  maxPercentage: number; // max percentage of gross salary
  color: string;
  icon: string;
}

export interface FlexPlan {
  id: string;
  name: string;
  description: string;
  targetGroup: string;
  maxFlexPercentage: number; // max percentage of gross salary
  availableBenefits: string[]; // benefit IDs
  isActive: boolean;
}

export interface EmployeeBenefitSelection {
  id: string;
  employeeId: string;
  benefitId: string;
  monthlyAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  startDate: Date;
  endDate?: Date;
}

export interface EmployeeSalaryInfo {
  employeeId: string;
  grossSalary: number;
  currentNetSalary: number;
  flexibleLimit: number;
  currentFlexibleUsed: number;
  estimatedNetWithBenefits: number;
  taxSavingPercentage: number;
}

export interface BenefitAnalytics {
  benefitId: string;
  adoptionRate: number; // percentage
  totalCost: number;
  averageSaving: number;
  impactOnMotivation: number;
  impactOnRetention: number;
  impactOnBurnout: number;
}

export interface FlexCompensationConfig {
  id: string;
  tenantId: string;
  maxFlexPercentage: number;
  selectionWindows: {
    startDay: number;
    endDay: number;
  };
  benefits: Benefit[];
  categories: BenefitCategory[];
  plans: FlexPlan[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}