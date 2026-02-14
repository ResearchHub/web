'use client';

import { useState } from 'react';
import {
  ExternalLink,
  Zap,
  Bell,
  TrendingUp,
  BookOpen,
  MessageCircle,
  AlertCircle,
  Calendar,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';
import { GrantOverview } from '@/types/grantOverview';
import { formatUsdCompact } from '@/utils/number';
import { format, addDays } from 'date-fns';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { GrantService } from '@/services/grant.service';

// --- Quick Stats ---

interface Stat {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  valueColor?: string;
}

const buildStats = (o: GrantOverview): Stat[] => [
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
    label: 'Updates received',
    value: String(o.updatesReceived),
  },
  {
    icon: TrendingUp,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    label: 'Proposals funded',
    value: String(o.proposalsFunded),
  },
];

// --- Resources ---

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

// --- Funder Tips ---

const FUNDER_TIPS = [
  'Review applicants regularly to keep your RFP active',
  'Request monthly updates to track funded project progress',
  'Engage with researchers in the discussion tab',
] as const;

// --- Component ---

interface Props {
  readonly overview: GrantOverview | null;
  readonly isLoading: boolean;
  readonly postId: number | null;
  readonly onDeadlineExtended?: () => void;
}

export function RfpRightSidebar({ overview, isLoading, postId, onDeadlineExtended }: Props) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Stats</h3>

        {/* Budget progress */}
        {isLoading ? (
          <BudgetSkeleton />
        ) : overview ? (
          <BudgetBar used={overview.budgetUsedUsd} total={overview.budgetTotalUsd} />
        ) : null}

        {/* Stat rows */}
        <div className="mt-3">
          {isLoading ? (
            Array.from({ length: 4 }, (_, i) => <StatSkeleton key={i} />)
          ) : !overview ? (
            <div className="flex items-center gap-2 py-4 text-gray-500">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Unable to load data</span>
            </div>
          ) : (
            <>
              {buildStats(overview).map((s) => (
                <StatRow key={s.label} {...s} />
              ))}
              <DeadlineRow
                deadline={overview.deadline}
                postId={postId}
                onExtended={onDeadlineExtended}
              />
            </>
          )}
        </div>
      </div>

      {/* Resources */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
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

      {/* Funder Tips */}
      <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Funder Tips</h3>
        <ul className="space-y-2">
          {FUNDER_TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// --- Sub-components ---

function BudgetBar({ used, total }: { readonly used: number; readonly total: number }) {
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600 font-medium">Budget Used</span>
        <span className="font-semibold text-gray-900">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-sm mt-1.5 text-gray-600">
        <span className="font-semibold text-gray-900">{formatUsdCompact(used)}</span>
        <span>of&nbsp;&nbsp;{formatUsdCompact(total)}</span>
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

function BudgetSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full animate-pulse" />
      <div className="flex items-center justify-between mt-1.5">
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
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

// --- Deadline Row with extend dropdown ---

const EXTEND_OPTIONS = [7, 14, 30] as const;

function DeadlineRow({
  deadline,
  postId,
  onExtended,
}: {
  readonly deadline: string | null;
  readonly postId: number | null;
  readonly onExtended?: () => void;
}) {
  const [isExtending, setIsExtending] = useState(false);
  const deadlineDate = deadline ? new Date(deadline) : null;
  const displayDate = deadlineDate ? format(deadlineDate, 'M/d/yyyy') : '—';

  const handleExtend = async (days: number) => {
    if (!deadlineDate || !postId) return;

    setIsExtending(true);
    try {
      const newDate = addDays(deadlineDate, days);
      await GrantService.extendDeadline(postId, newDate.toISOString());
      onExtended?.();
    } catch (error) {
      console.error('Failed to extend deadline:', error);
    } finally {
      setIsExtending(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-2.5">
      {deadlineDate ? (
        <BaseMenu
          trigger={
            <button
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 cursor-pointer hover:bg-blue-50 transition-colors"
              disabled={isExtending}
            >
              <Calendar className="w-4 h-4 text-blue-500" />
            </button>
          }
          align="start"
        >
          {EXTEND_OPTIONS.map((days) => (
            <BaseMenuItem
              key={days}
              onSelect={() => handleExtend(days)}
              className="flex items-center justify-between gap-4 px-3 py-2 cursor-pointer"
            >
              <span>Extend by {days} days</span>
              <span className="flex items-center gap-1 text-gray-400 text-xs">
                <ArrowRight className="w-3 h-3" />
                {format(addDays(deadlineDate, days), 'M/d/yyyy')}
              </span>
            </BaseMenuItem>
          ))}
        </BaseMenu>
      ) : (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4 text-blue-500" />
        </div>
      )}
      <span className="text-sm text-gray-600">
        Deadline:{' '}
        <span className="font-semibold text-gray-900">
          {isExtending ? 'Extending...' : displayDate}
        </span>
      </span>
    </div>
  );
}
