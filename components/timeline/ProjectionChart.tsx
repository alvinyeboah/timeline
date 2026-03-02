'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { ProjectionPoint } from '@/lib/types';
import { CURRENT_YEAR } from '@/lib/mock-data';

interface Props {
  data: ProjectionPoint[];
  hasGoals: boolean;
  showHypothetical?: boolean;
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-lg px-3 py-2.5 text-xs">
      <p className="text-stone-400 font-medium mb-1.5">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-stone-500">
            {entry.name === 'baseNetWorth' ? 'Base case' : entry.name === 'adjustedNetWorth' ? 'With goals' : 'Possibility'}
          </span>
          <span className="text-stone-900 font-semibold ml-auto pl-4">
            ${Number(entry.value).toLocaleString('en-CA')}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ProjectionChart({ data, hasGoals, showHypothetical }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fill: '#A8A29E', fontSize: 10 }}
          axisLine={{ stroke: '#E7E5E4' }}
          tickLine={false}
          interval={4}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fill: '#A8A29E', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          x={CURRENT_YEAR}
          stroke="#00C896"
          strokeOpacity={0.4}
          strokeWidth={1.5}
        />

        {/* Base case — area fill */}
        <Area
          type="monotone"
          dataKey="baseNetWorth"
          stroke="#D6D3D1"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          fill="#F5F5F4"
          fillOpacity={0.6}
          dot={false}
          name="baseNetWorth"
        />

        {/* Adjusted (with goals) */}
        {hasGoals && (
          <Line
            type="monotone"
            dataKey="adjustedNetWorth"
            stroke="#00C896"
            strokeWidth={2}
            dot={false}
            name="adjustedNetWorth"
            activeDot={{ r: 4, fill: '#00C896', strokeWidth: 0 }}
          />
        )}

        {/* Hypothetical (Possibility mode) */}
        {showHypothetical && (
          <Line
            type="monotone"
            dataKey="hypotheticalNetWorth"
            stroke="#F59E0B"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            name="hypotheticalNetWorth"
            activeDot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
