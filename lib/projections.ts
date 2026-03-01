import { UserProfile, Account, Goal, ProjectionPoint } from './types';
import { CURRENT_YEAR, PROJECTION_END_YEAR } from './mock-data';

const INVESTMENT_GROWTH_RATE = 0.06;
const INCOME_GROWTH_RATE = 0.025;
const INFLATION_RATE = 0.02;

export function generateProjection(
  profile: UserProfile,
  accounts: Account[],
  goals: Goal[]
): ProjectionPoint[] {
  const startNetWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
  const points: ProjectionPoint[] = [];

  let baseNetWorth = startNetWorth;
  let adjustedNetWorth = startNetWorth;
  let currentIncome = profile.income;
  let currentExpenses = profile.monthlyExpenses * 12;
  const debtPayment = Math.min(profile.totalDebt / 60, 200); // ~$200/mo minimum

  for (let year = CURRENT_YEAR; year <= PROJECTION_END_YEAR; year++) {
    // Apply growth for years after the first
    if (year > CURRENT_YEAR) {
      currentIncome *= 1 + INCOME_GROWTH_RATE;
      currentExpenses *= 1 + INFLATION_RATE;

      const annualSavings = currentIncome * (1 - profile.taxBracket / 100) - currentExpenses - debtPayment * 12;
      const growth = Math.max(baseNetWorth * INVESTMENT_GROWTH_RATE, 0);

      baseNetWorth = baseNetWorth + growth + Math.max(annualSavings, 0);
      adjustedNetWorth = adjustedNetWorth + (adjustedNetWorth > 0 ? adjustedNetWorth * INVESTMENT_GROWTH_RATE : 0) + Math.max(annualSavings, 0);
    }

    // Subtract goal costs in their target year (adjusted only)
    const yearGoals = goals.filter((g) => g.targetYear === year);
    for (const goal of yearGoals) {
      adjustedNetWorth -= goal.estimatedCost;
    }

    points.push({
      year,
      baseNetWorth: Math.round(baseNetWorth),
      adjustedNetWorth: Math.round(adjustedNetWorth),
    });
  }

  return points;
}
