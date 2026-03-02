'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Goal, ChecklistItem } from '@/lib/types';
import { useGoalsStore } from '@/store/goals';
import { useProfileStore } from '@/store/profile';
import { GOAL_ICONS, XIcon, CompassIcon } from '@/components/ui/icons';
import AdvisorModal from './AdvisorModal';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ComparisonData {
  prevYear: number;
  newYear: number;
  text: string;
}

interface Props {
  goal: Goal | null;
  onClose: () => void;
  comparison?: ComparisonData | null;
  onDismissComparison?: () => void;
}

const HORIZON_LABELS: Record<ChecklistItem['horizon'], string> = {
  this_month: 'This Month',
  next_quarter: 'Next 3 Months',
  this_year: 'This Year',
  target_year: 'By Target Year',
};

const HORIZON_ORDER: ChecklistItem['horizon'][] = ['this_month', 'next_quarter', 'this_year', 'target_year'];

export default function GoalDetailPanel({ goal, onClose, comparison, onDismissComparison }: Props) {
  const allGoals = useGoalsStore((s) => s.goals);
  const profile = useProfileStore((s) => s.profile);
  const updateGoalNotes = useGoalsStore((s) => s.updateGoalNotes);
  const updateGoalChecklist = useGoalsStore((s) => s.updateGoalChecklist);
  const toggleChecklistItem = useGoalsStore((s) => s.toggleChecklistItem);

  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [generatingChecklist, setGeneratingChecklist] = useState(false);
  const [checklistError, setChecklistError] = useState('');
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [notes, setNotes] = useState(goal?.notes ?? '');

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatStreaming, setChatStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatAbortRef = useRef<AbortController | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const lastKeyRef = useRef<string>('');
  const notesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync notes when goal changes
  useEffect(() => {
    setNotes(goal?.notes ?? '');
  }, [goal?.id]);

  // Clear chat when goal changes
  useEffect(() => {
    setChatMessages([]);
    setChatInput('');
  }, [goal?.id]);

  // Stream analysis when goal changes
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

    fetch('/api/explain-impact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, allGoals, profile }),
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
  }, [goal?.id, goal?.targetYear]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
    notesTimeoutRef.current = setTimeout(() => {
      if (goal) updateGoalNotes(goal.id, value);
    }, 500);
  };

  const handleNotesBlur = () => {
    if (goal) updateGoalNotes(goal.id, notes);
  };

  const handleGenerateChecklist = async () => {
    if (!goal) return;
    setGeneratingChecklist(true);
    setChecklistError('');
    try {
      const res = await fetch('/api/generate-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, profile }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      const { checklist } = await res.json();
      updateGoalChecklist(goal.id, checklist);
    } catch (err) {
      setChecklistError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGeneratingChecklist(false);
    }
  };

  const handleChatSend = async () => {
    const text = chatInput.trim();
    if (!text || chatStreaming || !goal) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setChatStreaming(true);

    // Add placeholder assistant message
    setChatMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    chatAbortRef.current?.abort();
    const controller = new AbortController();
    chatAbortRef.current = controller;

    try {
      const res = await fetch('/api/chat-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, profile, messages: updatedMessages }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error('Failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setChatMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: reply };
          return next;
        });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setChatMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: 'Sorry, something went wrong.' };
          return next;
        });
      }
    } finally {
      setChatStreaming(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const capacity = profile.monthlySavingsCapacity;
  const gap = goal ? goal.monthlyContributionNeeded - capacity : 0;

  if (!goal) {
    return (
      <div className="w-[400px] border-l border-stone-200 bg-white flex flex-col items-center justify-center h-full">
        <div className="text-center px-8">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
            <CompassIcon size={20} strokeWidth={1.5} />
          </div>
          <p className="text-stone-500 text-sm">Select any goal to explore its impact</p>
        </div>
      </div>
    );
  }

  const GoalIcon = GOAL_ICONS[goal.type as keyof typeof GOAL_ICONS] ?? GOAL_ICONS.custom;
  const goalIconColors: Record<Goal['type'], string> = {
    real_estate: 'text-emerald-600',
    education: 'text-blue-600',
    travel: 'text-amber-600',
    retirement: 'text-violet-600',
    career: 'text-orange-600',
    custom: 'text-[#00C896]',
  };
  const iconColor = goalIconColors[goal.type];

  const checklist = goal.checklist ?? [];

  return (
    <>
      <motion.div
        key={goal.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-[400px] border-l border-stone-200 bg-white flex flex-col h-full overflow-hidden"
      >
        {/* ① Header */}
        <div className="px-6 pt-5 pb-4 border-b border-stone-100 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center ${iconColor}`}>
                <GoalIcon size={18} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900 leading-tight">{goal.name}</h2>
                <p className="text-stone-500 text-sm">
                  {goal.targetYear} · ${goal.estimatedCost.toLocaleString('en-CA')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-colors shrink-0"
            >
              <XIcon size={12} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* ③ Comparison (when drag occurred) */}
          <AnimatePresence>
            {comparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-4 mt-4 rounded-2xl border border-stone-200 overflow-hidden shrink-0"
              >
                <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                  <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide">Timeline Change</p>
                  <button onClick={onDismissComparison} className="text-stone-400 hover:text-stone-600">
                    <XIcon size={11} strokeWidth={2} />
                  </button>
                </div>
                <div className="grid grid-cols-2 divide-x divide-stone-200">
                  {[
                    { label: `Before · ${comparison.prevYear}`, year: comparison.prevYear },
                    { label: `After · ${comparison.newYear}`, year: comparison.newYear },
                  ].map(({ label, year }) => {
                    const yearsAway = Math.max(1, year - new Date().getFullYear());
                    const monthly = Math.round(goal.estimatedCost / (yearsAway * 12));
                    return (
                      <div key={label} className="px-3 py-3">
                        <p className="text-[10px] text-stone-400 uppercase tracking-wide mb-2">{label}</p>
                        <p className="text-xs text-stone-500 mb-0.5">Monthly needed</p>
                        <p className="text-sm font-bold text-stone-900">${monthly.toLocaleString('en-CA')}/mo</p>
                        <p className="text-xs text-stone-500 mb-0.5 mt-1.5">Years to save</p>
                        <p className="text-sm font-bold text-stone-900">{yearsAway} yr</p>
                      </div>
                    );
                  })}
                </div>
                {comparison.text && (
                  <div className="px-4 py-3 border-t border-stone-200 bg-stone-50/50">
                    <p className="text-xs text-stone-600 leading-relaxed">{comparison.text}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ② AI Impact */}
          <div className="px-4 pt-4">
            {/* Stat chips */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Monthly needed', value: `$${goal.monthlyContributionNeeded.toLocaleString('en-CA')}`, color: 'text-[#D97706]' },
                { label: 'Gap', value: `${gap > 0 ? '+' : ''}$${Math.abs(gap).toLocaleString('en-CA')}`, color: gap > 0 ? 'text-red-500' : 'text-[#00C896]' },
                { label: 'Your capacity', value: `$${capacity.toLocaleString('en-CA')}`, color: 'text-stone-700' },
              ].map((item) => (
                <div key={item.label} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <p className="text-stone-400 text-[9px] mb-1 uppercase tracking-wide">{item.label}</p>
                  <p className={`font-bold text-sm tabular-nums ${item.color}`}>
                    {item.value}
                    <span className="text-stone-400 text-[9px] font-normal">/mo</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Streaming analysis */}
            {!streamedText && isStreaming && (
              <div className="space-y-2 mb-4">
                {[100, 85, 70].map((w, i) => (
                  <div key={i} className={`h-3 bg-stone-100 rounded animate-pulse`} style={{ width: `${w}%` }} />
                ))}
              </div>
            )}
            {streamedText && (
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                {streamedText}
                {isStreaming && (
                  <span className="inline-block w-0.5 h-[1em] bg-[#00C896] ml-0.5 animate-pulse align-text-bottom" />
                )}
              </p>
            )}
          </div>

          {/* ④ Checklist */}
          <div className="px-4 mb-4">
            <button
              onClick={() => setChecklistOpen((o) => !o)}
              className="w-full flex items-center justify-between py-2 text-sm font-semibold text-stone-700 hover:text-stone-900 transition-colors"
            >
              <span>Action Plan</span>
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform ${checklistOpen ? 'rotate-180' : ''} text-stone-400`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <AnimatePresence>
              {checklistOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  {checklist.length === 0 ? (
                    <div className="mt-2 flex flex-col gap-2">
                      <button
                        onClick={handleGenerateChecklist}
                        disabled={generatingChecklist}
                        className="w-full py-2.5 border border-stone-200 rounded-xl text-sm text-[#00C896] font-medium hover:bg-stone-50 transition disabled:opacity-50"
                      >
                        {generatingChecklist ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-3 h-3 border-2 border-[#00C896]/30 border-t-[#00C896] rounded-full animate-spin" />
                            Generating roadmap…
                          </span>
                        ) : (
                          'Generate your roadmap →'
                        )}
                      </button>
                      {checklistError && (
                        <p className="text-xs text-red-500 text-center">{checklistError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 space-y-4">
                      {HORIZON_ORDER.map((horizon) => {
                        const items = checklist.filter((i) => i.horizon === horizon);
                        if (items.length === 0) return null;
                        const targetLabel = horizon === 'target_year' ? `By ${goal.targetYear}` : HORIZON_LABELS[horizon];
                        return (
                          <div key={horizon}>
                            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-2">{targetLabel}</p>
                            <div className="space-y-1.5">
                              {items.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => toggleChecklistItem(goal.id, item.id)}
                                  className="w-full flex items-start gap-2.5 text-left group"
                                >
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${item.done ? 'bg-[#00C896] border-[#00C896]' : 'border-stone-300 group-hover:border-stone-400'}`}>
                                    {item.done && (
                                      <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                                        <path d="M1 3.5L3 5.5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className={`text-sm leading-snug ${item.done ? 'line-through text-stone-400' : 'text-stone-700 group-hover:text-stone-900'}`}>
                                    {item.text}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ⑤ Chat */}
          <div className="px-4 mb-4">
            <div className="border border-stone-200 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#00C896]/15 flex items-center justify-center shrink-0">
                  <span className="text-[#00C896] text-[10px] font-bold">AI</span>
                </div>
                <p className="text-xs font-semibold text-stone-700">Ask about this goal</p>
              </div>

              {/* Messages */}
              {chatMessages.length > 0 && (
                <div className="px-3 py-3 flex flex-col gap-2.5 max-h-56 overflow-y-auto">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                          msg.role === 'user'
                            ? 'bg-stone-900 text-white rounded-br-sm'
                            : 'bg-stone-100 text-stone-700 rounded-bl-sm'
                        }`}
                      >
                        {msg.content}
                        {msg.role === 'assistant' && chatStreaming && i === chatMessages.length - 1 && !msg.content && (
                          <span className="flex gap-1 py-0.5">
                            {[0, 1, 2].map((j) => (
                              <span key={j} className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: `${j * 0.12}s` }} />
                            ))}
                          </span>
                        )}
                        {msg.role === 'assistant' && chatStreaming && i === chatMessages.length - 1 && msg.content && (
                          <span className="inline-block w-0.5 h-[0.9em] bg-[#00C896] ml-0.5 animate-pulse align-text-bottom" />
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              )}

              {/* Input */}
              <div className={`flex gap-2 p-2 ${chatMessages.length > 0 ? 'border-t border-stone-200' : ''}`}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder={chatMessages.length === 0 ? `Ask anything about ${goal.name}…` : 'Ask a follow-up…'}
                  disabled={chatStreaming}
                  className="flex-1 bg-transparent px-2 py-1.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || chatStreaming}
                  className="w-7 h-7 bg-stone-900 text-white rounded-lg flex items-center justify-center hover:bg-stone-700 disabled:opacity-30 transition shrink-0"
                >
                  {chatStreaming ? (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ⑥ Notes */}
          <div className="px-4 mb-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Your notes</p>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Capture questions, research, concerns…"
              rows={3}
              className="w-full bg-stone-50 rounded-xl p-3 text-sm text-stone-700 placeholder-stone-400 resize-none focus:outline-none focus:ring-1 focus:ring-stone-200 transition border-0"
            />
            {notes.length > 200 && (
              <p className="text-[10px] text-stone-400 mt-1 text-right">{notes.length} characters</p>
            )}
          </div>
        </div>

        {/* ⑥ Ask an Advisor — sticky footer */}
        <div className="px-4 pb-5 pt-4 border-t border-stone-100 shrink-0">
          <button
            onClick={() => setShowAdvisor(true)}
            className="w-full py-2.5 border border-stone-300 rounded-xl text-stone-700 text-sm hover:bg-stone-50 transition font-medium"
          >
            Ask an Advisor →
          </button>
        </div>
      </motion.div>

      {showAdvisor && (
        <AdvisorModal
          goal={goal}
          allGoals={allGoals}
          profile={profile}
          onClose={() => setShowAdvisor(false)}
        />
      )}
    </>
  );
}
