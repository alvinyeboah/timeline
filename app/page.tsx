'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ACCOUNTS, NET_WORTH, CURRENT_YEAR, PROJECTION_END_YEAR } from '@/lib/mock-data';
import { useProfileStore } from '@/store/profile';

const DEMO_GOALS = [
  { name: 'Emergency Fund', year: CURRENT_YEAR,      color: '#00C896' },
  { name: 'Europe Trip',    year: CURRENT_YEAR + 1,  color: '#60A5FA' },
  { name: 'MBA',            year: CURRENT_YEAR + 2,  color: '#A78BFA' },
  { name: 'Buy Condo',      year: CURRENT_YEAR + 4,  color: '#34D399' },
  { name: 'Career Switch',  year: CURRENT_YEAR + 6,  color: '#F59E0B' },
  { name: 'Studio',         year: CURRENT_YEAR + 10, color: '#F87171' },
  { name: 'Retire at 55',   year: CURRENT_YEAR + 26, color: '#00C896' },
];
const YEAR_RANGE = PROJECTION_END_YEAR - CURRENT_YEAR;

function TimelinePreview() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full h-full" aria-hidden>
      {/* Horizontal grid lines */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="absolute w-full h-px bg-stone-200" style={{ top: `${20 + i * 15}%` }} />
      ))}
      {/* "Now" line */}
      <div className="absolute top-0 bottom-8 left-[4%] w-px bg-[#00C896]/50" />
      {/* Projection curve */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00C896" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00C896" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path d="M 0,78% C 15%,72% 30%,55% 50%,35% S 80%,12% 100%,5%" stroke="url(#lg)" strokeWidth="2" fill="none" />
      </svg>
      {/* Goal nodes */}
      {DEMO_GOALS.map((goal, i) => {
        const xPct = ((goal.year - CURRENT_YEAR) / YEAR_RANGE) * 88 + 4;
        const isActive = tick % DEMO_GOALS.length === i;
        return (
          <motion.div
            key={goal.name}
            className="absolute flex flex-col items-center"
            style={{ left: `${xPct}%`, top: '28%', transform: 'translateX(-50%)' }}
            animate={{ opacity: isActive ? 1 : 0.3, scale: isActive ? 1.08 : 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: goal.color }}
              animate={{ boxShadow: isActive ? `0 0 10px ${goal.color}60` : 'none' }}
            />
            <div className="w-px h-7 mt-1" style={{ backgroundColor: `${goal.color}40` }} />
            <div
              className="px-2 py-0.5 rounded-lg border text-[8px] font-medium text-stone-500 whitespace-nowrap"
              style={{ borderColor: `${goal.color}30`, backgroundColor: `${goal.color}08` }}
            >
              {goal.name}
            </div>
          </motion.div>
        );
      })}
      {/* Year labels */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4">
        {[CURRENT_YEAR, CURRENT_YEAR + 5, CURRENT_YEAR + 10, CURRENT_YEAR + 15, CURRENT_YEAR + 20, CURRENT_YEAR + 25, CURRENT_YEAR + 30].map((y) => (
          <span key={y} className="text-[9px] text-stone-300 tabular-nums">{y}</span>
        ))}
      </div>
    </div>
  );
}

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

      {/* ── Right: decorative light timeline ─────────────────────────────────── */}
      <div className="w-[45%] relative overflow-hidden bg-[#F5F4F0]">
        {/* Subtle accent circles */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#00C896]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/3 w-60 h-60 bg-[#D97706]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute top-12 left-10 z-10">
          <p className="text-stone-400 text-[10px] uppercase tracking-widest">Your life timeline</p>
          <p className="text-stone-300 text-xs mt-0.5">{CURRENT_YEAR} → {PROJECTION_END_YEAR}</p>
        </div>

        <div className="absolute inset-0 pt-28 pb-8">
          <TimelinePreview />
        </div>
      </div>
    </div>
  );
}
