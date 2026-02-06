'use client';

import { Target, AlertCircle, Building2 } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { useImpactData } from './lib/hooks/useImpactData';
import { ImpactData, Milestones } from '@/types/impactData';
import { formatNumber } from '@/utils/number';
import { pluralizeSuffix } from '@/utils/stringUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend
);

const toUsd = (n: number) => `$${formatNumber(n)}`;
const formatMonth = (m: string) => {
  const [y, mo] = m.split('-');
  return new Date(+y, +mo - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export function ImpactTab() {
  const { data, isLoading, error } = useImpactData();

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopicsCard topics={data.topicBreakdown} />
        <FrequencyCard buckets={data.updateFrequency} />
      </div>

      <InstitutionsCard institutions={data.institutionsSupported} />
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
      color: 'bg-orange-500',
    },
    {
      label: 'Researchers supported',
      ...milestones.researchersSupported,
      currency: false,
      color: 'bg-green-500',
    },
    {
      label: 'Matched funding',
      ...milestones.matchedFunding,
      currency: true,
      color: 'bg-green-500',
    },
  ];

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
          <Target className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Your milestones</h3>
          <p className="text-sm text-gray-500">Progress toward your next funding achievements</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map(({ label, current, target, currency, color }) => {
          const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
          const remaining = target - current;
          return (
            <div key={label}>
              <p className="text-sm text-gray-600 mb-2">{label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {currency ? toUsd(current) : current}
                <span className="text-base font-normal text-gray-400 ml-1">
                  / {currency ? toUsd(target) : target}
                </span>
              </p>
              <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {currency ? toUsd(remaining) : remaining} to next milestone
              </p>
            </div>
          );
        })}
      </div>
    </Card>
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
      y: {
        beginAtZero: true,
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
              <span className="text-primary-600 font-medium">{toUsd(t.amountUsd)}</span>
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

function FrequencyCard({ buckets }: { buckets: ImpactData['updateFrequency'] }) {
  const chartData = {
    labels: buckets.map((b) => b.bucket),
    datasets: [{ data: buckets.map((b) => b.count), backgroundColor: '#3b82f6', borderRadius: 4 }],
  };
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 0.5 } } },
  };

  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-1">Update frequency (last 180 days)</h3>
      <p className="text-sm text-gray-500 mb-4">How consistently proposals publish updates</p>
      <Bar data={chartData} options={options} />
      <p className="text-xs text-gray-500 mt-3">
        Buckets show updates per proposal over the last 6 months.
      </p>
    </Card>
  );
}

function InstitutionsCard({ institutions }: { institutions: ImpactData['institutionsSupported'] }) {
  const total = institutions.reduce((sum, i) => sum + i.amountUsd, 0);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-gray-400" />
        <h3 className="font-semibold text-gray-900">Institutions supported</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Nonprofits that received funding through your contributions
      </p>
      <div className="divide-y divide-gray-100">
        {institutions.map((inst) => (
          <div key={inst.ein || inst.name} className="py-4 flex justify-between items-start">
            <div>
              <span className="font-medium text-gray-900">{inst.name}</span>
              {inst.ein && <p className="text-sm text-gray-500">EIN: {inst.ein}</p>}
            </div>
            <div className="text-right">
              <div className="text-primary-600 font-medium">{toUsd(inst.amountUsd)}</div>
              <div className="text-sm text-gray-500">
                {inst.projectCount} project{pluralizeSuffix(inst.projectCount)}
              </div>
            </div>
          </div>
        ))}
      </div>
      {institutions.length > 0 && (
        <div className="flex justify-between pt-4 border-t border-gray-200 mt-4">
          <span className="font-medium text-gray-900">Total to institutions</span>
          <span className="text-primary-600 font-semibold">{toUsd(total)}</span>
        </div>
      )}
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
      <div className="grid grid-cols-2 gap-6">
        <Card className="h-64" />
        <Card className="h-64" />
      </div>
    </div>
  );
}
