'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ACCOUNTS, NET_WORTH } from '@/lib/mock-data';
import { useProfileStore } from '@/store/profile';
import AccountCard from '@/components/accounts/AccountCard';

export default function SplashPage() {
  const router = useRouter();
  const firstName = useProfileStore((s) => s.profile.fullName.split(' ')[0]);
  const [showStats, setShowStats] = useState(false);
  const [displayedAmount, setDisplayedAmount] = useState(0);
  const [returning, setReturning] = useState(false);
  const targetAmount = NET_WORTH;

  useEffect(() => {
    setReturning(!!localStorage.getItem('timeline_tutorial_seen'));
  }, []);

  // Count-up animation
  useEffect(() => {
    const duration = 1800;
    const steps = 60;
    const increment = targetAmount / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = Math.min(Math.round(increment * step), targetAmount);
      setDisplayedAmount(current);
      if (current >= targetAmount) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [targetAmount]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D0D] to-[#1A1A1A] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00C896]/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center w-full max-w-sm"
      >
        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[#9CA3AF] text-sm font-medium tracking-widest uppercase mb-2"
        >
          {returning ? 'Welcome back' : 'Welcome'}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-white mb-8"
        >
          {firstName}
        </motion.h1>

        {/* Net Worth */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mb-2"
        >
          <p className="text-[#9CA3AF] text-xs uppercase tracking-widest mb-1">Net Worth</p>
          <p className="text-5xl font-bold text-[#E8B84B] tabular-nums">
            ${displayedAmount.toLocaleString('en-CA')}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-[#9CA3AF] text-sm mb-4"
        >
          across {ACCOUNTS.length} connected accounts
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-white/60 text-base mb-10 leading-snug"
        >
          Build the life you want.{' '}
          <span className="text-[#00C896]">See what it takes.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={() => router.push(returning ? '/timeline' : '/onboarding')}
            className="w-full py-4 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-2xl text-base hover:bg-[#00B386] active:scale-[0.98] transition-all"
          >
            {returning ? 'Continue to your Timeline →' : 'Get Started →'}
          </button>
          {returning && (
            <button
              onClick={() => setShowStats(true)}
              className="w-full py-4 bg-[#1A1A1A] text-white font-semibold rounded-2xl text-base border border-[#2A2A2A] hover:bg-[#242424] active:scale-[0.98] transition-all"
            >
              Quick Stats
            </button>
          )}
        </motion.div>
      </motion.div>

      {/* Quick Stats Bottom Sheet */}
      <AnimatePresence>
        {showStats && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowStats(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-3xl z-50 p-6 pb-10"
            >
              <div className="w-10 h-1 bg-[#2A2A2A] rounded-full mx-auto mb-6" />
              <h2 className="text-lg font-semibold text-white mb-1">Your Accounts</h2>
              <p className="text-[#9CA3AF] text-sm mb-5">All connected and up to date</p>

              <div className="flex flex-col gap-3 mb-6">
                {ACCOUNTS.map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>

              <div className="border-t border-[#2A2A2A] pt-4 flex justify-between items-center">
                <span className="text-[#9CA3AF] font-medium">Total Net Worth</span>
                <span className="text-[#E8B84B] font-bold text-xl tabular-nums">
                  ${NET_WORTH.toLocaleString('en-CA')}
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
