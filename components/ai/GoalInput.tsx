'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Goal } from '@/lib/types';
import { useGoalsStore } from '@/store/goals';
import { PlusIcon, XIcon } from '@/components/ui/icons';

interface Props {
  onGoalAdded: (goal: Goal) => void;
}

export default function GoalInput({ onGoalAdded }: Props) {
  const addGoal = useGoalsStore((s) => s.addGoal);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/parse-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to parse goal');
      }
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

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-xl text-xs hover:bg-[#00B386] active:scale-[0.97] transition-all"
      >
        <PlusIcon size={12} strokeWidth={2.5} />
        Add Goal
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      <input
        autoFocus
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Describe a goal…"
        disabled={loading}
        className="w-48 md:w-64 px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white text-xs placeholder-[#4B5563] focus:outline-none focus:border-[#00C896]/50 transition-colors disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={!input.trim() || loading}
        className="px-3 py-2 bg-[#00C896] text-[#0D0D0D] font-bold rounded-xl text-xs disabled:opacity-40 transition-all"
      >
        {loading ? '…' : '→'}
      </button>
      <button
        onClick={() => { setExpanded(false); setError(''); }}
        className="w-7 h-7 rounded-lg border border-[#2A2A2A] flex items-center justify-center text-[#6B7280] hover:text-white transition-colors"
      >
        <XIcon size={12} strokeWidth={2} />
      </button>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </motion.div>
  );
}
