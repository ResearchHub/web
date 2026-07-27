'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Clock,
  FileText,
  HandCoins,
  Inbox,
  Star,
} from 'lucide-react';
import { FundingActivityFeed } from './FundingActivityFeed';
import {
  getContribution,
  getDocumentInfo,
  getEntryMeta,
  getFundraiseAmounts,
  getFundraiseMetaLabel,
  getGrantAmount,
  getGrantMetaLabel,
  getReviewScore,
  resolveDisplayedContribution,
} from '@/components/Activity/lib/feedEntryAdapters';
import { ActivityCardSkeletonList } from '@/components/Activity/ActivityCardSkeleton';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrency } from '@/utils/currency';
import { formatTimeAgoShort } from '@/utils/date';
import { getRemainingDays } from '@/utils/date';
import { DEMO_SPENDING_POWER } from '@/mocks/demo-fixtures/spending-power';
import { cn } from '@/utils/styles';
import type { FeedEntry, FeedGrantContent } from '@/types/feed';

/** Beyond this many days out, an RFP deadline isn't worth an action item. */
const CLOSING_SOON_DAYS = 21;
/** Unbounded sections are capped so the tab stays a triage surface. */
const PREVIEW_LIMIT = 3;

interface MyFundingTabProps {
  entries: FeedEntry[];
  isLoading: boolean;
  /** Leaves the funder surface for the marketplace feed. */
  onBrowseOpportunities: () => void;
}

/**
 * "My funding" — one destination that answers the four questions a funder
 * actually arrives with: what needs me, where do I stand, what did I back, and
 * what's next.
 *
 * The structural rule is that every section is bounded. Airbnb's Today tab
 * works because each of its blocks has a ceiling; a dashboard that ends in an
 * infinite scroll buries everything below the fold. So the two unbounded
 * streams here — activity and open proposals — are capped at a short preview
 * that drills into the real feed, and only the genuinely finite sections (your
 * commitments) render in full.
 */
