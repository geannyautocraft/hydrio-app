import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useHydrationStore } from '../store/useHydrationStore';
import { getRecentDateKeys } from '../utils/date';

export function WeeklyChart() {
  const records = useHydrationStore((s) => s.records);
  const goalMl = useHydrationStore((s) => s.goalMl);

  const data = useMemo(() => {
    const keys = getRecentDateKeys(7).reverse();
    return keys.map((dateKey) => {
      const record = records[dateKey];
      const total = record
        ? record.entries.reduce((sum, e) => sum + e.amount, 0)
        : 0;
      const date = new Date(dateKey + 'T00:00:00');
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      return { dateKey, label, total, reached: total >= goalMl };
    });
  }, [records, goalMl]);

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
        Weekly Overview
      </h2>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}L` : `${v}`)}
            />
            <ReferenceLine
              y={goalMl}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: 'Goal',
                position: 'right',
                fontSize: 10,
                fill: '#f59e0b',
              }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={32}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.reached ? '#22c55e' : '#3b82f6'}
                  fillOpacity={entry.total === 0 ? 0.2 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
