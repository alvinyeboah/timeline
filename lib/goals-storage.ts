import { Goal } from './types';

const GOALS_KEY = 'timeline_goals';

export function getGoals(): Goal[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    return raw ? (JSON.parse(raw) as Goal[]) : [];
  } catch {
    return [];
  }
}

export function saveGoal(goal: Goal): void {
  if (typeof window === 'undefined') return;
  const goals = getGoals();
  const existing = goals.findIndex((g) => g.id === goal.id);
  if (existing >= 0) {
    goals[existing] = goal;
  } else {
    goals.push(goal);
  }
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function updateGoalYear(id: string, newYear: number): void {
  if (typeof window === 'undefined') return;
  const goals = getGoals();
  const goal = goals.find((g) => g.id === id);
  if (goal) {
    goal.targetYear = newYear;
    // Recalculate monthly contribution based on new year
    const yearsToGoal = Math.max(newYear - new Date().getFullYear(), 1);
    goal.monthlyContributionNeeded = Math.ceil(goal.estimatedCost / (yearsToGoal * 12));
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }
}

export function deleteGoal(id: string): void {
  if (typeof window === 'undefined') return;
  const goals = getGoals().filter((g) => g.id !== id);
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function clearGoals(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GOALS_KEY);
}
