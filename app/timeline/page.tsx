'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Goal, ProjectionPoint } from '@/lib/types';
import { ACCOUNTS, SARAH, NET_WORTH } from '@/lib/mock-data';
import { UserProfile } from '@/lib/types';
import { generateProjection } from '@/lib/projections';
import { useGoalsStore } from '@/store/goals';
import { useProfileStore } from '@/store/profile';
import TimelineCanvas from '@/components/timeline/TimelineCanvas';
import GoalDetailPanel from '@/components/goals/GoalDetailPanel';
import AssumptionPanel from '@/components/goals/AssumptionPanel';
import GoalInput from '@/components/ai/GoalInput';

interface ComparisonData {
  prevYear: number;
  newYear: number;
  text: string;
}

interface Sliders {
  income: number;
  growthRate: number;
  incomeGrowth: number;
}

export default function TimelinePage() {
  const goals = useGoalsStore((s) => s.goals);
  const updateGoalYear = useGoalsStore((s) => s.updateGoalYear);
  const deleteGoal = useGoalsStore((s) => s.deleteGoal);
  const profile = useProfileStore((s) => s.profile);

  const [projection, setProjection] = useState<ProjectionPoint[]>([]);
  const [hypotheticalProjection, setHypotheticalProjection] = useState<ProjectionPoint[]>([]);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [viewMode, setViewMode] = useState<'reality' | 'possibility'>('reality');
  const [sliders, setSliders] = useState<Sliders>({ income: 0, growthRate: 6, incomeGrowth: 2.5 });
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const comparisonAbortRef = useRef<AbortController | null>(null);

  // Initialize slider income from profile
  useEffect(() => {
    setSliders((s) => ({ ...s, income: profile.income }));
  }, [profile.income]);

  // Recalculate base + adjusted projection
  useEffect(() => {
    const projProfile: UserProfile = {
      ...SARAH,
      income: profile.income,
      monthlyExpenses: profile.monthlyExpenses,
      totalDebt: profile.totalDebt,
      taxBracket: profile.taxBracket,
    };
    const pts = generateProjection(projProfile, ACCOUNTS, goals);
    setProjection(pts);
  }, [goals, profile]);

  // Recalculate hypothetical projection (Possibility mode)
  useEffect(() => {
    if (viewMode !== 'possibility') return;
    const projProfile: UserProfile = {
      ...SARAH,
      income: sliders.income,
      monthlyExpenses: profile.monthlyExpenses,
      totalDebt: profile.totalDebt,
      taxBracket: profile.taxBracket,
    };
    const pts = generateProjection(projProfile, ACCOUNTS, goals, {
      income: sliders.income,
      growthRate: sliders.growthRate,
      incomeGrowth: sliders.incomeGrowth,
    });
    setHypotheticalProjection(pts);
  }, [viewMode, sliders, goals, profile]);

  // Merge hypothetical into projection points for chart
  const chartData: ProjectionPoint[] = projection.map((pt, i) => ({
    ...pt,
    hypotheticalNetWorth: viewMode === 'possibility' ? hypotheticalProjection[i]?.hypotheticalNetWorth : undefined,
  }));

  // Retirement gap (last projection point difference)
  const retirementGap = viewMode === 'possibility' && hypotheticalProjection.length > 0
    ? (hypotheticalProjection[hypotheticalProjection.length - 1]?.hypotheticalNetWorth ?? 0) -
      (projection[projection.length - 1]?.adjustedNetWorth ?? 0)
    : undefined;

  const handleGoalAdded = useCallback((goal: Goal) => {
    setActiveGoal(goal);
    setComparison(null);
  }, []);

  const handleGoalDrop = useCallback(
    (id: string, newYear: number) => {
      const goal = goals.find((g) => g.id === id);
      if (!goal) return;
      const prevYear = goal.targetYear;
      updateGoalYear(id, newYear);
      setActiveGoal((prev) => (prev?.id === id ? { ...prev, targetYear: newYear, previousYear: prevYear } : prev));

      // Stream comparison analysis
      comparisonAbortRef.current?.abort();
      const controller = new AbortController();
      comparisonAbortRef.current = controller;

      setComparison({ prevYear, newYear, text: '' });

      fetch('/api/compare-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: { ...goal, targetYear: newYear }, prevYear, newYear, profile }),
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok || !res.body) return;
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let text = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            text += decoder.decode(value, { stream: true });
            setComparison((prev) => prev ? { ...prev, text } : null);
          }
        })
        .catch(() => {/* silent */});
    },
    [goals, updateGoalYear, profile]
  );

  const handleGoalClick = useCallback((goal: Goal) => {
    setActiveGoal((prev) => {
      if (prev?.id === goal.id) return null;
      setComparison(null);
      return goal;
    });
  }, []);

  const handleGoalDelete = useCallback(
    (id: string) => {
      deleteGoal(id);
      setActiveGoal((prev) => (prev?.id === id ? null : prev));
      setComparison(null);
    },
    [deleteGoal]
  );

  const handleClosePanel = useCallback(() => {
    setActiveGoal(null);
    setComparison(null);
  }, []);

  return (
    <div className="h-screen bg-[#F5F4F0] flex flex-col overflow-hidden">
      {/* ── Top Nav Bar ──────────────────────────────────────────────────────── */}
      <div className="h-14 bg-white border-b border-stone-200 flex items-center px-5 gap-4 shrink-0">
        {/* Left: Avatar + name + count */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-[#00C896]/15 rounded-full flex items-center justify-center shrink-0">
            <span className="text-[#00C896] font-bold text-xs">SC</span>
          </div>
          <div className="min-w-0">
            <span className="text-stone-900 font-semibold text-sm">Sarah Chen</span>
            <span className="ml-2 text-[10px] font-medium text-stone-400 bg-stone-100 rounded-full px-2 py-0.5">
              {goals.length} goal{goals.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Center: Goal input */}
        <div className="flex-1 flex justify-center">
          <GoalInput onGoalAdded={handleGoalAdded} />
        </div>

        {/* Right: Reality/Possibility toggle + net worth */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Segmented pill toggle */}
          <div className="flex bg-stone-100 rounded-xl p-0.5 gap-0.5">
            {(['reality', 'possibility'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  viewMode === mode
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="text-right">
            <p className="text-stone-400 text-[10px] leading-none mb-0.5">Net Worth</p>
            <p className="text-[#D97706] font-bold text-base tabular-nums leading-none">
              ${NET_WORTH.toLocaleString('en-CA')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Area ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left/center content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Possibility assumption sliders */}
          <AnimatePresence>
            {viewMode === 'possibility' && (
              <AssumptionPanel
                profile={profile}
                sliders={sliders}
                onChange={setSliders}
                retirementGap={retirementGap}
              />
            )}
          </AnimatePresence>

          {/* Timeline canvas (chart + strip) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TimelineCanvas
              goals={goals}
              projection={chartData}
              onGoalDrop={handleGoalDrop}
              onGoalClick={handleGoalClick}
              onGoalDelete={handleGoalDelete}
              activeGoalId={activeGoal?.id ?? null}
              showHypothetical={viewMode === 'possibility' && hypotheticalProjection.length > 0}
            />
          </motion.div>

          {/* Empty state */}
          {goals.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ top: '200px' }}
            >
              <p className="text-stone-400 text-sm text-center px-8">
                Add your first goal above — your timeline will appear here
              </p>
            </motion.div>
          )}
        </div>

        {/* ── Right panel ────────────────────────────────────────────────────── */}
        <GoalDetailPanel
          goal={activeGoal}
          onClose={handleClosePanel}
          comparison={comparison}
          onDismissComparison={() => setComparison(null)}
        />
      </div>
    </div>
  );
}
