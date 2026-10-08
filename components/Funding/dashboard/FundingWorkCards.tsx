'use client';

import Link from 'next/link';
import { ActivityWorkMetadata, WorkPreviewCard } from '@/components/Activity';
import {
  getActivityWork,
  getWorkCardPresentation,
} from '@/components/Activity/lib/activityWork.utils';
import { Avatar } from '@/components/ui/Avatar';
import { DashboardSectionHeader } from '@/components/Funding/dashboard/DashboardSectionHeader';
import { useMoneyFormat } from '@/components/Funding/dashboard/lib/useMoneyFormat';
import type {
  OwnProposalModel,
  RfpCardModel,
} from '@/components/Funding/dashboard/lib/myFundingModel';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import type { FeedEntry } from '@/types/feed';
import { formatTimeAgo } from '@/utils/date';
import { cn } from '@/utils/styles';

const DAY_MS = 24 * 60 * 60 * 1000;

const QUIET_DAYS = 30;

const ACTION =
  'inline-flex h-8 shrink-0 items-center rounded-lg px-3 text-xs font-semibold transition-colors';
const ACTION_PRIMARY = `${ACTION} bg-primary-500 text-white hover:bg-primary-600`;
const ACTION_OUTLINED = `${ACTION} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`;

/** A feed entry drawn the way Home draws it: the cover, title and figures in one card. */
export function FeedWorkCard({
  entry,
  footer,
}: {
  readonly entry: FeedEntry;
  readonly footer?: React.ReactNode;
}) {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const work = getActivityWork(entry);
  if (!work) return null;
  const presentation = getWorkCardPresentation(entry, work, { showUSD, exchangeRate });

  return (
    <WorkPreviewCard work={work} brand={presentation.brand} showPlaceholder>
      <WorkPreviewCard.Metadata>
        <ActivityWorkMetadata work={work} presentation={presentation} />
      </WorkPreviewCard.Metadata>
      {footer && <WorkPreviewCard.Actions>{footer}</WorkPreviewCard.Actions>}
    </WorkPreviewCard>
  );
}

interface CardsSectionProps<T> {
  readonly title: string;
  readonly meta?: string;
  readonly items: readonly T[];
  readonly limit?: number;
  readonly onSeeAll?: () => void;
  readonly render: (item: T) => React.ReactNode;
}

function CardsSection<T extends { key: string }>({
  title,
  meta,
  items,
  limit,
  onSeeAll,
  render,
}: CardsSectionProps<T>) {
  if (items.length === 0) return null;
  const shown = limit ? items.slice(0, limit) : items;
  return (
    <section aria-label={title}>
      <DashboardSectionHeader
        title={title}
        meta={meta}
        action={
          limit != null &&
          items.length > limit &&
          onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              See all {items.length}
            </button>
          )
        }
      />
      <ul className="space-y-4">
        {shown.map((item) => (
          <li key={item.key}>{render(item)}</li>
        ))}
      </ul>
    </section>
  );
}

interface RfpCardsProps {
  readonly rfps: readonly RfpCardModel[];
  /** The feed entries the cards are drawn from, by RFP post id. */
  readonly entries: ReadonlyMap<number, FeedEntry>;
  readonly newProposalCount: (rfpPostId: number, proposalIds: readonly number[]) => number;
  readonly onReview: (rfp: RfpCardModel) => void;
  readonly limit?: number;
  readonly onSeeAll?: () => void;
}

/** Your RFPs: each one's budget committed so far, the proposals in, and what is new. */
export function RfpCards({
  rfps,
  entries,
  newProposalCount,
  onReview,
  limit,
  onSeeAll,
}: RfpCardsProps) {
  const open = rfps.filter((rfp) => rfp.isOpen).length;
  return (
    <CardsSection
      title="Your RFPs"
      meta={open > 0 ? `${open} open` : undefined}
      items={rfps}
      limit={limit}
      onSeeAll={onSeeAll}
      render={(rfp) => {
        const entry = entries.get(rfp.postId);
        if (!entry) return null;
        return (
          <FeedWorkCard
            entry={entry}
            footer={
              <RfpFooter
                rfp={rfp}
                fresh={newProposalCount(rfp.postId, rfp.proposalIds)}
                onReview={onReview}
              />
            }
          />
        );
      }}
    />
  );
}

