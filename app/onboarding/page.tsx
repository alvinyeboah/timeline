'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SARAH, ACCOUNTS, NET_WORTH } from '@/lib/mock-data';
import AccountCard from '@/components/accounts/AccountCard';
import OnboardingStep from '@/components/ui/OnboardingStep';
import { TrendUpIcon, LayoutIcon, CompassIcon, UsersIcon } from '@/components/ui/icons';

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const next = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else router.push('/what-matters');
  };

  const back = () => {
    if (step > 1) setStep((s) => s - 1);
    else router.push('/');
  };

  return (
    <AnimatePresence mode="wait">
      {step === 1 && (
        <OnboardingStep key="step1" step={1} totalSteps={TOTAL_STEPS} onBack={back}>
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="w-12 h-12 bg-[#00C896]/10 rounded-2xl flex items-center justify-center mb-6 text-[#00C896]">
                <TrendUpIcon size={22} strokeWidth={1.75} />
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight mb-4">
                Most apps show where your money went.
              </h1>
              <p className="text-[#9CA3AF] text-lg leading-relaxed">
                Timeline shows you where your <span className="text-white font-semibold">life could go</span>.
              </p>
            </motion.div>
          </div>

          <div className="flex gap-3 mt-auto">
            <button
              onClick={next}
              className="flex-1 py-4 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-2xl text-base active:scale-[0.98] transition-all"
            >
              Get Started
            </button>
            <button
              onClick={next}
              className="px-6 py-4 bg-[#1A1A1A] text-[#9CA3AF] font-semibold rounded-2xl text-base border border-[#2A2A2A] active:scale-[0.98] transition-all"
            >
              Sign In
            </button>
          </div>
        </OnboardingStep>
      )}

      {step === 2 && (
        <OnboardingStep key="step2" step={2} totalSteps={TOTAL_STEPS} onBack={back}>
          <div className="flex-1 flex flex-col justify-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white mb-8"
            >
              Your whole financial life, in one place.
            </motion.h2>

            <div className="flex flex-col gap-4">
              {[
                { Icon: LayoutIcon, title: 'See the full picture', desc: 'All accounts, all goals, one timeline from today to retirement.' },
                { Icon: CompassIcon, title: 'Explore your future', desc: 'Drag goals, change years, and watch your net worth update in real time.' },
                { Icon: UsersIcon, title: 'Know when to act', desc: "We'll tell you exactly when to talk to an advisor or make a move." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 * (i + 1) }}
                  className="flex gap-4 p-4 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A]"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#00C896]/10 border border-[#00C896]/15 flex items-center justify-center text-[#00C896] shrink-0">
                    <item.Icon size={16} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-0.5">{item.title}</p>
                    <p className="text-[#9CA3AF] text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <button
            onClick={next}
            className="w-full py-4 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-2xl text-base mt-8 active:scale-[0.98] transition-all"
          >
            Continue
          </button>
        </OnboardingStep>
      )}

      {step === 3 && (
        <OnboardingStep key="step3" step={3} totalSteps={TOTAL_STEPS} onBack={back}>
          <div className="flex-1 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h2 className="text-3xl font-bold text-white mb-2">Your accounts</h2>
              <p className="text-[#9CA3AF]">Connected and ready to go</p>
            </motion.div>

            <div className="flex flex-col gap-3 mb-6">
              {ACCOUNTS.map((account, i) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (i + 1) }}
                >
                  <AccountCard account={account} />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-between items-center p-4 bg-[#00C896]/10 rounded-2xl border border-[#00C896]/20 mb-auto"
            >
              <span className="text-[#9CA3AF] font-medium">Total Net Worth</span>
              <span className="text-[#E8B84B] font-bold text-xl tabular-nums">
                ${NET_WORTH.toLocaleString('en-CA')}
              </span>
            </motion.div>
          </div>

          <button
            onClick={next}
            className="w-full py-4 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-2xl text-base mt-8 active:scale-[0.98] transition-all"
          >
            Continue
          </button>
        </OnboardingStep>
      )}

      {step === 4 && (
        <OnboardingStep key="step4" step={4} totalSteps={TOTAL_STEPS} onBack={back}>
          <div className="flex-1 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h2 className="text-3xl font-bold text-white mb-2">Your profile</h2>
              <p className="text-[#9CA3AF]">Based on your connected accounts</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-5 mb-auto"
            >
              {[
                { label: 'Name', value: SARAH.name },
                { label: 'Age', value: `${SARAH.age} years old` },
                { label: 'Annual Income', value: `$${SARAH.income.toLocaleString('en-CA')}` },
                { label: 'Province', value: SARAH.province },
                { label: 'Tax Bracket', value: `${SARAH.taxBracket}%` },
                { label: 'Monthly Expenses', value: `$${SARAH.monthlyExpenses.toLocaleString('en-CA')}` },
                { label: 'Total Debt', value: `$${SARAH.totalDebt.toLocaleString('en-CA')} (student loans)` },
                { label: 'Savings Capacity', value: `~$${SARAH.monthlySavingsCapacity.toLocaleString('en-CA')}/mo` },
                { label: 'Debt Priority', value: 'Minimums first, then goals' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-start py-3 ${i < 8 ? 'border-b border-[#2A2A2A]' : ''}`}
                >
                  <span className="text-[#9CA3AF] text-sm">{item.label}</span>
                  <span className="text-white text-sm font-medium text-right max-w-[55%]">{item.value}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <button
            onClick={next}
            className="w-full py-4 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-2xl text-base mt-8 active:scale-[0.98] transition-all"
          >
            Continue →
          </button>
        </OnboardingStep>
      )}
    </AnimatePresence>
  );
}
