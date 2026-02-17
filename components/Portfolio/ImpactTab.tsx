'use client';

import { Target, AlertCircle, TrendingUp, Users, Zap } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { useImpactData } from './lib/hooks/useImpactData';
import { ImpactData, Milestones } from '@/types/impactData';
import { formatNumber } from '@/utils/number';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const toUsd = (n: number) => `$${formatNumber(n)}`;
const formatMonth = (m: string) => {
  const [y, mo] = m.split('-');
  return new Date(+y, +mo - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export function ImpactTab({ userId }: { readonly userId?: number }) {
  const { data, isLoading, error } = useImpactData(userId);

  if (isLoading) return <ImpactSkeleton />;
  if (error || !data) {
    return (
      <div className="flex items-center gap-2 py-8 text-gray-500 justify-center">
        <AlertCircle className="w-5 h-5" />
        <span>{error ?? 'Unable to load impact data'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl font-bold text-gray-900">Your impact story</h2>
        <p className="text-gray-600 mt-1">
          A scoreboard of what your funding is enabling—and how it&apos;s growing.
        </p>
      </header>

      <MilestonesCard milestones={data.milestones} />
      <FundingChart data={data.fundingOverTime} />

      <TopicsCard topics={data.topicBreakdown} />
    </div>
  );
}

function Card({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>{children}</div>
  );
}

function MilestonesCard({ milestones }: { milestones: Milestones }) {
  const items = [
    {
      label: 'Funding contributed',
      ...milestones.fundingContributed,
      currency: true,
      color: 'bg-orange-400',
      icon: TrendingUp,
      iconColor: 'text-blue-500',
    },
    {
      label: 'Researchers supported',
      ...milestones.researchersSupported,
      currency: false,
      color: 'bg-green-500',
      icon: Users,
      iconColor: 'text-green-500',
    },
    {
      label: 'Matched funding',
      ...milestones.matchedFunding,
      currency: true,
      color: 'bg-orange-400',
      icon: Zap,
      iconColor: 'text-yellow-500',
    },
  ];

  return (
    <div className="rounded-xl p-6 border border-gray-200 bg-gradient-to-r from-blue-50/80 via-white to-teal-50/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Target className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Your milestones</h3>
          <p className="text-sm text-gray-500">Progress toward your next funding achievements</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map(({ label, current, target, currency, color, icon: Icon, iconColor }) => {
          const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
          const remaining = target - current;
          return (
            <div key={label}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${iconColor}`} />
                <p className="text-sm text-gray-600">{label}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {currency ? toUsd(current) : current}
                <span className="text-base font-normal text-gray-400 ml-1">
                  / {currency ? toUsd(target) : target}
                </span>
              </p>
              <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {currency ? toUsd(remaining) : `${remaining} more`} to next milestone
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FundingChart({ data }: { data: ImpactData['fundingOverTime'] }) {
  const chartData = {
    labels: data.map((d) => formatMonth(d.month)),
    datasets: [
      {
        label: 'Your contributions',
        data: data.map((d) => d.userContributions),
        fill: 'origin',
        backgroundColor: 'rgba(59, 130, 246, 0.4)',
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.4,
      },
      {
        label: 'Matched by others',
        data: data.map((d) => d.matchedContributions),
        fill: 'origin',
        backgroundColor: 'rgba(34, 197, 94, 0.3)',
        borderColor: 'rgb(34, 197, 94)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { usePointStyle: true, pointStyle: 'circle' },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: { callback: (v: number | string) => (+v >= 1000 ? `${+v / 1000}k` : v) },
      },
    },
  };

  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-1">Funding over time</h3>
      <p className="text-sm text-gray-500 mb-4">
        Cumulative contributions and matching from other funders
      </p>
      <Line data={chartData} options={options} />
    </Card>
  );
}

function TopicsCard({ topics }: { topics: ImpactData['topicBreakdown'] }) {
  const max = Math.max(...topics.map((t) => t.amountUsd), 1);
  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-1">Topic breakdown</h3>
      <p className="text-sm text-gray-500 mb-4">Where your funding is concentrated</p>
      <div className="space-y-4">
        {topics.map((t) => (
          <div key={t.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{t.name}</span>
              <span className="text-orange-500 font-medium">{toUsd(t.amountUsd)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${(t.amountUsd / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ImpactSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-80 bg-gray-200 rounded" />
      </div>
      <Card>
        <div className="h-5 w-32 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-32 bg-gray-200 rounded" />
              <div className="h-2 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </Card>
      <Card className="h-64" />
      <Card className="h-64" />
    </div>
  );
}
