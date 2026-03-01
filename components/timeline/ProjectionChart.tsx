'use client';

import {
  ResponsiveContainer,
  LineChart,
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
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export default function ProjectionChart({ data, hasGoals }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fill: '#4B5563', fontSize: 10 }}
          axisLine={{ stroke: '#2A2A2A' }}
          tickLine={false}
          interval={4}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fill: '#4B5563', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '12px',
            fontSize: '12px',
          }}
          labelStyle={{ color: '#9CA3AF' }}
          itemStyle={{ color: '#FFFFFF' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => [
            value != null ? `$${Number(value).toLocaleString('en-CA')}` : '$0',
            name === 'baseNetWorth' ? 'Base case' : 'With your goals',
          ]}
        />
        <ReferenceLine
          x={CURRENT_YEAR}
          stroke="#00C896"
          strokeDasharray="4 2"
          strokeOpacity={0.5}
        />
        {/* Base case line */}
        <Line
          type="monotone"
          dataKey="baseNetWorth"
          stroke="#2A2A2A"
          strokeWidth={2}
          dot={false}
          name="baseNetWorth"
        />
        {/* Adjusted line (only when goals exist) */}
        {hasGoals && (
          <Line
            type="monotone"
            dataKey="adjustedNetWorth"
            stroke="#00C896"
            strokeWidth={2.5}
            dot={false}
            name="adjustedNetWorth"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
