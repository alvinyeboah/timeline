'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Goal } from '@/lib/types';
import { useGoalsStore } from '@/store/goals';
import { useProfileStore } from '@/store/profile';
import { ArrowLeftIcon } from '@/components/ui/icons';

const GOAL_TYPE_LABELS: Record<Goal['type'], string> = {
  real_estate: 'Home Purchase',
  career: 'Career Change',
  education: 'Education',
  travel: 'Travel / Sabbatical',
  retirement: 'Retirement',
  custom: 'Custom Goal',
};

const EXAMPLE_PROMPTS = [
  'Buy a condo in Toronto in 5 years',
  'Sabbatical in 2027',
  'Retire at 55',
  'MBA in 2028',
];

const PRIORITY_OPTIONS = [
  { value: 'higher', label: 'Higher than debt', desc: 'Save for this goal first' },
  { value: 'same',   label: 'Same as debt',     desc: 'Balance goal and debt payments' },
  { value: 'lower',  label: 'Lower than debt',  desc: 'Clear debt before saving' },
] as const;

export default function WhatMattersPage() {
  const router = useRouter();
  const addGoal = useGoalsStore((s) => s.addGoal);
  const profile = useProfileStore((s) => s.profile);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedGoal, setParsedGoal] = useState<Goal | null>(null);
  const [priority, setPriority] = useState<'higher' | 'same' | 'lower'>('same');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleParse = async () => {
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
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to parse goal');
      }
      const goal: Goal = await res.json();
      setParsedGoal(goal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!parsedGoal) return;
    addGoal({ ...parsedGoal, priority });
    const hasSeenTutorial = typeof window !== 'undefined' && localStorage.getItem('timeline_tutorial_seen');
    router.push(hasSeenTutorial ? '/timeline' : '/tutorial');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleParse();
  };

  const downPayment = parsedGoal?.type === 'real_estate'
    ? Math.round(parsedGoal.estimatedCost * 0.2)
    : null;

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-center px-6 relative">
      {/* Back button */}
      <button
        onClick={() => parsedGoal ? setParsedGoal(null) : router.back()}
        className="absolute top-10 left-8 w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-colors shadow-sm"
        aria-label="Back"
      >
        <ArrowLeftIcon size={15} strokeWidth={2} />
      </button>

      <AnimatePresence mode="wait">

        {/* ── Step 1: Input ─────────────────────────────────────────────── */}
        {!parsedGoal && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-2xl"
          >
            <h1 className="text-5xl font-bold text-stone-900 text-center mb-3 leading-tight">
              What matters to you?
            </h1>
            <p className="text-stone-500 text-center mb-10 text-lg">
              Tell us in your own words — we&apos;ll figure out the details.
            </p>

            {/* Document-style textarea */}
            <div className="relative bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden mb-4">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="I want to buy a home in Vancouver in 2027 for $800,000"
                rows={5}
                disabled={loading}
                className="w-full px-8 py-7 text-stone-900 text-lg placeholder-stone-300 resize-none focus:outline-none bg-transparent leading-relaxed disabled:opacity-50"
              />
              <div className="flex items-center justify-between px-8 py-3 border-t border-stone-100">
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => { setInput(prompt); textareaRef.current?.focus(); }}
                      disabled={loading}
                      className="px-3 py-1 bg-stone-100 rounded-full text-stone-500 text-xs hover:bg-stone-200 hover:text-stone-700 transition disabled:opacity-40"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <p className="text-stone-300 text-xs shrink-0 ml-4">⌘↵ to submit</p>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-3 text-red-500 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleParse}
              disabled={!input.trim() || loading}
              className="w-full py-4 bg-stone-900 text-white font-semibold rounded-2xl text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-stone-800"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analysing your goal…
                </span>
              ) : (
                'Parse Goal →'
              )}
            </motion.button>

            <p className="text-stone-400 text-xs text-center mt-4">
              Powered by AI · Your data stays private
            </p>
          </motion.div>
        )}

        {/* ── Step 2: Confirmation ─────────────────────────────────────── */}
        {parsedGoal && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-lg"
          >
            <h1 className="text-3xl font-bold text-stone-900 text-center mb-2">
              Looks good?
            </h1>
            <p className="text-stone-500 text-center mb-7">
              We detected the following — adjust anything that&apos;s off.
            </p>

            {/* Detected details card */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-5 shadow-sm">
              <div className="px-5 py-3 border-b border-stone-100 bg-stone-50">
                <p className="text-stone-400 text-xs uppercase tracking-widest">We detected</p>
              </div>
              {[
                { label: 'Type', value: GOAL_TYPE_LABELS[parsedGoal.type] },
                ...(parsedGoal.location ? [{ label: 'Location', value: parsedGoal.location }] : []),
                { label: 'Year', value: String(parsedGoal.targetYear) },
                { label: 'Cost', value: `$${parsedGoal.estimatedCost.toLocaleString('en-CA')}` },
                ...(downPayment ? [{ label: 'Down payment', value: `~$${downPayment.toLocaleString('en-CA')} (estimated)` }] : []),
                { label: 'Monthly needed', value: `$${parsedGoal.monthlyContributionNeeded.toLocaleString('en-CA', { maximumFractionDigits: 0 })}/mo` },
              ].map((row, i, arr) => (
                <div key={row.label} className={`flex justify-between items-center px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-stone-100' : ''}`}>
                  <span className="text-stone-500 text-sm">{row.label}</span>
                  <span className="text-stone-900 text-sm font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Priority — horizontal segmented control */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-5 shadow-sm">
              <p className="text-stone-700 font-semibold text-sm mb-4">Priority vs. Debt</p>
              <div className="flex gap-2">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPriority(option.value)}
                    className={`flex-1 px-3 py-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                      priority === option.value
                        ? 'border-[#00C896] bg-[#00C896]/5 text-stone-900'
                        : 'border-stone-200 text-stone-500 hover:border-stone-300'
                    }`}
                  >
                    <p className="font-semibold">{option.label}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5 font-normal">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              className="w-full py-4 bg-stone-900 text-white font-semibold rounded-2xl text-base transition-all hover:bg-stone-800"
            >
              Add to Timeline →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
