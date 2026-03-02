'use client';

import { Goal, ProjectionPoint } from '@/lib/types';
import { CURRENT_YEAR, PROJECTION_END_YEAR } from '@/lib/mock-data';
import GoalNode from './GoalNode';
import ProjectionChart from './ProjectionChart';

interface Props {
  goals: Goal[];
  projection: ProjectionPoint[];
  onGoalDrop: (id: string, newYear: number) => void;
  onGoalClick: (goal: Goal) => void;
  onGoalDelete: (id: string) => void;
  activeGoalId: string | null;
  showHypothetical?: boolean;
}

const YEAR_WIDTH = 80; // px per year
const YEARS = Array.from(
  { length: PROJECTION_END_YEAR - CURRENT_YEAR + 1 },
  (_, i) => CURRENT_YEAR + i
);
const TOTAL_WIDTH = YEARS.length * YEAR_WIDTH;

// Bar top = label row (28px). Bar height = 8px. Goal nodes start at 36px.
const LABEL_H = 28;
const BAR_H = 8;

export default function TimelineCanvas({
  goals,
  projection,
  onGoalDrop,
  onGoalClick,
  onGoalDelete,
  activeGoalId,
  showHypothetical,
}: Props) {
  const yearToX = (year: number) => (year - CURRENT_YEAR) * YEAR_WIDTH + YEAR_WIDTH / 2;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Projection Chart */}
      <div className="h-48 px-4 pt-3 bg-white">
        <ProjectionChart data={projection} hasGoals={goals.length > 0} showHypothetical={showHypothetical} />
      </div>

      {/* Horizontal scrollable strip */}
      <div
        className="flex-1 overflow-x-auto overflow-y-hidden border-t border-stone-100 relative bg-[#F5F4F0]"
        style={{ minHeight: 190 }}
      >
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        <div
          className="relative h-full hide-scrollbar"
          style={{ width: TOTAL_WIDTH, minHeight: 190 }}
        >
          {/* Year label row */}
          <div
            className="absolute top-0 left-0 flex"
            style={{ height: LABEL_H, width: TOTAL_WIDTH }}
          >
            {YEARS.map((year) => (
              <div
                key={year}
                style={{ width: YEAR_WIDTH }}
                className="flex justify-center items-center shrink-0"
              >
                <span className={`text-[11px] tabular-nums font-medium ${
                  year === CURRENT_YEAR ? 'text-[#00C896] font-bold' : 'text-stone-500'
                }`}>
                  {year}
                </span>
              </div>
            ))}
          </div>

          {/* Thick segmented bar */}
          <div
            className="absolute left-0 flex"
            style={{ top: LABEL_H, height: BAR_H, width: TOTAL_WIDTH }}
          >
            {YEARS.map((year, i) => (
              <div
                key={year}
                style={{ width: YEAR_WIDTH }}
                className={`shrink-0 h-full ${
                  year === CURRENT_YEAR
                    ? 'bg-[#00C896]/60'
                    : i % 2 === 0
                    ? 'bg-stone-400'
                    : 'bg-stone-300'
                }`}
              />
            ))}
          </div>

          {/* Goal nodes — anchored at bottom of bar */}
          {goals.map((goal, index) => (
            <GoalNode
              key={goal.id}
              goal={goal}
              index={index}
              xPosition={yearToX(goal.targetYear)}
              yearWidth={YEAR_WIDTH}
              minYear={CURRENT_YEAR + 1}
              maxYear={PROJECTION_END_YEAR}
              onDrop={onGoalDrop}
              onClick={onGoalClick}
              onDelete={onGoalDelete}
              isActive={activeGoalId === goal.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
