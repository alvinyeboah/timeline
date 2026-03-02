'use client';

import { motion, PanInfo } from 'framer-motion';
import { Goal } from '@/lib/types';
import { GOAL_ICONS, XIcon } from '@/components/ui/icons';

interface Props {
  goal: Goal;
  xPosition: number;
  yearWidth: number;
  minYear: number;
  maxYear: number;
  onDrop: (id: string, newYear: number) => void;
  onClick: (goal: Goal) => void;
  onDelete: (id: string) => void;
  isActive: boolean;
}

const GOAL_ICON_COLORS: Record<Goal['type'], string> = {
  real_estate: '#059669',   // emerald
  education:   '#2563EB',   // blue
  travel:      '#D97706',   // amber
  retirement:  '#7C3AED',   // violet
  career:      '#EA580C',   // orange
  custom:      '#00C896',   // green
};

export default function GoalNode({
  goal,
  xPosition,
  yearWidth,
  minYear,
  maxYear,
  onDrop,
  onClick,
  onDelete,
  isActive,
}: Props) {
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const deltaYears = Math.round(info.offset.x / yearWidth);
    const newYear = Math.max(minYear, Math.min(maxYear, goal.targetYear + deltaYears));
    if (newYear !== goal.targetYear) onDrop(goal.id, newYear);
  };

  const GoalIcon = GOAL_ICONS[goal.type as keyof typeof GOAL_ICONS] ?? GOAL_ICONS.custom;
  const iconColor = GOAL_ICON_COLORS[goal.type];

  return (
    <motion.div
      drag="x"
      dragElastic={0.05}
      dragMomentum={false}
      dragSnapToOrigin={false}
      onDragEnd={handleDragEnd}
      onClick={() => onClick(goal)}
      whileDrag={{ scale: 1.06, zIndex: 50 }}
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      style={{ left: xPosition - 48, position: 'absolute', top: 8 }}
      className="cursor-grab active:cursor-grabbing select-none touch-none z-10"
    >
      <div className="flex flex-col items-center relative">
        {/* Delete badge */}
        {isActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }}
            className="absolute -top-1.5 -right-1.5 z-20 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors shadow-md"
            aria-label="Delete goal"
          >
            <XIcon size={10} strokeWidth={2.5} className="text-white" />
          </motion.button>
        )}

        {/* Node card — 96px wide */}
        <div
          className={`w-24 px-2 py-3 rounded-2xl border text-center transition-all ${
            isActive
              ? 'bg-[#00C896]/5 border-[#00C896] shadow-md'
              : 'bg-white border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300'
          }`}
        >
          {/* Icon */}
          <div className="flex justify-center mb-1.5" style={{ color: iconColor }}>
            <GoalIcon size={16} strokeWidth={1.5} />
          </div>

          {/* Name */}
          <p className="text-stone-700 text-[9px] font-semibold leading-tight line-clamp-2 tracking-wide uppercase">
            {goal.name}
          </p>

          {/* Year pill */}
          <div className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-medium mt-1.5 tabular-nums ${
            isActive ? 'bg-[#00C896]/10 text-[#00C896]' : 'bg-stone-100 text-stone-500'
          }`}>
            {goal.targetYear}
          </div>
        </div>

        {/* Connector */}
        <div className={`w-px h-4 ${isActive ? 'bg-[#00C896]' : 'bg-stone-300'}`} />
        <div
          className={`w-2 h-2 rounded-full border-2 ${
            isActive ? 'bg-[#00C896] border-[#00C896]' : 'bg-[#F5F4F0] border-stone-300'
          }`}
        />
      </div>
    </motion.div>
  );
}
