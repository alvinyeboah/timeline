'use client';

import { useState } from 'react';
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

export default function WhatMattersPage() {
  const router = useRouter();
  const addGoal = useGoalsStore((s) => s.addGoal);
  const profile = useProfileStore((s) => s.profile);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Confirmation step
  const [parsedGoal, setParsedGoal] = useState<Goal | null>(null);
  const [priority, setPriority] = useState<'higher' | 'same' | 'lower'>('same');

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
    const finalGoal = { ...parsedGoal, priority };
    addGoal(finalGoal);
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
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6 relative">
      <button
        onClick={() => parsedGoal ? setParsedGoal(null) : router.back()}
        className="absolute top-14 left-5 w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
        aria-label="Back"
      >
        <ArrowLeftIcon size={15} strokeWidth={2} />
      </button>

      <AnimatePresence mode="wait">

        {/* ── Step 1: Input ───────────────────────────────────────────────── */}
        {!parsedGoal && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-lg"
          >
            <h1 className="text-4xl font-bold text-white text-center mb-3">
              What matters to you?
            </h1>
            <p className="text-[#9CA3AF] text-center mb-10 text-lg">
              Tell us in your own words — we&apos;ll figure out the details.
            </p>

            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="I want to buy a home in Vancouver in 2027 for $800,000"
                rows={5}
                disabled={loading}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 text-white placeholder-[#4B5563] text-base resize-none focus:outline-none focus:border-[#00C896]/50 transition-colors disabled:opacity-50"
              />
              <p className="absolute bottom-3 right-4 text-[#4B5563] text-xs">⌘↵ to submit</p>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-red-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleParse}
              disabled={!input.trim() || loading}
              className="w-full mt-4 py-4 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-2xl text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0D0D0D]/30 border-t-[#0D0D0D] rounded-full animate-spin" />
                  Analysing your goal...
                </span>
              ) : (
                'Parse Goal →'
              )}
            </motion.button>

            <p className="text-[#4B5563] text-xs text-center mt-4">
              Powered by AI · Your data stays private
            </p>

            <div className="mt-8">
              <p className="text-[#4B5563] text-xs uppercase tracking-widest mb-3">Examples</p>
              <div className="flex flex-col gap-2">
                {[
                  'I want to buy a condo in Toronto in 5 years',
                  'I\'m planning to take a sabbatical in 2027',
                  'I want to retire at 55',
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setInput(example)}
                    disabled={loading}
                    className="text-left px-4 py-3 bg-[#1A1A1A] rounded-xl text-[#9CA3AF] text-sm border border-[#2A2A2A] hover:border-[#00C896]/30 hover:text-white transition-all disabled:opacity-40"
                  >
                    &ldquo;{example}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Confirmation ─────────────────────────────────────────── */}
        {parsedGoal && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-lg"
          >
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Looks good?
            </h1>
            <p className="text-[#9CA3AF] text-center mb-7">
              We detected the following — adjust anything that&apos;s off.
            </p>

            {/* Detected details card */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-[#2A2A2A] bg-[#00C896]/5">
                <p className="text-[#9CA3AF] text-xs uppercase tracking-widest">We detected</p>
              </div>
              {[
                { label: 'Type', value: GOAL_TYPE_LABELS[parsedGoal.type] },
                ...(parsedGoal.location ? [{ label: 'Location', value: parsedGoal.location }] : []),
                { label: 'Year', value: String(parsedGoal.targetYear) },
                { label: 'Cost', value: `$${parsedGoal.estimatedCost.toLocaleString('en-CA')}` },
                ...(downPayment ? [{ label: 'Down payment', value: `~$${downPayment.toLocaleString('en-CA')} (estimated)` }] : []),
                { label: 'Monthly needed', value: `$${parsedGoal.monthlyContributionNeeded.toLocaleString('en-CA', { maximumFractionDigits: 0 })}/mo` },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={`flex justify-between items-center px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-[#2A2A2A]' : ''}`}
                >
                  <span className="text-[#9CA3AF] text-sm">{row.label}</span>
                  <span className="text-white text-sm font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Priority vs Debt */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-5 mb-5">
              <p className="text-white font-semibold text-sm mb-4">Priority vs. Debt</p>
              <div className="flex flex-col gap-2.5">
                {(
                  [
                    { value: 'higher', label: 'Higher than debt', desc: 'Save for this goal first' },
                    { value: 'same',   label: 'Same as debt',     desc: 'Balance goal and debt payments' },
                    { value: 'lower',  label: 'Lower than debt',  desc: 'Clear debt before saving' },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPriority(option.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      priority === option.value
                        ? 'border-[#00C896]/50 bg-[#00C896]/10'
                        : 'border-[#2A2A2A] bg-[#242424] hover:border-[#3A3A3A]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      priority === option.value ? 'border-[#00C896]' : 'border-[#4B5563]'
                    }`}>
                      {priority === option.value && (
                        <div className="w-2 h-2 rounded-full bg-[#00C896]" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${priority === option.value ? 'text-white' : 'text-[#9CA3AF]'}`}>
                        {option.label}
                      </p>
                      <p className="text-[#4B5563] text-xs mt-0.5">{option.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirm}
              className="w-full py-4 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-2xl text-base transition-all"
            >
              Add to Timeline →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
