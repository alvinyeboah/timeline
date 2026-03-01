import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Goal } from '@/lib/types';

interface GoalsState {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoalYear: (id: string, newYear: number) => void;
  deleteGoal: (id: string) => void;
  clearGoals: () => void;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      goals: [],
      addGoal: (goal) =>
        set((s) => ({ goals: [...s.goals, goal] })),
      updateGoalYear: (id, newYear) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, targetYear: newYear } : g)),
        })),
      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      clearGoals: () => set({ goals: [] }),
    }),
    { name: 'timeline_goals' }
  )
);
