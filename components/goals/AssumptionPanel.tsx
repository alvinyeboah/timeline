'use client';

import { motion } from 'framer-motion';
import { StoredProfile } from '@/lib/profile-storage';

interface Sliders {
  income: number;
  growthRate: number;
  incomeGrowth: number;
}

interface Props {
  profile: StoredProfile;
  sliders: Sliders;
  onChange: (sliders: Sliders) => void;
  retirementGap?: number;
}

export default function AssumptionPanel({ profile, sliders, onChange, retirementGap }: Props) {
  const baseIncome = profile.income;

  const sliderDefs = [
    {
      key: 'income' as const,
      label: 'Annual Income',
      min: Math.round(baseIncome * 0.5),
      max: Math.round(baseIncome * 2.5),
      step: 5000,
      format: (v: number) => `$${(v / 1000).toFixed(0)}k`,
    },
    {
      key: 'growthRate' as const,
      label: 'Investment Growth Rate',
      min: 0,
      max: 12,
      step: 0.5,
      format: (v: number) => `${v}%`,
    },
    {
      key: 'incomeGrowth' as const,
      label: 'Annual Income Growth',
      min: 0,
      max: 8,
      step: 0.5,
      format: (v: number) => `${v}%`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="overflow-hidden"
    >
      <div className="bg-white border border-stone-200 rounded-2xl mx-4 mb-3 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Possibility Assumptions</p>
          {retirementGap !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-400">Retirement gap</span>
              <span className={`text-sm font-bold tabular-nums ${retirementGap > 0 ? 'text-[#D97706]' : 'text-[#00C896]'}`}>
                {retirementGap > 0 ? '+' : ''}${Math.abs(retirementGap).toLocaleString('en-CA')}
              </span>
            </div>
          )}
        </div>

        <div className="px-5 py-4 space-y-5">
          {sliderDefs.map(({ key, label, min, max, step, format }) => {
            const value = sliders[key];
            const pct = ((value - min) / (max - min)) * 100;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-stone-600">{label}</p>
                  <span className="text-sm font-bold text-stone-900 tabular-nums">{format(value)}</span>
                </div>
                <div className="relative h-1.5 bg-stone-200 rounded-full">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#00C896] rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange({ ...sliders, [key]: Number(e.target.value) })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-stone-400">{format(min)}</span>
                  <span className="text-[10px] text-stone-400">{format(max)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
