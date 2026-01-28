'use client';

import { useEffect, useState } from 'react';
import {
  ExternalLink,
  DollarSign,
  FileText,
  Users,
  Sparkles,
  Bell,
  TrendingUp,
  BookOpen,
  MessageCircle,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';
import { ApiClient } from '@/services/client';
import { PortfolioOverview, transformPortfolioOverview } from '@/types/portfolioOverview';

const formatUsd = (amount: number) =>
  `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

const RESOURCES = [
  {
    label: 'Funding Guide',
    href: 'https://drive.google.com/file/d/1VM8CueEvUhn4gZc3bNdrIRzSfZ9Tr8-j/view?usp=drive_link',
    icon: BookOpen,
  },
  {
    label: 'Talk to the Team',
    href: 'https://calendar.app.google/riCwbFUFaWavXfAn6',
    icon: MessageCircle,
  },
] as const;

function getStats(
  o: PortfolioOverview
): Array<{
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: string;
  valueColor?: string;
}> {
  return [
    {
      icon: DollarSign,
      iconColor: 'text-primary-500',
      label: 'Total distributed',
      value: formatUsd(o.totalDistributedUsd),
      valueColor: 'text-primary-600',
    },
    {
      icon: FileText,
      iconColor: 'text-gray-400',
      label: 'Active RFPs',
      value: `${o.activeRfps.active} / ${o.activeRfps.total}`,
    },
    {
      icon: Users,
      iconColor: 'text-gray-400',
      label: 'Total applicants',
      value: o.totalApplicants.toString(),
    },
    {
      icon: Sparkles,
      iconColor: 'text-orange-500',
      label: 'Matched funding',
      value: formatUsd(o.matchedFundingUsd),
      valueColor: 'text-orange-600',
    },
    {
      icon: Bell,
      iconColor: 'text-gray-400',
      label: 'Recent updates',
      value: o.recentUpdates.toString(),
    },
    {
      icon: TrendingUp,
      iconColor: 'text-green-500',
      label: 'Proposals funded',
      value: o.proposalsFunded.toString(),
    },
  ];
}

export function PortfolioRightSidebar() {
  const [overview, setOverview] = useState<PortfolioOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiClient.get<any>('/api/funding_dashboard/overview/')
      .then((raw) => setOverview(transformPortfolioOverview(raw)))
      .catch((err) => {
        console.error('Failed to fetch portfolio overview:', err);
        setError('Failed to load overview');
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Portfolio Overview</h3>
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)
          ) : error || !overview ? (
            <div className="flex items-center gap-2 py-4 text-gray-500">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error || 'Unable to load data'}</span>
            </div>
          ) : (
            getStats(overview).map(({ icon: Icon, iconColor, label, value, valueColor }) => (
              <div key={label} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                  <span className="text-sm">{label}</span>
                </div>
                <span className={`text-sm font-semibold ${valueColor || 'text-gray-900'}`}>
                  {value}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Resources</h3>
        <div className="space-y-3">
          {RESOURCES.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </div>
              <ExternalLink size={14} className="text-gray-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