function RfpFooter({
  rfp,
  fresh,
  onReview,
}: {
  readonly rfp: RfpCardModel;
  readonly fresh: number;
  readonly onReview: (rfp: RfpCardModel) => void;
}) {
  const format = useMoneyFormat();
  const { budget, committed } = rfp;
  const share =
    budget.usd > 0
      ? Math.min(100, (committed.usd / budget.usd) * 100)
      : budget.rsc > 0
        ? Math.min(100, (committed.rsc / budget.rsc) * 100)
        : null;
  // The card's own count, so the footer agrees with the figure above it.
  const proposals = rfp.proposalCount;

  return (
    <div className="space-y-3 py-1.5">
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span
          className={cn(
            'rounded-full px-2 py-0.5 font-semibold',
            rfp.isOpen ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-600'
          )}
        >
          {rfp.isOpen ? 'Open' : 'Closed'}
        </span>
        {rfp.isOpen && rfp.daysLeft != null && rfp.daysLeft > 0 && (
          <span>
            {rfp.daysLeft} {rfp.daysLeft === 1 ? 'day' : 'days'} left
          </span>
        )}
      </div>
      {share != null && (
        <div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Budget committed</span>
            <span>
              <span className="font-mono font-semibold text-gray-900">
                {format(committed, { shorten: true })}
              </span>{' '}
              of {format(budget, { shorten: true })}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-primary-500" style={{ width: `${share}%` }} />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-600">
          <span className="font-semibold text-gray-900">
            {proposals} {proposals === 1 ? 'proposal' : 'proposals'}
          </span>
          {fresh > 0 && <span className="font-semibold text-primary-700"> · {fresh} new</span>}
          {rfp.proposalsFunded > 0 && <> · {rfp.proposalsFunded} funded</>}
        </span>
        <Link
          href={rfp.href}
          onClick={() => onReview(rfp)}
          className={fresh > 0 ? ACTION_PRIMARY : ACTION_OUTLINED}
        >
          {rfp.isOpen ? 'Review proposals' : 'See results'}
        </Link>
      </div>
    </div>
  );
}

interface OwnProposalCardsProps {
  readonly proposals: readonly OwnProposalModel[];
  readonly entries: ReadonlyMap<number, FeedEntry>;
  readonly now: number;
  readonly limit?: number;
  readonly onSeeAll?: () => void;
}

/** Your proposals: how far each has come, who is behind it, and when you last updated them. */
export function OwnProposalCards({
  proposals,
  entries,
  now,
  limit,
  onSeeAll,
}: OwnProposalCardsProps) {
  const raising = proposals.filter((proposal) => proposal.status === 'raising').length;
  return (
    <CardsSection
      title="Your proposals"
      meta={raising > 0 ? `${raising} raising` : undefined}
      items={proposals}
      limit={limit}
      onSeeAll={onSeeAll}
      render={(proposal) => {
        const entry = entries.get(proposal.postId);
        if (!entry) return null;
        return (
          <FeedWorkCard
            entry={entry}
            footer={<OwnProposalFooter proposal={proposal} now={now} />}
          />
        );
      }}
    />
  );
}

function OwnProposalFooter({
  proposal,
  now,
}: {
  readonly proposal: OwnProposalModel;
  readonly now: number;
}) {
  const quietDays =
    proposal.status === 'funded'
      ? proposal.lastUpdateAt != null
        ? Math.floor((now - proposal.lastUpdateAt) / DAY_MS)
        : null
      : undefined;
  const needsUpdate = quietDays === null || (quietDays != null && quietDays >= QUIET_DAYS);

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="flex min-w-0 items-center gap-2 text-xs text-gray-600">
        {proposal.funders.length > 0 && (
          <span className="flex shrink-0">
            {proposal.funders.slice(0, 3).map((funder, index) => (
              <span
                key={funder.id}
                className={cn('rounded-full ring-2 ring-white', index > 0 && '-ml-2')}
              >
                <Avatar src={funder.profileImage} alt={funder.fullName} size={22} disableTooltip />
              </span>
            ))}
          </span>
        )}
        <span className="min-w-0 truncate">
          {needsUpdate ? (
            <span className="font-semibold text-amber-700">
              {quietDays == null
                ? 'No update posted yet'
                : `Last update ${quietDays} ${quietDays === 1 ? 'day' : 'days'} ago`}
            </span>
          ) : proposal.funderCount > 0 ? (
            <>
              <span className="font-semibold text-gray-900">
                {proposal.funderCount} {proposal.funderCount === 1 ? 'funder' : 'funders'}
              </span>
              {proposal.newestGift && (
                <>
                  {' '}
                  · {proposal.newestGift.profile.fullName} gave{' '}
                  {formatTimeAgo(proposal.newestGift.date)}
                </>
              )}
            </>
          ) : (
            'No funders yet'
          )}
        </span>
      </div>
      <Link
        href={proposal.status === 'funded' ? proposal.updatesHref : proposal.href}
        className={needsUpdate ? ACTION_PRIMARY : ACTION_OUTLINED}
      >
        {proposal.status === 'funded' ? 'Post an update' : 'Open'}
      </Link>
    </div>
  );
}
