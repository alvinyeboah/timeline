'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Goal } from '@/lib/types';
import { XIcon } from '@/components/ui/icons';
import { StoredProfile } from '@/lib/profile-storage';

interface Props {
  goal: Goal;
  allGoals: Goal[];
  profile: StoredProfile;
  onClose: () => void;
}

export default function AdvisorModal({ goal, allGoals, profile, onClose }: Props) {
  const [brief, setBrief] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setBrief('');
    setIsStreaming(true);

    fetch('/api/prepare-advisor-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, allGoals, profile }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok || !res.body) {
          setBrief('Unable to prepare your brief. Check your OPENAI_API_KEY.');
          setIsStreaming(false);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setBrief((prev) => prev + decoder.decode(value, { stream: true }));
        }
        setIsStreaming(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setBrief('Unable to prepare your brief right now.');
          setIsStreaming(false);
        }
      });

    return () => controller.abort();
  }, [goal.id]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoHref = `mailto:?subject=${encodeURIComponent(`Question about ${goal.name}`)}&body=${encodeURIComponent(brief)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-stone-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-1">Your brief is ready</h2>
              <p className="text-stone-500 text-sm">Your AI has drafted a message for your advisor</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors shrink-0"
            >
              <XIcon size={13} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-7 py-5">
          {isStreaming && !brief && (
            <div className="flex items-center gap-3 text-stone-500 py-4">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-[#00C896] rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-sm">Preparing your brief…</span>
            </div>
          )}

          {(brief || (!isStreaming && !brief)) && (
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={10}
              className="w-full bg-stone-50 rounded-2xl p-4 text-sm text-stone-700 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-stone-200 font-mono"
              placeholder="Preparing your brief…"
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-7 pb-7 flex gap-3">
          <button
            onClick={handleCopy}
            disabled={!brief}
            className="flex-1 py-2.5 bg-[#00C896] text-white font-semibold rounded-xl text-sm hover:bg-[#00B386] transition disabled:opacity-40"
          >
            {copied ? 'Copied!' : 'Copy message'}
          </button>
          <a
            href={mailtoHref}
            className="flex-1 py-2.5 border border-stone-300 text-stone-700 font-medium rounded-xl text-sm hover:bg-stone-50 transition text-center"
          >
            Open in Mail →
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-stone-500 font-medium text-sm hover:text-stone-700 transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