export function MyFundingTab({ entries, isLoading, onBrowseOpportunities }: MyFundingTabProps) {
  const [view, setView] = useState<'overview' | 'activity'>('overview');
  const stakes = entries.filter((entry) => entry.isViewerStake);
  const myRfps = stakes.filter((entry) => entry.contentType === 'GRANT');
  const backed = stakes.filter((entry) => entry.contentType !== 'GRANT');
  const actionItems = getActionItems(myRfps, backed);

  const opportunities = entries
    .filter((entry) => !entry.isViewerStake && getDocumentInfo(entry).ctaLabel === 'Fund')
    .filter(dedupeByTitle())
    .slice(0, PREVIEW_LIMIT);

  if (isLoading) {
    return (
      <div className="py-4">
        <ActivityCardSkeletonList />
      </div>
    );
  }

  if (view === 'activity') {
    return (
      <div className="pb-8">
        <FundingSummaryBar activeCount={stakes.length} />
        <button
          type="button"
          onClick={() => setView('overview')}
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={14} />
          My funding
        </button>
        <FundingActivityFeed entries={stakes} isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <FundingSummaryBar activeCount={stakes.length} />

      <div className="space-y-7 pt-5">
        {actionItems.length > 0 && (
          <Section title="Needs you">
            <div className="space-y-2">
              {actionItems.map((item) => (
                <ActionItemRow key={item.id} item={item} />
              ))}
            </div>
          </Section>
        )}

        {myRfps.length > 0 && (
          <Section title="Your RFPs">
            <div className="space-y-2">
              {myRfps.map((entry) => (
                <RfpRow key={entry.id} entry={entry} />
              ))}
            </div>
          </Section>
        )}

        {backed.length > 0 && (
          <Section title="Proposals you backed">
            <div className="space-y-2">
              {backed.map((entry) => (
                <BackedRow key={entry.id} entry={entry} />
              ))}
            </div>
          </Section>
        )}

        {stakes.length > 0 && (
          <Section
            title="Recent activity"
            action={{ label: 'See all', onClick: () => setView('activity') }}
          >
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              {stakes.slice(0, PREVIEW_LIMIT).map((entry) => (
                <ActivityLine key={entry.id} entry={entry} />
              ))}
            </div>
          </Section>
        )}

        {opportunities.length > 0 && (
          <Section
            title="Opportunities for you"
            action={{ label: 'Browse all', onClick: onBrowseOpportunities }}
          >
            <div className="space-y-2">
              {opportunities.map((entry) => (
                <OpportunityRow key={entry.id} entry={entry} />
              ))}
            </div>
          </Section>
        )}

        {stakes.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
            <p className="text-sm text-gray-500">
              Nothing here yet — open an RFP or fund a proposal and it will show up here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Position summary. Sticks below the top bar so the number you're spending
 * against stays on screen while you scroll the sections underneath it.
 */
function FundingSummaryBar({ activeCount }: { activeCount: number }) {
  const { showUSD } = useCurrencyPreference();

  const fmt = (usd: number, rsc: number) =>
    formatCurrency({
      amount: showUSD ? usd : rsc,
      showUSD,
      exchangeRate: 1,
      skipConversion: true,
      shorten: true,
    });

  const available = fmt(
    DEMO_SPENDING_POWER.totalUsd,
    DEMO_SPENDING_POWER.balanceRsc + DEMO_SPENDING_POWER.creditsRsc
  );
  const deployed = fmt(DEMO_SPENDING_POWER.fundedToDateUsd, DEMO_SPENDING_POWER.fundedToDateRsc);

  return (
    // Sticky offsets resolve against the scroll container's content box, and
    // that container drops to 48px of top padding once scrolled. These make up
    // the rest of the fixed top bar's height: 64px on mobile, 70px above it.
    <div className="sticky top-4 z-20 -mx-4 flex items-center gap-5 border-b border-gray-200 bg-white/95 px-4 py-2.5 backdrop-blur tablet:!top-[22px]">
      <SummaryStat label="Available" value={available} />
      <SummaryStat label="Deployed" value={deployed} />
      <SummaryStat label="Active" value={String(activeCount)} />
      <Link
        href="/researchcoin?action=deposit"
        className="ml-auto shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-gray-800 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
      >
        Deposit
      </Link>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="font-mono text-[15px] font-bold leading-tight text-gray-900">{value}</p>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; onClick: () => void };
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h2>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            {action.label}
            <ArrowRight size={13} />
          </button>
        )}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

interface ActionItem {
  id: string;
  title: string;
  prompt: string;
  href?: string;
  tone: 'review' | 'deadline' | 'update';
}

/**
 * Airbnb's Today tab leads with time-sensitive alerts because a dashboard's job
 * is to surface decisions, not to summarise. These are the funder equivalents:
 * proposals waiting on your call, RFPs about to close, and reviews landing on
 * things you paid for.
 */
function getActionItems(myRfps: FeedEntry[], backed: FeedEntry[]): ActionItem[] {
  const items: ActionItem[] = [];

  for (const entry of myRfps) {
    const { title, href } = getEntryMeta(entry);
    if (!title) continue;
    const grant = (entry.content as FeedGrantContent).grant;

    const applicantCount = grant?.applicants?.length ?? 0;
    if (applicantCount > 0) {
      items.push({
        id: `${entry.id}-applicants`,
        title,
        prompt: `${applicantCount} proposal${applicantCount === 1 ? '' : 's'} waiting on your decision`,
        href,
        tone: 'review',
      });
    }

    const daysLeft = getRemainingDays(grant?.endDate ?? null);
    if (daysLeft !== null && daysLeft <= CLOSING_SOON_DAYS) {
      const whole = Math.max(0, Math.floor(daysLeft));
      items.push({
        id: `${entry.id}-closing`,
        title,
        prompt: whole < 1 ? 'Closes today' : `Closes in ${whole} day${whole === 1 ? '' : 's'}`,
        href,
        tone: 'deadline',
      });
    }
  }

  for (const entry of backed) {
    const score = getReviewScore(entry);
    if (score == null) continue;
    const { title, href } = getEntryMeta(entry);
    if (!title) continue;
    items.push({
      id: `${entry.id}-review`,
      title,
      prompt: `New peer review scored ${score.toFixed(1)}`,
      href,
      tone: 'update',
    });
  }

  return items.slice(0, PREVIEW_LIMIT);
}

const ACTION_TONES: Record<ActionItem['tone'], { icon: typeof Inbox; className: string }> = {
  review: { icon: Inbox, className: 'bg-primary-50 text-primary-600' },
  deadline: { icon: Clock, className: 'bg-amber-50 text-amber-600' },
  update: { icon: Star, className: 'bg-emerald-50 text-emerald-600' },
};

function ActionItemRow({ item }: { item: ActionItem }) {
  const { icon: Icon, className } = ACTION_TONES[item.tone];

  return (
    <Row href={item.href} icon={<Icon size={17} />} iconClassName={className}>
      <span className="block text-sm font-semibold leading-snug text-gray-900">{item.prompt}</span>
      <span className="mt-0.5 line-clamp-1 block text-xs text-gray-500">{item.title}</span>
    </Row>
  );
}

function RfpRow({ entry }: { entry: FeedEntry }) {
  const { showUSD } = useCurrencyPreference();
  const { title, href } = getEntryMeta(entry);
  if (!title) return null;

  const amount = getGrantAmount(entry);
  const amountLabel = amount
    ? formatCurrency({
        amount: showUSD ? amount.usd : amount.rsc,
        showUSD,
        exchangeRate: 1,
        skipConversion: true,
        shorten: true,
      })
    : null;

  return (
    <Row
      href={href}
      icon={<HandCoins size={17} />}
      iconClassName="bg-emerald-50 text-emerald-600"
      trailing={
        amountLabel && (
          <span className="rounded bg-green-100 px-1.5 py-0.5 font-mono text-[13px] font-semibold leading-tight text-green-800">
            {amountLabel}
          </span>
        )
      }
    >
      <span className="line-clamp-2 block text-sm font-medium leading-snug text-gray-900">
        {title}
      </span>
      <span className="mt-0.5 block text-xs text-gray-500">{getGrantMetaLabel(entry)}</span>
    </Row>
  );
}

/**
 * A backed proposal is a position, so it leads with progress toward the goal
 * rather than with whatever happened most recently.
 */
function BackedRow({ entry }: { entry: FeedEntry }) {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { title, href } = getEntryMeta(entry);
  if (!title) return null;

  const { goalUsd, raisedUsd } = getFundraiseAmounts(entry);
  const percent = goalUsd > 0 ? Math.min(100, Math.round((raisedUsd / goalUsd) * 100)) : null;

  const contribution = getContribution(entry);
  let yourStake: string | null = null;
  if (contribution) {
    const { amount, inUSD } = resolveDisplayedContribution(contribution, showUSD, exchangeRate);
    yourStake = formatCurrency({
      amount,
      showUSD: inUSD,
      exchangeRate: 1,
      skipConversion: true,
      shorten: true,
    });
  }

  return (
    <Row
      href={href}
      icon={<HandCoins size={17} />}
      iconClassName="bg-primary-50 text-primary-600"
      trailing={
        yourStake && (
          <span className="rounded bg-green-100 px-1.5 py-0.5 font-mono text-[13px] font-semibold leading-tight text-green-800">
            {yourStake}
          </span>
        )
      }
    >
      <span className="line-clamp-2 block text-sm font-medium leading-snug text-gray-900">
        {title}
      </span>
      {percent !== null && (
        <span className="mt-1.5 block">
          <span className="flex h-1.5 overflow-hidden rounded-full bg-gray-100">
            <span
              className="block h-full rounded-full bg-primary-500"
              style={{ width: `${percent}%` }}
            />
          </span>
          <span className="mt-1 block text-xs text-gray-500">{getFundraiseMetaLabel(entry)}</span>
        </span>
      )}
    </Row>
  );
}

function ActivityLine({ entry }: { entry: FeedEntry }) {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { title, href } = getEntryMeta(entry);
  if (!title) return null;

  let icon = <FileText size={15} className="text-gray-400" />;
  let label = 'New activity';

  const contribution = getContribution(entry);
  const score = getReviewScore(entry);
  if (contribution) {
    const { amount, inUSD } = resolveDisplayedContribution(contribution, showUSD, exchangeRate);
    const formatted = formatCurrency({
      amount,
      showUSD: inUSD,
      exchangeRate: 1,
      skipConversion: true,
      shorten: true,
    });
    icon = <HandCoins size={15} className="text-green-600" />;
    label = `${formatted} contributed`;
  } else if (score != null) {
    icon = <Star size={15} className="fill-amber-400 text-amber-400" />;
    label = `Peer review · ${score.toFixed(1)}`;
  }

  const content = (
    <div className="flex items-center gap-2.5 px-3 py-2.5 transition-colors group-hover:bg-gray-50/60">
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 flex-1 truncate text-[13px] text-gray-700">
        <span className="font-semibold text-gray-900">{label}</span>
        <span className="text-gray-400"> · </span>
        {title}
      </span>
      <span className="shrink-0 text-xs text-gray-400">{formatTimeAgoShort(entry.timestamp)}</span>
    </div>
  );

  if (!href) return content;
  return (
    <Link href={href} className="group block first:rounded-t-xl last:rounded-b-xl">
      {content}
    </Link>
  );
}

function OpportunityRow({ entry }: { entry: FeedEntry }) {
  const { title, href } = getEntryMeta(entry);
  if (!title) return null;

  const { reviewScore } = getDocumentInfo(entry);

  return (
    <Row
      href={href}
      icon={<FileText size={17} />}
      iconClassName="bg-gray-100 text-gray-500"
      trailing={
        reviewScore != null && (
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-gray-700">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            {reviewScore.toFixed(1)}
          </span>
        )
      }
    >
      <span className="line-clamp-2 block text-sm font-medium leading-snug text-gray-900">
        {title}
      </span>
      <span className="mt-0.5 block text-xs text-gray-500">{getFundraiseMetaLabel(entry)}</span>
    </Row>
  );
}

function Row({
  href,
  icon,
  iconClassName,
  trailing,
  children,
}: {
  href?: string;
  icon: React.ReactNode;
  iconClassName: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  const content = (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-colors group-hover:border-gray-300 group-hover:bg-gray-50/60">
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ring-black/5',
          iconClassName
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
      {trailing}
      {href && (
        <ChevronRight
          size={16}
          className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5"
        />
      )}
    </div>
  );

  if (!href) return content;
  return (
    <Link href={href} className="group block">
      {content}
    </Link>
  );
}

/** The activity feed repeats documents across events; show each one once. */
function dedupeByTitle() {
  const seen = new Set<string>();
  return (entry: FeedEntry) => {
    const { title } = getEntryMeta(entry);
    if (!title || seen.has(title)) return false;
    seen.add(title);
    return true;
  };
}
