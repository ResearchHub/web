'use client';

import { useEffect, useState } from 'react';
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
import { ApiClient } from '@/services/client';
import { ImpactData, Milestones, transformImpactData } from '@/types/impactData';

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

const formatUsd = (n: number) => `$${n.toLocaleString()}`;

const formatMonth = (yyyyMm: string) => {
  const [year, month] = yyyyMm.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export function ImpactTab() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiClient.get<any>('/api/fundraise/funding_impact/')
      .then((raw) => setData(transformImpactData(raw)))
      .catch((err) => {
        console.error('Failed to fetch impact data:', err);
        setError('Failed to load impact data');
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <ImpactSkeleton />;

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 py-8 text-gray-500 justify-center">
        <AlertCircle className="w-5 h-5" />
        <span>{error || 'Unable to load impact data'}</span>
      </div>
    );
  }

  const totalToInstitutions = data.institutionsSupported.reduce((sum, i) => sum + i.amountUsd, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your impact story</h2>
        <p className="text-gray-600 mt-1">
          A scoreboard of what your funding is enabling—and how it&apos;s growing.
        </p>
      </div>

      <MilestonesCard milestones={data.milestones} />
      <FundingChart data={data.fundingOverTime} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopicBreakdownCard topics={data.topicBreakdown} />
        <UpdateFrequencyCard buckets={data.updateFrequency} />
      </div>

      <InstitutionsCard institutions={data.institutionsSupported} total={totalToInstitutions} />
    </div>
  );
}

function MilestonesCard({ milestones }: { milestones: Milestones }) {
  const items = [
    {
      label: 'Funding contributed',
      ...milestones.fundingContributed,
      isCurrency: true,
      color: 'bg-orange-500',
    },
    {
      label: 'Researchers supported',
      ...milestones.researchersSupported,
      isCurrency: false,
      color: 'bg-green-500',
    },
    {
      label: 'Matched funding',
      ...milestones.matchedFunding,
      isCurrency: true,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
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
        {items.map(({ label, current, target, isCurrency, color }) => {
          const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
          const toNext = target - current;
          const toNextLabel = isCurrency
            ? `${formatUsd(toNext)} to next milestone`
            : `${toNext} more to next milestone`;

          return (
            <div key={label}>
              <div className="text-sm text-gray-600 mb-2">{label}</div>
              <div className="text-2xl font-bold text-gray-900">
                {isCurrency ? formatUsd(current) : current}
                <span className="text-base font-normal text-gray-400 ml-1">
                  / {isCurrency ? formatUsd(target) : target}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{toNextLabel}</p>
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
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v: number | string) =>
            typeof v === 'number' && v >= 1000 ? `${v / 1000}k` : v,
        },
      },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-semibold text-gray-900 mb-1">Funding over time</h3>
      <p className="text-sm text-gray-500 mb-4">
        Cumulative contributions and matching from other funders
      </p>
      <Line data={chartData} options={options} />
    </div>
  );
}

function TopicBreakdownCard({ topics }: { topics: ImpactData['topicBreakdown'] }) {
  const maxAmount = Math.max(...topics.map((t) => t.amountUsd), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-semibold text-gray-900 mb-1">Topic breakdown</h3>
      <p className="text-sm text-gray-500 mb-4">Where your funding is concentrated</p>
      <div className="space-y-4">
        {topics.map((t) => (
          <div key={t.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{t.name}</span>
              <span className="text-primary-600 font-medium">{formatUsd(t.amountUsd)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${(t.amountUsd / maxAmount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpdateFrequencyCard({ buckets }: { buckets: ImpactData['updateFrequency'] }) {
  const chartData = {
    labels: buckets.map((b) => b.bucket),
    datasets: [
      {
        data: buckets.map((b) => b.count),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 0.5 } },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-semibold text-gray-900 mb-1">Update frequency (last 180 days)</h3>
      <p className="text-sm text-gray-500 mb-4">
        How consistently proposals in your portfolio publish updates
      </p>
      <Bar data={chartData} options={options} />
      <p className="text-xs text-gray-500 mt-3">
        Buckets show the number of author updates per proposal over the last 6 months.
      </p>
    </div>
  );
}

function InstitutionsCard({
  institutions,
  total,
}: {
  institutions: ImpactData['institutionsSupported'];
  total: number;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-gray-400" />
        <h3 className="font-semibold text-gray-900">Institutions supported</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Nonprofit research institutions that received funding through your contributions
      </p>
      <div className="divide-y divide-gray-100">
        {institutions.map((inst) => (
          <div key={inst.ein || inst.name} className="py-4 flex justify-between items-start">
            <div>
              <span className="font-medium text-gray-900">{inst.name}</span>
              {inst.ein && <p className="text-sm text-gray-500">EIN: {inst.ein}</p>}
            </div>
            <div className="text-right">
              <div className="text-primary-600 font-medium">{formatUsd(inst.amountUsd)}</div>
              <div className="text-sm text-gray-500">
                {inst.projectCount} {inst.projectCount === 1 ? 'project' : 'projects'}
              </div>
            </div>
          </div>
        ))}
      </div>
      {institutions.length > 0 && (
        <div className="flex justify-between pt-4 border-t border-gray-200 mt-4">
          <span className="font-medium text-gray-900">Total to institutions</span>
          <span className="text-primary-600 font-semibold">{formatUsd(total)}</span>
        </div>
      )}
    </div>
  );
}

function ImpactSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-80 bg-gray-200 rounded" />
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="h-5 w-32 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-2 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 h-64" />
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-64" />
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-64" />
      </div>
    </div>
  );
}
