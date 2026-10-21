'use client';

import type { ReactNode } from 'react';
import { useFundraises } from '@/contexts/FundraiseContext';
import { useGrantTab } from '@/components/Funding/GrantPageContent';
import { CountBadge } from '@/components/ui/CountBadge';
import { AvatarStack } from '@/components/ui/AvatarStack';
import type { FundingPoolContributor } from '@/types/grant';
import { formatTimestamp } from '@/utils/date';
import { cn } from '@/utils/styles';

interface GrantFactsProps {
  awardUsd?: number;
  openedDate?: string;
  className?: string;
}

interface Faces {
  items: { src: string; alt: string; tooltip: string; authorId?: number }[];
  total: number;
  label: string;
  /** Faces shown before the rest collapse into a +N chip; none when `noCount`. */
  max?: number;
  /** Show only the first faces, with no +N chip, where the cell is tight. */
  noCount?: boolean;
}

interface Fact {
  label: string;
  /** A count pill beside the label, as on the page tabs. */
  count?: number;
  value?: string;
  money?: boolean;
  faces?: Faces;
  /** Shown instead below lg, where there is no sidebar pool card. */
  withoutSidebar?: ReactNode;
}

const MAX_FACES = 3;

/**
 * Photos uploaded to ResearchHub rank first, then any other photo, then none.
 * Google sign-in photos rank second because many are Google's generated
 * letter avatar, which reads as initials.
 */
function photoRank(src: string): number {
  if (!src) return 0;
  return src.includes('googleusercontent.com') ? 1 : 2;
}

function FacesStack({ faces, size = 'sm' }: { faces: Faces; size?: 'xxs' | 'sm' }) {
  // Best photos first, so the visible faces aren't initials while real photos
  // sit further down the list. The sort is stable, so order is otherwise kept.
  const items = [...faces.items].sort((a, b) => photoRank(b.src) - photoRank(a.src));
  const max = faces.max ?? MAX_FACES;
  return (
    <AvatarStack
      className="shrink-0"
      items={items.slice(0, max)}
      allItems={items}
      size={size}
      maxItems={max}
      spacing={size === 'sm' ? -8 : -6}
      showExtraCount={!faces.noCount}
      totalItemsCount={faces.total}
      extraCountLabel={faces.label}
      showLabel={false}
    />
  );
}

// Every cell is a label row over a value row, each a fixed height, so labels
// and values line up across the strip whether a cell holds a pill, faces or
// plain text.

function FactLabel({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <dt className="flex h-5 min-w-0 items-center text-[11px] font-bold uppercase tracking-[0.07em] text-gray-500">
      <span className="truncate">{children}</span>
      {count != null && <CountBadge count={count} className="ml-1.5 tracking-normal" />}
    </dt>
  );
}

const VALUE_CLASS =
  'min-w-0 truncate text-lg font-bold leading-none tracking-tight text-gray-900 sm:text-[22px]';

function FactValue({
  value,
  money = false,
  faces,
}: {
  value?: string;
  money?: boolean;
  faces?: Faces;
}) {
  return (
    <dd className="mt-2.5 flex h-8 min-w-0 items-center justify-between gap-3">
      {value && (
        <span className={cn(VALUE_CLASS, money && 'font-mono text-green-700')}>{value}</span>
      )}
      {faces && faces.total > 0 && <FacesStack faces={faces} />}
    </dd>
  );
}

function backerFaces(backers: FundingPoolContributor[], total: number): Faces {
  return {
    items: backers.map((backer) => ({
      src: backer.profileImage,
      alt: backer.fullName,
      tooltip: backer.fullName,
      authorId: backer.authorProfileId,
    })),
    total,
    label: 'Backers',
    // Two faces and no +N: beside the amount in a half-width phone cell, more
    // would cut the money short. The pool card carries the full count.
    max: 2,
    noCount: true,
  };
}

