'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Goal } from '@/lib/types';
import { getGoals } from '@/lib/goals-storage';
import { SARAH } from '@/lib/mock-data';
import { GOAL_ICONS, XIcon } from '@/components/ui/icons';

interface Props {
  goal: Goal | null;
  onClose: () => void;
}

export default function AIPanel({ goal, onClose }: Props) {
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastKeyRef = useRef<string>('');

  useEffect(() => {
    if (!goal) {
      setStreamedText('');
      setIsStreaming(false);
      return;
    }

    const key = `${goal.id}-${goal.targetYear}`;
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStreamedText('');
    setIsStreaming(true);

    const allGoals = getGoals();

    fetch('/api/explain-impact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, allGoals }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok || !res.body) {
          setStreamedText('Unable to generate analysis. Check your OPENAI_API_KEY.');
          setIsStreaming(false);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setStreamedText((prev) => prev + decoder.decode(value, { stream: true }));
        }
        setIsStreaming(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setStreamedText('Unable to generate analysis right now.');
          setIsStreaming(false);
        }
      });

    return () => controller.abort();
  }, [goal]);

  const gap = goal ? goal.monthlyContributionNeeded - SARAH.monthlySavingsCapacity : 0;

  return (
    <AnimatePresence>
      {goal && (
        <motion.div
          key="ai-panel"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 bg-[#131313] rounded-t-3xl border-t border-[#222] z-30 max-h-[58%] flex flex-col"
        >
          {/* Drag handle */}
          <button onClick={onClose} className="w-full pt-3 pb-1 flex justify-center" aria-label="Close">
            <div className="w-10 h-1 bg-[#2A2A2A] rounded-full" />
          </button>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#222] shrink-0">
            <div className="flex items-center gap-3">
              {(() => {
                const GoalIcon = GOAL_ICONS[goal.type as keyof typeof GOAL_ICONS] ?? GOAL_ICONS.custom;
                return (
                  <div className="w-9 h-9 rounded-xl bg-[#00C896]/10 border border-[#00C896]/20 flex items-center justify-center text-[#00C896]">
                    <GoalIcon size={16} strokeWidth={1.5} />
                  </div>
                );
              })()}
              <div>
                <p className="text-white font-semibold text-sm">{goal.name}</p>
                <p className="text-[#00C896] text-xs font-medium tabular-nums">
                  {goal.targetYear} · ${goal.estimatedCost.toLocaleString('en-CA')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center text-[#6B7280] hover:text-white transition-colors"
            >
              <XIcon size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Streaming analysis */}
          <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
            {!streamedText && isStreaming && (
              <div className="flex items-center gap-2.5 text-[#6B7280]">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-[#00C896] rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="text-xs tracking-wide">Analysing impact…</span>
              </div>
            )}
            {streamedText && (
              <p className="text-[#D1D5DB] text-sm leading-relaxed">
                {streamedText}
                {isStreaming && (
                  <span className="inline-block w-0.5 h-[1em] bg-[#00C896] ml-0.5 animate-pulse align-text-bottom" />
                )}
              </p>
            )}
          </div>

          {/* Numbers row */}
          <div className="mx-5 mb-5 grid grid-cols-3 gap-2 shrink-0">
            {[
              { label: 'Monthly needed', value: `$${goal.monthlyContributionNeeded.toLocaleString('en-CA')}`, color: 'text-[#E8B84B]' },
              { label: 'Gap', value: `${gap > 0 ? '+' : ''}$${Math.abs(gap).toLocaleString('en-CA')}`, color: gap > 0 ? 'text-red-400' : 'text-[#00C896]' },
              { label: 'Your capacity', value: `$${SARAH.monthlySavingsCapacity.toLocaleString('en-CA')}`, color: 'text-white' },
            ].map((item) => (
              <div key={item.label} className="p-3 bg-[#1A1A1A] rounded-xl border border-[#222] text-center">
                <p className="text-[#6B7280] text-[10px] mb-1 uppercase tracking-widest">{item.label}</p>
                <p className={`font-bold text-sm tabular-nums ${item.color}`}>
                  {item.value}
                  <span className="text-[#6B7280] text-[10px] font-normal">/mo</span>
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
