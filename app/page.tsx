'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ACCOUNTS, NET_WORTH } from '@/lib/mock-data';
import { useProfileStore } from '@/store/profile';
import { TimelineIcon, EditIcon, MoveIcon, SlidersIcon } from '@/components/ui/icons';

const FEATURES = [
  {
    num: '01',
    color: '#B8C43D',
    title: 'FULL PICTURE',
    desc: 'Every milestone from today to retirement — net worth in one continuous view.',
    Icon: TimelineIcon,
  },
  {
    num: '02',
    color: '#6BBFAC',
    title: 'AI GOALS',
    desc: 'Describe what you want in plain English and we\'ll build a complete plan.',
    Icon: EditIcon,
  },
  {
    num: '03',
    color: '#D47E6A',
    title: 'TRADE-OFFS',
    desc: 'Drag goals forward or back and watch your net worth update in real time.',
    Icon: MoveIcon,
  },
  {
    num: '04',
    color: '#96785A',
    title: 'ASSUMPTIONS',
    desc: 'Adjust income, savings rate, or returns. The picture recalibrates instantly.',
    Icon: SlidersIcon,
  },
];


export default function SplashPage() {
  const router = useRouter();
  const firstName = useProfileStore((s) => s.profile.fullName.split(' ')[0]);
  const [displayedAmount, setDisplayedAmount] = useState(0);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    setReturning(!!localStorage.getItem('timeline_tutorial_seen'));
  }, []);

  useEffect(() => {
    const steps = 60;
    const increment = NET_WORTH / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplayedAmount(Math.min(Math.round(increment * step), NET_WORTH));
      if (step >= steps) clearInterval(timer);
    }, 1800 / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex overflow-hidden">
      {/* ── Left: copy + CTA ─────────────────────────────────────────────────── */}
      <div className="w-[55%] flex flex-col justify-between px-16 py-14 bg-white border-r border-stone-200">
        {/* Wordmark */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <span className="text-stone-900 font-bold text-lg tracking-tight">Timeline</span>
        </motion.div>

        {/* Main content */}
        <div>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-3"
          >
            {returning ? 'Welcome back' : 'Welcome'}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="text-7xl font-bold text-stone-900 mb-8 leading-none tracking-tight"
          >
            {firstName}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 }}
            className="mb-2"
          >
            <p className="text-stone-400 text-xs uppercase tracking-widest mb-1">Net Worth</p>
            <p className="text-7xl font-bold text-[#D97706] tabular-nums leading-none">
              ${displayedAmount.toLocaleString('en-CA')}
            </p>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
            className="text-stone-400 text-sm mb-5">
            across {ACCOUNTS.length} connected accounts
          </motion.p>

          {/* Account summary */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
            className="flex gap-6 mb-12 pb-10 border-b border-stone-100"
          >
            {ACCOUNTS.map((account) => (
              <div key={account.id}>
                <p className="text-stone-400 text-[10px] uppercase tracking-wide mb-0.5">
                  {account.name.split(' ').slice(-1)[0]}
                </p>
                <p className="text-stone-700 font-semibold text-sm tabular-nums">
                  ${account.balance.toLocaleString('en-CA')}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
            className="text-stone-400 text-lg mb-10 leading-snug"
          >
            Build the life you want.{' '}
            <span className="text-stone-900 font-medium">See what it takes.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}
            className="flex gap-3"
          >
            <button
              onClick={() => router.push(returning ? '/timeline' : '/onboarding')}
              className="px-8 py-3.5 bg-stone-900 text-white font-semibold rounded-xl text-base hover:bg-stone-800 active:scale-[0.98] transition-all"
            >
              {returning ? 'Continue to Timeline →' : 'Get Started →'}
            </button>
            {!returning && (
              <button
                onClick={() => router.push('/signup')}
                className="px-8 py-3.5 bg-stone-100 text-stone-600 font-medium rounded-xl text-base border border-stone-200 hover:bg-stone-200 active:scale-[0.98] transition-all"
              >
                Sign in
              </button>
            )}
          </motion.div>
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
          className="text-stone-300 text-xs">
          Demo · Sarah Chen · Toronto, ON
        </motion.p>
      </div>

      {/* ── Right: 4-column infographic ──────────────────────────────────────── */}
      <div className="w-[45%] bg-[#EDECEA] flex flex-col justify-between py-12 px-4 overflow-hidden">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-2"
        >
          <span className="text-stone-400 text-[10px] tracking-[0.3em] uppercase font-normal">How it </span>
          <span className="text-stone-700 text-[10px] tracking-[0.3em] uppercase font-bold">works</span>
        </motion.div>

        {/* 4-column grid */}
        <div className="flex-1 grid grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.09, duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col px-4 border-r border-stone-300/40 last:border-r-0 pt-4"
            >
              {/* Giant centered number */}
              <div className="h-28 flex items-center justify-center">
                <span
                  className="font-bold select-none leading-none"
                  style={{ fontSize: '96px', color: f.color }}
                >
                  {f.num}
                </span>
              </div>

              {/* Bold title */}
              <h3 className="text-[9px] font-bold text-stone-900 uppercase tracking-widest mt-3 mb-2">
                {f.title}
              </h3>

              {/* Description */}
              <p className="text-stone-400 text-[10px] leading-relaxed">
                {f.desc}
              </p>

              {/* Icon */}
              <div className="mt-auto pt-6 pb-2 text-stone-600">
                <f.Icon size={18} strokeWidth={1.5} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
