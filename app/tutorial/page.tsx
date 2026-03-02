'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TimelineIcon, EditIcon, MoveIcon, SlidersIcon } from '@/components/ui/icons';

const FEATURES = [
  {
    Icon: TimelineIcon,
    title: 'See your life in one place',
    desc: 'Every financial milestone from today to retirement — savings, goals, and net worth in one continuous view.',
    color: '#00C896',
  },
  {
    Icon: EditIcon,
    title: 'Add goals in plain English',
    desc: 'Describe what you want — "buy a house in 5 years" or "sabbatical in 2027" — and our AI turns it into a financial plan.',
    color: '#60A5FA',
  },
  {
    Icon: MoveIcon,
    title: 'Drag to explore',
    desc: 'Move goals forward or back and watch your net worth update instantly. See exactly what each trade-off means.',
    color: '#A78BFA',
  },
  {
    Icon: SlidersIcon,
    title: 'Tweak assumptions',
    desc: 'Change income, savings rate, or expected returns. The timeline recalibrates so you always have an accurate picture.',
    color: '#F59E0B',
  },
];

export default function TutorialPage() {
  const router = useRouter();

  const handleContinue = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timeline_tutorial_seen', 'true');
    }
    router.push('/timeline');
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl"
      >
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[#00C896] text-xs font-semibold uppercase tracking-widest mb-3">How it works</p>
          <h1 className="text-5xl font-bold text-stone-900 leading-tight">
            Your financial life,<br />planned out.
          </h1>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 gap-5 mb-14">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * (i + 1) }}
              className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ backgroundColor: `${feature.color}12`, color: feature.color }}
              >
                <feature.Icon size={22} strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold text-stone-900 mb-2">{feature.title}</h2>
              <p className="text-stone-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleContinue}
            className="px-12 py-4 bg-stone-900 text-white font-semibold rounded-xl text-base hover:bg-stone-800 active:scale-[0.98] transition-all"
          >
            Show me my Timeline →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
