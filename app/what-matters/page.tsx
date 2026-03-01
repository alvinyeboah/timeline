'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { saveGoal } from '@/lib/goals-storage';
import { Goal } from '@/lib/types';
import { ArrowLeftIcon } from '@/components/ui/icons';

export default function WhatMattersPage() {
  const router = useRouter();
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
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to parse goal');
      }

      const goal: Goal = await res.json();
      saveGoal(goal);

      // First time → tutorial, subsequent → timeline
      const hasSeenTutorial = typeof window !== 'undefined' && localStorage.getItem('timeline_tutorial_seen');
      router.push(hasSeenTutorial ? '/timeline' : '/tutorial');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6 relative">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-14 left-5 w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
        aria-label="Back"
      >
        <ArrowLeftIcon size={15} strokeWidth={2} />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
            placeholder="I want to buy a house in downtown Toronto in 5 years..."
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
          onClick={handleSubmit}
          disabled={!input.trim() || loading}
          className="w-full mt-4 py-4 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-2xl text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all relative overflow-hidden"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-[#0D0D0D]/30 border-t-[#0D0D0D] rounded-full animate-spin" />
              Analysing your goal...
            </span>
          ) : (
            'Show me the impact →'
          )}
        </motion.button>

        <p className="text-[#4B5563] text-xs text-center mt-4">
          Powered by AI · Your data stays private
        </p>

        {/* Example prompts */}
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
    </div>
  );
}
