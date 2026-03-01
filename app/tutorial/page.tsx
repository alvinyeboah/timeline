'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { TimelineIcon, EditIcon, MoveIcon, SlidersIcon, ArrowLeftIcon } from '@/components/ui/icons';

const PANELS = [
  {
    Icon: TimelineIcon,
    title: 'See your life in one place',
    desc: 'Your timeline shows every financial milestone from today all the way to retirement — your savings, goals, and net worth in one continuous view.',
    color: '#00C896',
  },
  {
    Icon: EditIcon,
    title: 'Add goals in plain English',
    desc: 'Just describe what you want — "buy a house in 5 years" or "take a sabbatical in 2027" — and our AI translates it into a financial plan.',
    color: '#E8B84B',
  },
  {
    Icon: MoveIcon,
    title: 'Drag to explore',
    desc: 'Move goals forward or backward in time and watch your net worth projection update live. See exactly what each trade-off means for your future.',
    color: '#00C896',
  },
  {
    Icon: SlidersIcon,
    title: 'Tweak assumptions anytime',
    desc: 'Change income, savings rate, or expected returns. The timeline recalibrates instantly so you always have an accurate picture.',
    color: '#E8B84B',
  },
];

export default function TutorialPage() {
  const router = useRouter();
  const [panel, setPanel] = useState(0);
  const current = PANELS[panel];
  const isLast = panel === PANELS.length - 1;

  const handleNext = () => {
    if (isLast) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('timeline_tutorial_seen', 'true');
      }
      router.push('/timeline');
    } else {
      setPanel((p) => p + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col px-6 pt-14 pb-10">
      {/* Top row */}
      <div className="flex items-center justify-between mb-12">
        <button
          onClick={() => (panel > 0 ? setPanel((p) => p - 1) : router.back())}
          className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeftIcon size={15} strokeWidth={2} />
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {PANELS.map((_, i) => (
            <button
              key={i}
              onClick={() => setPanel(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === panel ? 'w-8 bg-[#00C896]' : 'w-1.5 bg-[#2A2A2A]'
              }`}
            />
          ))}
        </div>

        <div className="w-9" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={panel}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col items-center text-center justify-center"
        >
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8"
            style={{ backgroundColor: `${current.color}15`, color: current.color }}
          >
            <current.Icon size={32} strokeWidth={1.25} />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            {current.title}
          </h2>
          <p className="text-[#9CA3AF] text-lg leading-relaxed max-w-xs">
            {current.desc}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={handleNext}
          className="flex-1 py-4 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-2xl text-base active:scale-[0.98] transition-all"
        >
          {isLast ? 'Show me my Timeline →' : 'Next'}
        </button>
      </div>
    </div>
  );
}
