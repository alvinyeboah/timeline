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
  education: '#2563EB',
  travel: '#D97706',
  retirement: '#7C3AED',
  career: '#EA580C',
  custom: '#00C896',
};

// Stagger: alternating stem lengths so circles hang at different heights
// Each pattern: [stemHeight, circleSize]
const STAGGER: [number, number][] = [
  [32, 56],
  [72, 80],
  [48, 64],
  [88, 72],
  [24, 56],
  [60, 68],
];

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
  const [stemHeight, circleSize] = STAGGER[index % STAGGER.length];
  const goalNum = String(index + 1).padStart(2, '0');
  const iconSize = Math.round(circleSize * 0.34);

  return (
    <motion.div
      drag="x"
      dragElastic={0.05}
      dragMomentum={false}
      dragSnapToOrigin={false}
      onDragEnd={handleDragEnd}
      onClick={() => onClick(goal)}
      whileDrag={{ scale: 1.06, zIndex: 50 }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200, delay: index * 0.06 }}
      style={{ left: xPosition - circleSize / 2, position: 'absolute', top: 36 }}
      className="cursor-grab active:cursor-grabbing select-none touch-none z-10 flex flex-col items-center"
    >
      {/* Dashed vertical stem */}
      <div
        style={{
          width: 1.5,
          height: stemHeight,
          backgroundImage: `repeating-linear-gradient(to bottom, ${isActive ? color : '#B0A898'} 0, ${isActive ? color : '#B0A898'} 4px, transparent 4px, transparent 8px)`,
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
            className="absolute -top-1.5 -right-1.5 z-20 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors shadow-md"
            aria-label="Delete goal"
          >
            <XIcon size={9} strokeWidth={2.5} className="text-white" />
          </motion.button>
        )}

        <motion.div
          animate={{ scale: isActive ? 1.08 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="rounded-full flex items-center justify-center shadow-md"
          style={{
            width: circleSize,
            height: circleSize,
            backgroundColor: isActive ? color : color + 'CC',
            boxShadow: isActive ? `0 4px 20px ${color}44` : '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <GoalIcon size={iconSize} strokeWidth={1.5} className="text-white" />
        </motion.div>
      </div>

      {/* Goal number + name card */}
      <div className="mt-3 text-left" style={{ width: Math.max(circleSize + 8, 80) }}>
        <p
          className="font-bold leading-none mb-1"
          style={{ fontSize: '18px', color: '#2C2420' }}
        >
          {goalNum}
        </p>
        <p
          className="font-semibold text-stone-600 leading-snug"
          style={{ fontSize: '10px' }}
        >
          {goal.name}
        </p>
        {goal.estimatedCost != null && (
          <p className="text-[9px] text-stone-400 mt-0.5 tabular-nums">
            ${goal.estimatedCost.toLocaleString('en-CA')}
          </p>
        )}
      </div>
    </motion.div>
  );
}
