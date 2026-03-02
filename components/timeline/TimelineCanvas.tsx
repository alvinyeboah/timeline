'use client';

import { Goal, ProjectionPoint } from '@/lib/types';
import { CURRENT_YEAR, PROJECTION_END_YEAR } from '@/lib/mock-data';
import YearMarker from './YearMarker';
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
        className="flex-1 overflow-x-auto overflow-y-hidden border-t border-stone-200 relative bg-white"
        style={{ minHeight: 144 }}
      >
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        <div
          className="relative h-full hide-scrollbar"
          style={{ width: TOTAL_WIDTH, minHeight: 144 }}
        >
          {/* Year markers */}
          <div className="absolute bottom-0 left-0 right-0 flex border-t border-stone-200">
            {YEARS.map((year) => (
              <div
                key={year}
                style={{ width: YEAR_WIDTH }}
                className="flex justify-center pt-2 pb-3 shrink-0"
              >
                <YearMarker year={year} isNow={year === CURRENT_YEAR} />
              </div>
            ))}
          </div>

          {/* Goal nodes */}
          {goals.map((goal) => (
            <GoalNode
              key={goal.id}
              goal={goal}
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

          {/* "Now" vertical line */}
          <div
            className="absolute top-0 bottom-8 w-px bg-[#00C896]/30"
            style={{ left: yearToX(CURRENT_YEAR) }}
          />
        </div>
      </div>
    </div>
  );
}
