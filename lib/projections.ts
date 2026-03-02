import { UserProfile, Account, Goal, ProjectionPoint } from './types';
import { CURRENT_YEAR, PROJECTION_END_YEAR } from './mock-data';

const INVESTMENT_GROWTH_RATE = 0.06;
const INCOME_GROWTH_RATE = 0.025;
const INFLATION_RATE = 0.02;

interface ProjectionOverrides {
  income?: number;
  growthRate?: number;
  incomeGrowth?: number;
}

export function generateProjection(
  profile: UserProfile,
  accounts: Account[],
  goals: Goal[],
  overrides?: ProjectionOverrides
): ProjectionPoint[] {
  const startNetWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
  const points: ProjectionPoint[] = [];

  const growthRate = overrides?.growthRate !== undefined ? overrides.growthRate / 100 : INVESTMENT_GROWTH_RATE;
  const incomeGrowth = overrides?.incomeGrowth !== undefined ? overrides.incomeGrowth / 100 : INCOME_GROWTH_RATE;

  let baseNetWorth = startNetWorth;
  let adjustedNetWorth = startNetWorth;
  let hypotheticalNetWorth = overrides ? startNetWorth : undefined;
  let currentIncome = profile.income;
  let hypotheticalIncome = overrides?.income ?? profile.income;
  let currentExpenses = profile.monthlyExpenses * 12;
  const debtPayment = Math.min(profile.totalDebt / 60, 200);

  for (let year = CURRENT_YEAR; year <= PROJECTION_END_YEAR; year++) {
    if (year > CURRENT_YEAR) {
      currentIncome *= 1 + INCOME_GROWTH_RATE;
      currentExpenses *= 1 + INFLATION_RATE;

      const annualSavings = currentIncome * (1 - profile.taxBracket / 100) - currentExpenses - debtPayment * 12;
      const growth = Math.max(baseNetWorth * INVESTMENT_GROWTH_RATE, 0);

      baseNetWorth = baseNetWorth + growth + Math.max(annualSavings, 0);
      adjustedNetWorth = adjustedNetWorth + (adjustedNetWorth > 0 ? adjustedNetWorth * INVESTMENT_GROWTH_RATE : 0) + Math.max(annualSavings, 0);

      if (hypotheticalNetWorth !== undefined) {
        hypotheticalIncome *= 1 + incomeGrowth;
        const hypoExpenses = currentExpenses; // same expenses
        const hypoSavings = hypotheticalIncome * (1 - profile.taxBracket / 100) - hypoExpenses - debtPayment * 12;
        hypotheticalNetWorth = hypotheticalNetWorth + (hypotheticalNetWorth > 0 ? hypotheticalNetWorth * growthRate : 0) + Math.max(hypoSavings, 0);
      }
    }

    // Subtract goal costs in their target year (adjusted only)
    const yearGoals = goals.filter((g) => g.targetYear === year);
    for (const goal of yearGoals) {
      adjustedNetWorth -= goal.estimatedCost;
      if (hypotheticalNetWorth !== undefined) hypotheticalNetWorth -= goal.estimatedCost;
    }

    const point: ProjectionPoint = {
      year,
      baseNetWorth: Math.round(baseNetWorth),
      adjustedNetWorth: Math.round(adjustedNetWorth),
    };
    if (hypotheticalNetWorth !== undefined) {
      point.hypotheticalNetWorth = Math.round(hypotheticalNetWorth);
    }
    points.push(point);
  }

  return points;
}
