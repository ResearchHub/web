'use client';

import {
  ExternalLink,
  Wallet,
  FileText,
  Users,
  Zap,
  Bell,
  TrendingUp,
  BookOpen,
  MessageCircle,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';
import { PortfolioOverview } from '@/types/portfolioOverview';
import { formatUsdCompact } from '@/utils/number';

const RESOURCES = [
  {
    label: 'Funding Guide',
    href: 'https://drive.google.com/file/d/1VM8CueEvUhn4gZc3bNdrIRzSfZ9Tr8-j/view',
    icon: BookOpen,
  },
  {
    label: 'Talk to the Team',
    href: 'https://calendar.app.google/riCwbFUFaWavXfAn6',
    icon: MessageCircle,
  },
] as const;

interface Stat {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  valueColor?: string;
}

const buildStats = (o: PortfolioOverview): Stat[] => [
  {
    icon: Wallet,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    label: 'Total distributed',
    value: formatUsdCompact(o.totalDistributedUsd),
    valueColor: 'text-orange-600',
  },
  {
    icon: FileText,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    label: 'Active RFPs',
    value: `${o.activeRfps.active} / ${o.activeRfps.total}`,
  },
  {
    icon: Users,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50',
    label: 'Total applicants',
    value: String(o.totalApplicants.total),
  },
  {
    icon: Zap,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-100',
    label: 'Matched funding',
    value: formatUsdCompact(o.matchedFundingUsd),
    valueColor: 'text-orange-600',
  },
  {
    icon: Bell,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
    label: 'Updates (30d)',
    value: String(o.recentUpdates),
  },
  {
    icon: TrendingUp,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    label: 'Proposals funded',
    value: String(o.proposalsFunded),
  },
];

interface Props {
  readonly overview: PortfolioOverview | null;
  readonly isLoading: boolean;
}

export function PortfolioRightSidebar({ overview, isLoading }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Portfolio Overview</h3>
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            Array.from({ length: 6 }, (_, i) => <StatSkeleton key={i} />)
          ) : !overview ? (
            <div className="flex items-center gap-2 py-4 text-gray-500">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Unable to load data</span>
            </div>
          ) : (
            buildStats(overview).map((s) => <StatRow key={s.label} {...s} />)
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
              <span className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {label}
              </span>
              <ExternalLink size={14} className="text-gray-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon: Icon, iconColor, iconBg, label, value, valueColor }: Stat) {
  return (
    <div className="flex items-center justify-between gap-2 py-2.5">
      <div className="flex items-center gap-3 text-gray-600 min-w-0">
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <span className="text-sm truncate">{label}</span>
      </div>
      <span className={`text-sm font-semibold whitespace-nowrap ${valueColor ?? 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-gray-200 rounded-lg animate-pulse" />
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
