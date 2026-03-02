import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Goal, ChecklistItem } from '@/lib/types';

const CURRENT_YEAR = new Date().getFullYear();

const SARAH_DEMO_GOALS: Goal[] = [
  { id: 'g1', name: 'Emergency Fund',  type: 'custom',      targetYear: CURRENT_YEAR,     estimatedCost: 15000,   monthlyContributionNeeded: 1250, rawInput: '', createdAt: new Date().toISOString() },
  { id: 'g2', name: 'Europe Trip',     type: 'travel',      targetYear: CURRENT_YEAR + 1, estimatedCost: 12000,   monthlyContributionNeeded: 500,  rawInput: '', createdAt: new Date().toISOString() },
  { id: 'g3', name: 'MBA Program',     type: 'education',   targetYear: CURRENT_YEAR + 2, estimatedCost: 85000,   monthlyContributionNeeded: 2361, rawInput: '', createdAt: new Date().toISOString() },
  { id: 'g4', name: 'Buy Condo',       type: 'real_estate', targetYear: CURRENT_YEAR + 4, estimatedCost: 680000,  monthlyContributionNeeded: 3778, rawInput: '', location: 'Toronto', createdAt: new Date().toISOString() },
  { id: 'g5', name: 'Career Switch',   type: 'career',      targetYear: CURRENT_YEAR + 6, estimatedCost: 25000,   monthlyContributionNeeded: 417,  rawInput: '', createdAt: new Date().toISOString() },
  { id: 'g6', name: 'Start a Studio',  type: 'custom',      targetYear: CURRENT_YEAR + 10, estimatedCost: 60000,  monthlyContributionNeeded: 417,  rawInput: '', createdAt: new Date().toISOString() },
  { id: 'g7', name: 'Retire at 55',    type: 'retirement',  targetYear: CURRENT_YEAR + 26, estimatedCost: 1500000, monthlyContributionNeeded: 2500, rawInput: '', createdAt: new Date().toISOString() },
];

interface GoalsState {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoalYear: (id: string, newYear: number) => void;
  deleteGoal: (id: string) => void;
  clearGoals: () => void;
  updateGoalNotes: (id: string, notes: string) => void;
  updateGoalChecklist: (id: string, checklist: ChecklistItem[]) => void;
  toggleChecklistItem: (goalId: string, itemId: string) => void;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      goals: SARAH_DEMO_GOALS,
      addGoal: (goal) =>
        set((s) => ({ goals: [...s.goals, goal] })),
      updateGoalYear: (id, newYear) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id
              ? { ...g, targetYear: newYear, previousYear: g.targetYear }
              : g
          ),
        })),
      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      clearGoals: () => set({ goals: [] }),
      updateGoalNotes: (id, notes) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, notes } : g)),
        })),
      updateGoalChecklist: (id, checklist) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, checklist } : g)),
        })),
      toggleChecklistItem: (goalId, itemId) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  checklist: (g.checklist ?? []).map((item) =>
                    item.id === itemId ? { ...item, done: !item.done } : item
                  ),
                }
              : g
          ),
        })),
    }),
    {
      name: 'timeline_goals',
      onRehydrateStorage: () => (state) => {
        // Seed demo goals if store hydrates empty
        if (state && state.goals.length === 0) {
          state.goals = SARAH_DEMO_GOALS;
        }
      },
    }
  )
);
