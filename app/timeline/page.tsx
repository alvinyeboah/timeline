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

function AddGoalButton({ onGoalAdded }: { onGoalAdded: (g: Goal) => void }) {
  const addGoal = useGoalsStore((s) => s.addGoal);
  const profile = useProfileStore((s) => s.profile);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExpand = () => {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/parse-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, profile }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const goal: Goal = await res.json();
      addGoal(goal);
      onGoalAdded(goal);
      setInput('');
      setExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') { setExpanded(false); setInput(''); setError(''); }
  };

  const handleClose = () => { setExpanded(false); setInput(''); setError(''); };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.button
            key="pill"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
            onClick={handleExpand}
            className="group flex items-center gap-2.5 px-5 py-2.5 bg-white border border-stone-200 rounded-full shadow-sm hover:shadow-md hover:border-stone-300 active:scale-[0.97] transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-stone-900 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold leading-none" style={{ marginTop: '-1px' }}>+</span>
            </div>
            <span className="text-stone-600 text-sm font-medium group-hover:text-stone-900 transition-colors">
              Add a goal
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, width: 300, scale: 0.96 }}
            animate={{ opacity: 1, width: 500, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="flex gap-2 bg-white border border-stone-200 rounded-2xl shadow-lg p-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buy a house in 5 years…"
              disabled={loading}
              className="flex-1 px-3 py-2 text-stone-900 text-sm placeholder-stone-400 focus:outline-none bg-transparent"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
              className="px-4 py-2 bg-stone-900 text-white font-semibold rounded-xl text-sm hover:bg-stone-800 disabled:opacity-40 transition flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : '→'}
            </button>
            <button
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-700 transition rounded-xl hover:bg-stone-100 text-lg leading-none"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

export default function TimelinePage() {
  const goals = useGoalsStore((s) => s.goals);
  const updateGoalYear = useGoalsStore((s) => s.updateGoalYear);
  const deleteGoal = useGoalsStore((s) => s.deleteGoal);
  const profile = useProfileStore((s) => s.profile);

  const [projection, setProjection] = useState<ProjectionPoint[]>([]);
  const [hypotheticalProjection, setHypotheticalProjection] = useState<ProjectionPoint[]>([]);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  // Always derive from store so checklist/notes updates are reflected live
  const activeGoal = activeGoalId ? (goals.find((g) => g.id === activeGoalId) ?? null) : null;
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
    setActiveGoalId(goal.id);
    setComparison(null);
  }, []);

  const handleGoalDrop = useCallback(
    (id: string, newYear: number) => {
      const goal = goals.find((g) => g.id === id);
      if (!goal) return;
      const prevYear = goal.targetYear;
      updateGoalYear(id, newYear);
      // activeGoal derives from store; updateGoalYear already saves previousYear there

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
    setActiveGoalId((prev) => {
      if (prev === goal.id) return null;
      setComparison(null);
      return goal.id;
    });
  }, []);

  const handleGoalDelete = useCallback(
    (id: string) => {
      deleteGoal(id);
      setActiveGoalId((prev) => (prev === id ? null : prev));
      setComparison(null);
    },
    [deleteGoal]
  );

  const handleClosePanel = useCallback(() => {
    setActiveGoalId(null);
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

        {/* Right: Reality/Possibility toggle + net worth */}
        <div className="flex items-center gap-4 shrink-0 ml-auto">
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

          {/* Timeline canvas (chart + strip) — relative so the floating button can overlay it */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-1 flex flex-col overflow-hidden relative"
          >
            <TimelineCanvas
              goals={goals}
              projection={chartData}
              onGoalDrop={handleGoalDrop}
              onGoalClick={handleGoalClick}
              onGoalDelete={handleGoalDelete}
              activeGoalId={activeGoalId}
              showHypothetical={viewMode === 'possibility' && hypotheticalProjection.length > 0}
            />

            {/* Floating "Add a goal" button — always visible, positioned at top-center of canvas */}
            {goals.length > 0 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="pointer-events-auto">
                  <AddGoalButton onGoalAdded={handleGoalAdded} />
                </div>
              </div>
            )}
          </motion.div>

          {/* Empty state — shown when no goals */}
          {goals.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm px-12 py-10 text-center max-w-md pointer-events-auto">
                <p className="text-stone-400 text-xs uppercase tracking-widest mb-3">Get started</p>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">Add your first goal</h2>
                <p className="text-stone-500 text-sm leading-relaxed mb-7">
                  Describe it in plain English — &ldquo;buy a house in 5 years&rdquo; or &ldquo;retire at 55&rdquo; — and we&apos;ll translate it into a financial plan.
                </p>
                <AddGoalButton onGoalAdded={handleGoalAdded} />
              </div>
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
