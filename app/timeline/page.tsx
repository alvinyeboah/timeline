'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Goal, ProjectionPoint } from '@/lib/types';
import { ACCOUNTS, SARAH, NET_WORTH } from '@/lib/mock-data';
import { getGoals, updateGoalYear, deleteGoal } from '@/lib/goals-storage';
import { generateProjection } from '@/lib/projections';
import TimelineCanvas from '@/components/timeline/TimelineCanvas';
import AIPanel from '@/components/ai/AIPanel';
import NetWorthDisplay from '@/components/ui/NetWorthDisplay';
import GoalInput from '@/components/ai/GoalInput';

export default function TimelinePage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projection, setProjection] = useState<ProjectionPoint[]>([]);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load goals and compute initial projection
  useEffect(() => {
    const stored = getGoals();
    setGoals(stored);
    setProjection(generateProjection(SARAH, ACCOUNTS, stored));
    if (stored.length > 0) setActiveGoal(stored[stored.length - 1]);
    setLoaded(true);
  }, []);

  const recalculate = useCallback((updatedGoals: Goal[]) => {
    setProjection(generateProjection(SARAH, ACCOUNTS, updatedGoals));
  }, []);

  const handleGoalAdded = useCallback(
    (goal: Goal) => {
      setGoals((prev) => {
        const next = [...prev, goal];
        recalculate(next);
        return next;
      });
      setActiveGoal(goal);
    },
    [recalculate]
  );

  const handleGoalDrop = useCallback(
    (id: string, newYear: number) => {
      updateGoalYear(id, newYear);
      const updated = getGoals();
      setGoals(updated);
      recalculate(updated);
      const updatedGoal = updated.find((g) => g.id === id);
      if (updatedGoal) setActiveGoal({ ...updatedGoal });
    },
    [recalculate]
  );

  const handleGoalClick = useCallback((goal: Goal) => {
    setActiveGoal((prev) => (prev?.id === goal.id ? null : goal));
  }, []);

  const handleGoalDelete = useCallback(
    (id: string) => {
      deleteGoal(id);
      const updated = getGoals();
      setGoals(updated);
      recalculate(updated);
      setActiveGoal((prev) => (prev?.id === id ? null : prev));
    },
    [recalculate]
  );

  const handleClosePanel = useCallback(() => {
    setActiveGoal(null);
  }, []);

  return (
    <div className="h-screen bg-[#0D0D0D] flex flex-col overflow-hidden relative">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-5 pt-12 pb-3 shrink-0 border-b border-[#1A1A1A]"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#00C896]/20 rounded-full flex items-center justify-center">
            <span className="text-[#00C896] font-bold text-sm">SC</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{SARAH.name.split(' ')[0]}</p>
            <p className="text-[#9CA3AF] text-xs">
              {goals.length} goal{goals.length !== 1 ? 's' : ''} on your timeline
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[#9CA3AF] text-xs">Net Worth</p>
          <NetWorthDisplay value={NET_WORTH} className="text-[#E8B84B] font-bold text-lg" />
        </div>
      </motion.div>

      {/* Add goal bar */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0">
        <p className="text-[#9CA3AF] text-xs uppercase tracking-widest">
          {new Date().getFullYear()} → 2055
        </p>
        <GoalInput onGoalAdded={handleGoalAdded} />
      </div>

      {/* Timeline canvas — always visible once loaded */}
      {loaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col overflow-hidden relative"
        >
          <TimelineCanvas
            goals={goals}
            projection={projection}
            onGoalDrop={handleGoalDrop}
            onGoalClick={handleGoalClick}
            onGoalDelete={handleGoalDelete}
            activeGoalId={activeGoal?.id ?? null}
          />

          {/* Empty-state hint overlaid inside canvas */}
          {goals.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ top: '160px' }} // below chart
            >
              <p className="text-[#4B5563] text-sm text-center px-8">
                Add your first goal above — your timeline will appear here
              </p>
              <button
                onClick={() => router.push('/what-matters')}
                className="mt-3 px-5 py-2.5 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-xl text-sm pointer-events-auto active:scale-[0.97] transition-all"
              >
                Add a goal →
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* AI Impact Panel */}
      <AIPanel goal={activeGoal} onClose={handleClosePanel} />
    </div>
  );
}
