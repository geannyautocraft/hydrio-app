import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';
import { useHydrationStore } from '../store/useHydrationStore';
import { getRecentDateKeys } from '../utils/date';
import { PremiumGate } from './PremiumGate';

type ChartView = 'weekly' | 'monthly' | 'trend';

function AdvancedChartsContent() {
  const [view, setView] = useState<ChartView>('weekly');
  const records = useHydrationStore((s) => s.records);
  const goalMl = useHydrationStore((s) => s.goalMl);

  const weeklyData = useMemo(() => {
    const keys = getRecentDateKeys(7).reverse();
    return keys.map((dateKey) => {
      const record = records[dateKey];
      const total = record ? record.totalMl : 0;
      const date = new Date(dateKey + 'T00:00:00');
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      return { dateKey, label, total, reached: total >= goalMl };
    });
  }, [records, goalMl]);

  const monthlyData = useMemo(() => {
    const keys = getRecentDateKeys(30).reverse();
    return keys.map((dateKey) => {
      const record = records[dateKey];
      const total = record ? record.totalMl : 0;
      const date = new Date(dateKey + 'T00:00:00');
      const label = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      return { dateKey, label, total, reached: total >= goalMl };
    });
  }, [records, goalMl]);

  const trendData = useMemo(() => {
    const keys = getRecentDateKeys(30).reverse();
    let runningTotal = 0;
    let count = 0;
    return keys.map((dateKey) => {
      const record = records[dateKey];
      const total = record ? record.totalMl : 0;
      if (total > 0) {
        runningTotal += total;
        count++;
      }
      const avg = count > 0 ? Math.round(runningTotal / count) : 0;
      const date = new Date(dateKey + 'T00:00:00');
      const label = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      return { dateKey, label, total, avg, goal: goalMl };
    });
  }, [records, goalMl]);

  const tabs: { key: ChartView; label: string }[] = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'trend', label: 'Trend' },
  ];

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
        Advanced Charts
      </h2>

      <div className="mb-3 flex gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              view === tab.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="h-52">
        {view === 'weekly' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}L` : `${v}`)} />
              <Tooltip formatter={(value: number) => [`${value} ml`, 'Intake']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <ReferenceLine y={goalMl} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {weeklyData.map((entry, index) => (
                  <Cell key={index} fill={entry.reached ? '#22c55e' : '#3b82f6'} fillOpacity={entry.total === 0 ? 0.2 : 0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {view === 'monthly' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}L` : `${v}`)} />
              <Tooltip formatter={(value: number) => [`${value} ml`, 'Intake']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <ReferenceLine y={goalMl} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />
              <Bar dataKey="total" radius={[2, 2, 0, 0]} maxBarSize={12}>
                {monthlyData.map((entry, index) => (
                  <Cell key={index} fill={entry.reached ? '#22c55e' : '#3b82f6'} fillOpacity={entry.total === 0 ? 0.1 : 0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {view === 'trend' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}L` : `${v}`)} />
              <Tooltip formatter={(value: number) => [`${value} ml`]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <ReferenceLine y={goalMl} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Goal', position: 'right', fontSize: 10, fill: '#f59e0b' }} />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={1.5} dot={false} opacity={0.4} />
              <Line type="monotone" dataKey="avg" stroke="#22c55e" strokeWidth={2} dot={false} name="Running Avg" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function AdvancedCharts() {
  return (
    <PremiumGate feature="advanced_charts">
      <AdvancedChartsContent />
    </PremiumGate>
  );
}
