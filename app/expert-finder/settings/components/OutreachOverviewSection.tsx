'use client';

import { Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { BaseSection } from '@/components/ui/BaseSection';
import { Tooltip } from '@/components/ui/Tooltip';
import { useExpertFinderOverview } from '@/hooks/useExpertFinder';
import type { ExpertFinderOverview } from '@/types/expertFinder';
import { cn } from '@/utils/styles';

function formatRate(rate: number | null): string {
  if (rate == null) return '—';
  const pct = rate * 100;
  return `${pct >= 10 || pct === 0 ? pct.toFixed(0) : pct.toFixed(1)}%`;
}

function formatCount(n: number): string {
  return n.toLocaleString();
}

interface MetricProps {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}

function Metric({ label, value, hint, className }: MetricProps) {
  const labelNode = hint ? (
    <Tooltip content={hint} position="top" width="w-56" className="text-left">
      <span className="cursor-help border-b border-dotted border-gray-400">{label}</span>
    </Tooltip>
  ) : (
    label
  );

  return (
    <div className={cn('min-w-0', className)}>
      <p className="text-xs font-medium text-gray-500">{labelNode}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900 tabular-nums">{value}</p>
    </div>
  );
}

function OverviewMetrics({ overview }: { overview: ExpertFinderOverview }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Metric
        label="Emails sent"
        value={formatCount(overview.emailsSent)}
        hint="Generated emails with status sent (not unique experts)."
      />
      <Metric
        label="Registered"
        value={formatCount(overview.expertsSignedUp)}
        hint="Experts in your searches who have a ResearchHub account linked."
      />
      <Metric
        label="Signup rate"
        value={formatRate(overview.summary.signupRate)}
        hint="Registered ÷ experts in searches (not registered ÷ emailed)."
      />
      <Metric
        label="Open rate"
        value={formatRate(overview.summary.openRate)}
        hint="Emails opened ÷ emails sent."
      />
    </div>
  );
}

export interface OutreachOverviewSectionProps {
  /** Scope metrics to searches created by this editor. Omit for all editors. */
  editorId?: number;
}

export function OutreachOverviewSection({ editorId }: OutreachOverviewSectionProps) {
  const [{ overview, isLoading, error }] = useExpertFinderOverview({
    editorId,
    immediate: true,
  });

  return (
    <BaseSection>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500 mt-1">
          Your outreach over the last 30 days
          {overview?.meta.filters.start && overview.meta.filters.end
            ? ` (${overview.meta.filters.start} → ${overview.meta.filters.end})`
            : ''}
          .
        </p>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {isLoading && !overview ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading overview…
        </div>
      ) : overview ? (
        <div className="space-y-4">
          <OverviewMetrics overview={overview} />
          <p className="text-xs text-gray-500">
            {formatCount(overview.expertsTotal)} experts in searches ·{' '}
            {formatCount(overview.emailsGenerated)} emails generated ·{' '}
            {formatCount(overview.proposalsOpened)} proposals opened
            {overview.summary.bounceRate != null
              ? ` · ${formatRate(overview.summary.bounceRate)} bounce rate`
              : ''}
          </p>
        </div>
      ) : null}
    </BaseSection>
  );
}
