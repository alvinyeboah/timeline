export interface UserProfile {
  name: string;
  age: number;
  income: number;
  province: string;
  taxBracket: number;
  monthlyExpenses: number;
  totalDebt: number;
  debtPriority: 'minimums_first' | 'debt_first' | 'goals_first' | 'ignore' | 'custom';
  monthlySavingsCapacity: number;
}

export interface Account {
  id: string;
  institution: 'Wealthsimple' | 'RBC';
  type: 'invest' | 'spend' | 'chequing';
  name: string;
  balance: number;
  connected: boolean;
}

export interface ChecklistItem {
  id: string;
  horizon: 'this_month' | 'next_quarter' | 'this_year' | 'target_year';
  text: string;
  done: boolean;
}

export interface Goal {
  id: string;
  name: string;
  type: 'real_estate' | 'career' | 'education' | 'travel' | 'retirement' | 'custom';
  targetYear: number;
  estimatedCost: number;
  monthlyContributionNeeded: number;
  rawInput: string;
  location?: string;
  priority?: 'higher' | 'same' | 'lower';
  aiAnalysis?: string;
  createdAt: string;
  notes?: string;
  checklist?: ChecklistItem[];
  previousYear?: number;
}

export interface ProjectionPoint {
  year: number;
  baseNetWorth: number;
  adjustedNetWorth: number;
  hypotheticalNetWorth?: number;
}