/** $850, $2.4K, $10.2K, $250K, $1.2M: short enough for a narrow cell. */
function formatCompactUsd(usd: number): string {
  if (usd < 1_000) return `$${Math.round(usd).toLocaleString()}`;
  if (usd < 100_000) return `$${parseFloat((usd / 1_000).toFixed(1))}K`;
  if (usd < 1_000_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${parseFloat((usd / 1_000_000).toFixed(1))}M`;
}

/** "Jun 17" this year, "Jun 2025" before it: short enough for a phone cell. */
function formatShortDate(iso: string): string {
  const date = new Date(iso);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(
    'en-US',
    sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', year: 'numeric' }
  );
}

interface PhoneCell {
  label: string;
  value: string;
  money?: boolean;
  faces?: Faces;
}

/**
 * Below sm, the facts in one row: each column as wide as its content, the rest
 * shared out, and faces under the number they belong to rather than beside it.
 * All four fit from 360px; narrower, the longest labels end in an ellipsis.
 */
function PhoneFacts({ cells, className }: { cells: PhoneCell[]; className?: string }) {
  return (
    <dl
      className={cn('grid rounded-lg border border-gray-200 bg-white', className)}
      style={{ gridTemplateColumns: `repeat(${cells.length}, auto)` }}
    >
      {cells.map((cell, i) => (
        <div
          key={cell.label}
          className={cn('min-w-0 px-2 py-2.5', i > 0 && 'border-l border-gray-100')}
        >
          <dt className="truncate text-[10px] font-bold uppercase leading-[14px] tracking-[0.06em] text-gray-500">
            {cell.label}
          </dt>
          <dd
            className={cn(
              'mt-1 truncate text-[15px] font-bold leading-5 tracking-tight text-gray-900',
              cell.money && 'font-mono text-green-700'
            )}
          >
            {cell.value}
          </dd>
          {cell.faces && cell.faces.total > 0 && (
            <dd className="mt-1.5">
              <FacesStack faces={cell.faces} size="xxs" />
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}

/** A first $100 against a $25K grant is a sliver; floor it so it shows on the bar. */
const MIN_VISIBLE_PERCENT = 4;

/**
 * The pool in one cell: its total, its backers' faces, and a bar split between
 * the funder and the community. It stands in for the pool card on screens
 * without the sidebar, where cells are narrow, so the total is shortened.
 */
function PoolFact({
  funderUsd,
  raisedUsd,
  backers,
  backerCount,
}: {
  funderUsd: number;
  raisedUsd: number;
  backers: FundingPoolContributor[];
  backerCount: number;
}) {
  const total = funderUsd + raisedUsd;
  const communityPercent =
    raisedUsd > 0 ? Math.max(MIN_VISIBLE_PERCENT, (raisedUsd / total) * 100) : 0;
  return (
    <>
      <FactLabel>Funding pool</FactLabel>
      <FactValue value={formatCompactUsd(total)} money faces={backerFaces(backers, backerCount)} />
      <dd className="mt-2.5 flex h-1 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
        <span className="bg-green-600" style={{ width: `${100 - communityPercent}%` }} />
        {communityPercent > 0 && (
          <span className="bg-indigo-500" style={{ width: `${communityPercent}%` }} />
        )}
      </dd>
    </>
  );
}

// The cells share one row, each column as wide as its content and the
// spare room split evenly, so "Available funding" isn't cut short in the
// narrow page's main column while "Rolling" gives up the room it doesn't need.
const SM_COLUMNS: Record<number, string> = {
  2: 'sm:grid-cols-[repeat(2,auto)]',
  3: 'sm:grid-cols-[repeat(3,auto)]',
  4: 'sm:grid-cols-[repeat(4,auto)]',
};

/** Available funding, proposals, deadline and opening date in one strip under the cover. */
export function GrantFacts({ awardUsd, openedDate, className }: GrantFactsProps) {
  const { proposalCount } = useFundraises();
  const { fundingPool, applications } = useGrantTab();

  // One face per applicant, however many proposals they sent.
  const applicants = [...new Map(applications.map((a) => [a.profile.id, a.profile])).values()];

  // With faces to show, the count moves into a pill by the label and the faces
  // fill the cell. Without them (private applications, or none yet) the count
  // stays the cell's value.
  const applicantFaces: Faces = {
    items: applicants.map((profile) => ({
      src: profile.profileImage,
      alt: profile.fullName,
      tooltip: profile.fullName,
      authorId: profile.id,
    })),
    total: applicants.length,
    label: 'Applicants',
  };
  const proposalsValue = proposalCount > 0 ? String(proposalCount) : 'None yet';
  const proposalsFact: Fact =
    applicants.length > 0
      ? { label: 'Proposals', count: proposalCount, faces: applicantFaces }
      : { label: 'Proposals', value: proposalsValue };

  const poolTotalUsd = fundingPool && awardUsd ? awardUsd + fundingPool.amountRaised.usd : null;
  const phoneCells: PhoneCell[] = [
    ...(poolTotalUsd != null && fundingPool
      ? [
          {
            label: 'Funding pool',
            value: formatCompactUsd(poolTotalUsd),
            money: true,
            faces: {
              ...backerFaces(fundingPool.contributors.top, fundingPool.contributors.total),
              max: 3,
              noCount: false,
            },
          },
        ]
      : awardUsd
        ? [{ label: 'Funding', value: formatCompactUsd(awardUsd), money: true }]
        : []),
    { label: 'Proposals', value: proposalsValue, faces: applicantFaces },
    { label: 'Deadline', value: 'Rolling' },
    ...(openedDate ? [{ label: 'Opened', value: formatShortDate(openedDate) }] : []),
  ];

  const facts: Fact[] = [
    ...(awardUsd
      ? [
          {
            label: 'Available funding',
            value: `$${Math.round(awardUsd).toLocaleString()}`,
            money: true,
            withoutSidebar: fundingPool ? (
              <PoolFact
                funderUsd={awardUsd}
                raisedUsd={fundingPool.amountRaised.usd}
                backers={fundingPool.contributors.top}
                backerCount={fundingPool.contributors.total}
              />
            ) : undefined,
          },
        ]
      : []),
    proposalsFact,
    {
      label: 'Deadline',
      // Every RFP takes proposals on a rolling basis for now, whatever its end date.
      value: 'Rolling',
    },
    ...(openedDate ? [{ label: 'Opened', value: formatTimestamp(openedDate, false) }] : []),
  ];

  return (
    <>
      <PhoneFacts cells={phoneCells} className={cn('sm:hidden', className)} />
      <dl
        className={cn(
          'hidden rounded-lg border border-gray-200 bg-white sm:grid',
          SM_COLUMNS[facts.length],
          className
        )}
      >
        {facts.map((fact, i) => (
          <div
            key={fact.label}
            className={cn('min-w-0 px-4 py-3.5', i > 0 && 'border-l border-gray-100')}
          >
            {fact.withoutSidebar && <div className="lg:hidden">{fact.withoutSidebar}</div>}
            <div className={cn(fact.withoutSidebar && 'hidden lg:block')}>
              <FactLabel count={fact.count}>{fact.label}</FactLabel>
              <FactValue value={fact.value} money={fact.money} faces={fact.faces} />
            </div>
          </div>
        ))}
      </dl>
    </>
  );
}
