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
  { name: 'Career Switch',  year: CURRENT_YEAR + 6,  color: '#FCD34D' },
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
    <div className="relative w-full h-full overflow-hidden" aria-hidden>
      {/* Animated background grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between py-8 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-full h-px bg-white/[0.04]" />
        ))}
      </div>

      {/* Vertical year lines */}
      <div className="absolute inset-0 flex justify-between px-12 pointer-events-none">
        {[CURRENT_YEAR, CURRENT_YEAR + 10, CURRENT_YEAR + 20, CURRENT_YEAR + 30].map((y) => (
          <div key={y} className="flex flex-col items-center">
            <div className="w-px h-full bg-white/[0.05]" />
            <span className="text-[10px] text-white/20 mt-2 shrink-0">{y}</span>
          </div>
        ))}
      </div>

      {/* "Now" line */}
      <div className="absolute top-0 bottom-6 left-[4%] w-px bg-[#00C896]/40" />

      {/* Projection curve */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00C896" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00C896" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <path
          d="M 0,80% C 15%,75% 30%,60% 50%,40% S 80%,15% 100%,5%"
          stroke="url(#lineGrad)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      {/* Goal nodes */}
      {DEMO_GOALS.map((goal, i) => {
        const xPct = ((goal.year - CURRENT_YEAR) / YEAR_RANGE) * 88 + 4;
        const isActive = tick % DEMO_GOALS.length === i;
        return (
          <motion.div
            key={goal.name}
            className="absolute flex flex-col items-center"
            style={{ left: `${xPct}%`, top: '30%', transform: 'translateX(-50%)' }}
            animate={{ opacity: isActive ? 1 : 0.35, scale: isActive ? 1.1 : 1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            {/* Node dot */}
            <motion.div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: goal.color }}
              animate={{ boxShadow: isActive ? `0 0 12px ${goal.color}80` : 'none' }}
            />
            <div className="w-px h-8 bg-white/10 mt-1" />
            {/* Label */}
            <div
              className="px-2 py-1 rounded-lg border text-[9px] font-medium tracking-wide text-white/70 whitespace-nowrap"
              style={{ borderColor: `${goal.color}30`, backgroundColor: `${goal.color}10` }}
            >
              {goal.name}
            </div>
          </motion.div>
        );
      })}

      {/* Year labels row at bottom */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-between px-4">
        {[CURRENT_YEAR, CURRENT_YEAR + 5, CURRENT_YEAR + 10, CURRENT_YEAR + 15, CURRENT_YEAR + 20, CURRENT_YEAR + 25, CURRENT_YEAR + 30].map((y) => (
          <span key={y} className="text-[9px] text-white/20 tabular-nums">{y}</span>
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
  const targetAmount = NET_WORTH;

  useEffect(() => {
    setReturning(!!localStorage.getItem('timeline_tutorial_seen'));
  }, []);

  useEffect(() => {
    const duration = 1800;
    const steps = 60;
    const increment = targetAmount / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplayedAmount(Math.min(Math.round(increment * step), targetAmount));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [targetAmount]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex overflow-hidden">
      {/* ── Left panel: copy + CTA (55%) ─────────────────────────────────── */}
      <div className="w-[55%] flex flex-col justify-between px-16 py-14 relative z-10">
        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-white font-bold text-lg tracking-tight">Timeline</span>
        </motion.div>

        {/* Center content */}
        <div className="flex flex-col">
          {/* Greeting */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[#6B7280] text-sm font-medium tracking-widest uppercase mb-3"
          >
            {returning ? 'Welcome back' : 'Welcome'}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-6xl font-bold text-white mb-8 leading-none tracking-tight"
          >
            {firstName}
          </motion.h1>

          {/* Net worth display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-3"
          >
            <p className="text-[#6B7280] text-xs uppercase tracking-widest mb-1">Net Worth</p>
            <p className="text-7xl font-bold text-[#D97706] tabular-nums leading-none">
              ${displayedAmount.toLocaleString('en-CA')}
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-[#6B7280] text-sm mb-3"
          >
            across {ACCOUNTS.length} connected accounts
          </motion.p>

          {/* Account summary inline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="flex gap-4 mb-10"
          >
            {ACCOUNTS.map((account) => (
              <div key={account.id} className="flex flex-col">
                <span className="text-[#4B5563] text-[10px] uppercase tracking-wide">{account.name.split(' ').slice(-1)[0]}</span>
                <span className="text-white/70 text-sm font-medium tabular-nums">${account.balance.toLocaleString('en-CA')}</span>
              </div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-white/40 text-lg mb-10 leading-snug"
          >
            Build the life you want.{' '}
            <span className="text-[#00C896]">See what it takes.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 }}
            className="flex gap-3"
          >
            <button
              onClick={() => router.push(returning ? '/timeline' : '/onboarding')}
              className="px-8 py-3.5 bg-[#00C896] text-[#0A0A0A] font-semibold rounded-2xl text-base hover:bg-[#00B386] active:scale-[0.98] transition-all"
            >
              {returning ? 'Continue to Timeline →' : 'Get Started →'}
            </button>
            {!returning && (
              <button
                onClick={() => router.push('/signup')}
                className="px-8 py-3.5 bg-[#1A1A1A] text-white/70 font-medium rounded-2xl text-base border border-[#2A2A2A] hover:bg-[#222] hover:text-white active:scale-[0.98] transition-all"
              >
                Sign in
              </button>
            )}
          </motion.div>
        </div>

        {/* Bottom hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
          className="text-[#2A2A2A] text-xs"
        >
          Demo — Sarah Chen · Toronto, ON
        </motion.p>
      </div>

      {/* ── Right panel: decorative timeline (45%) ───────────────────────── */}
      <div className="w-[45%] relative overflow-hidden border-l border-white/[0.04]">
        {/* Background gradient glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00C896]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-[#D97706]/4 rounded-full blur-3xl pointer-events-none" />

        {/* Label */}
        <div className="absolute top-14 left-10 z-10">
          <p className="text-[#4B5563] text-[10px] uppercase tracking-widest">Your life timeline</p>
          <p className="text-[#6B7280] text-xs mt-0.5">{CURRENT_YEAR} → {PROJECTION_END_YEAR}</p>
        </div>

        {/* Timeline preview component */}
        <div className="absolute inset-0 pt-28 pb-8">
          <TimelinePreview />
        </div>
      </div>
    </div>
  );
}
