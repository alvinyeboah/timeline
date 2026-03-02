'use client';

import { motion, PanInfo } from 'framer-motion';
import { Goal } from '@/lib/types';
import { GOAL_ICONS, XIcon } from '@/components/ui/icons';

interface Props {
  goal: Goal;
  index: number;
  xPosition: number;
  yearWidth: number;
  minYear: number;
  maxYear: number;
  onDrop: (id: string, newYear: number) => void;
  onClick: (goal: Goal) => void;
  onDelete: (id: string) => void;
  isActive: boolean;
}

const GOAL_COLORS: Record<Goal['type'], string> = {
  real_estate: '#059669',
  education:   '#2563EB',
  travel:      '#D97706',
  retirement:  '#7C3AED',
  career:      '#EA580C',
  custom:      '#00C896',
};

// Three stagger heights for visual rhythm, matching the reference
const DASH_HEIGHTS = [18, 44, 28];

export default function GoalNode({
  goal,
  index,
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
  const color = GOAL_COLORS[goal.type];
  const dashHeight = DASH_HEIGHTS[index % DASH_HEIGHTS.length];
  const goalNum = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      drag="x"
      dragElastic={0.05}
      dragMomentum={false}
      dragSnapToOrigin={false}
      onDragEnd={handleDragEnd}
      onClick={() => onClick(goal)}
      whileDrag={{ scale: 1.06, zIndex: 50 }}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200, delay: index * 0.04 }}
      style={{ left: xPosition - 24, position: 'absolute', top: 36 }}
      className="cursor-grab active:cursor-grabbing select-none touch-none z-10 flex flex-col items-center"
    >
      {/* Dashed vertical line from bar down to circle */}
      <div
        style={{
          width: 2,
          height: dashHeight,
          backgroundImage: `repeating-linear-gradient(to bottom, ${isActive ? color : '#C4B8B0'} 0, ${isActive ? color : '#C4B8B0'} 4px, transparent 4px, transparent 8px)`,
        }}
      />

      {/* Circle with icon */}
      <div className="relative">
        {/* Delete badge */}
        {isActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }}
            className="absolute -top-1 -right-1 z-20 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors shadow-sm"
            aria-label="Delete goal"
          >
            <XIcon size={9} strokeWidth={2.5} className="text-white" />
          </motion.button>
        )}

        <motion.div
          animate={{ scale: isActive ? 1.1 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="rounded-full flex items-center justify-center shadow-sm"
          style={{
            width: 48,
            height: 48,
            backgroundColor: isActive ? color : color + 'D0',
          }}
        >
          <GoalIcon size={18} strokeWidth={1.5} className="text-white" />
        </motion.div>
      </div>

      {/* Goal number + name */}
      <div className="mt-2 text-center" style={{ width: 72 }}>
        <p className="text-[11px] font-bold text-stone-600 leading-none mb-0.5">{goalNum}</p>
        <p className="text-[9px] font-semibold text-stone-500 uppercase tracking-wide leading-tight line-clamp-2">
          {goal.name}
        </p>
      </div>
    </motion.div>
  );
}
