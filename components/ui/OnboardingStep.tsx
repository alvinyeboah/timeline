'use client';

import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@/components/ui/icons';

interface Props {
  step: number;
  totalSteps: number;
  onBack?: () => void;
  children: React.ReactNode;
}

export default function OnboardingStep({ step, totalSteps, onBack, children }: Props) {
  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="min-h-screen bg-[#0D0D0D] flex flex-col px-6 pt-14 pb-10"
    >
      {/* Top row: back button + progress dots */}
      <div className="flex items-center justify-between mb-10">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
            aria-label="Back"
          >
            <ArrowLeftIcon size={15} strokeWidth={2} />
          </button>
        ) : (
          <div className="w-9" />
        )}

        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step - 1 ? 'w-6 bg-[#00C896]' : 'w-1.5 bg-[#2A2A2A]'
              }`}
            />
          ))}
        </div>

        <div className="w-9" />
      </div>

      {children}
    </motion.div>
  );
}
