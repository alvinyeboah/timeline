export interface UserProfile {
  name: string;
  age: number;
  income: number;
  province: string;
  taxBracket: number;
  monthlyExpenses: number;
  totalDebt: number;
  debtPriority: 'minimums_first' | 'debt_first' | 'goals_first';
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
}

export interface ProjectionPoint {
  year: number;
  baseNetWorth: number;
  adjustedNetWorth: number;
}
