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

  return (
    <motion.div
      drag="x"
      dragElastic={0.05}
      dragMomentum={false}
      dragSnapToOrigin={false}
      onDragEnd={handleDragEnd}
      onClick={() => onClick(goal)}
      whileDrag={{ scale: 1.06, zIndex: 50 }}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      style={{ left: xPosition - 44, position: 'absolute', top: 8 }}
      className="cursor-grab active:cursor-grabbing select-none touch-none z-10"
    >
      <div className="flex flex-col items-center relative">
        {/* Delete badge */}
        {isActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }}
            className="absolute -top-1.5 -right-1.5 z-20 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors shadow-lg"
            aria-label="Delete goal"
          >
            <XIcon size={10} strokeWidth={2.5} className="text-white" />
          </motion.button>
        )}

        <div
          className={`w-[88px] px-2 py-3 rounded-2xl border text-center transition-colors ${
            isActive
              ? 'bg-[#00C896]/10 border-[#00C896]/50'
              : 'bg-[#161616] border-[#2A2A2A]'
          }`}
        >
          {/* Icon */}
          <div className={`flex justify-center mb-1.5 ${isActive ? 'text-[#00C896]' : 'text-[#6B7280]'}`}>
            <GoalIcon size={16} strokeWidth={1.5} />
          </div>

          {/* Name */}
          <p className="text-white text-[9px] font-semibold leading-tight line-clamp-2 tracking-wide uppercase">
            {goal.name}
          </p>

          {/* Year */}
          <p className={`text-[10px] mt-1.5 font-medium tabular-nums ${isActive ? 'text-[#00C896]' : 'text-[#6B7280]'}`}>
            {goal.targetYear}
          </p>
        </div>

        <div className={`w-px h-4 ${isActive ? 'bg-[#00C896]' : 'bg-[#2A2A2A]'}`} />
        <div
          className={`w-2 h-2 rounded-full border-2 ${
            isActive ? 'bg-[#00C896] border-[#00C896]' : 'bg-[#0D0D0D] border-[#4B5563]'
          }`}
        />
      </div>
    </motion.div>
  );
}
