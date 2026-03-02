'use client';

import { useState } from 'react';
import { Goal } from '@/lib/types';
import { useGoalsStore } from '@/store/goals';
import { useProfileStore } from '@/store/profile';

interface Props {
  onGoalAdded: (goal: Goal) => void;
}

export default function GoalInput({ onGoalAdded }: Props) {
  const addGoal = useGoalsStore((s) => s.addGoal);
  const profile = useProfileStore((s) => s.profile);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to parse goal');
      }
      const goal: Goal = await res.json();
      addGoal(goal);
      onGoalAdded(goal);
      setInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Add a goal…"
        disabled={loading}
        className="w-56 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]/50 transition disabled:opacity-50"
      />
      {loading && (
        <span className="w-4 h-4 border-2 border-stone-300 border-t-[#00C896] rounded-full animate-spin" />
      )}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
