'use client';

import type { ReactNode } from 'react';
import { useFundraises } from '@/contexts/FundraiseContext';
import { useGrantPage } from '@/components/Funding/GrantPageContext';
import { getPoolSplit, toBackers, visiblePercent } from '@/components/Funding/lib/fundingAmounts';
import { CountBadge } from '@/components/ui/CountBadge';
import { type Face, FaceStack } from '@/components/ui/FaceStack';
import type { FundingPool, FundingPoolAmount } from '@/types/grant';
import { formatCompactAmount, formatCurrency } from '@/utils/currency';
import { formatShortDate, formatTimestamp } from '@/utils/date';
import { cn } from '@/utils/styles';

interface FactFaces {
  list: Face[];
  /** Everyone, when `list` holds only the first of them. */
  total: number;
  /** Heads the list behind the +N chip, e.g. "Backers". */
  label: string;
}

interface Fact {
  label: string;
  /** Below sm, where four cells share a phone's width. */
  compactLabel?: string;
  value?: string;
  compactValue?: string;
  money?: boolean;
  faces?: FactFaces;
  /** From sm, a count pill by the label. Phones show the count as the value instead. */
  count?: number;
  /** Under the value. */
  footer?: ReactNode;
  /** Shown instead below lg, where there is no sidebar pool card. */
  withoutSidebar?: Fact;
}

/**
 * `text` from sm, and `compactText` below it, where they differ. Dates are
 * formatted in the server's time zone first, so near midnight the browser's
 * can read a day apart: hydration keeps the server's text without a warning.
 */
function CompactableText({
  text,
  compactText = text,
  className,
}: {
  text?: string;
  compactText?: string;
  className?: string;
}) {
  if (compactText === text) {
    return text ? (
      <span suppressHydrationWarning className={cn('block truncate', className)}>
        {text}
      </span>
    ) : null;
  }
  return (
    <>
      {compactText && (
        <span suppressHydrationWarning className={cn('block truncate sm:hidden', className)}>
          {compactText}
        </span>
      )}
      {text && (
        <span suppressHydrationWarning className={cn('hidden truncate sm:block', className)}>
          {text}
        </span>
      )}
    </>
  );
}

/**
 * A cell's label over its value. Faces sit under the value on phones and beside
 * it from sm, where labels and values keep fixed heights so they line up across
 * the strip whether a cell holds a pill, faces or plain text.
 */
function FactBody({ fact }: { fact: Fact }) {
  const { faces } = fact;
  return (
    <>
      <dt className="flex min-w-0 items-center text-[10px] font-bold uppercase leading-[14px] tracking-[0.06em] text-gray-500 sm:h-5 sm:text-[11px] sm:tracking-[0.07em]">
        <CompactableText text={fact.label} compactText={fact.compactLabel} />
        {fact.count != null && (
          <CountBadge count={fact.count} className="ml-1.5 hidden tracking-normal sm:inline-flex" />
        )}
      </dt>
      <dd className="mt-1 min-w-0 sm:mt-2.5 sm:flex sm:h-8 sm:items-center sm:justify-between sm:gap-3">
        <CompactableText
          text={fact.value}
          compactText={fact.compactValue}
          className={cn(
            'text-[15px] font-bold leading-5 tracking-tight text-gray-900 sm:text-[22px] sm:leading-none',
            fact.money && 'font-mono text-green-700'
          )}
        />
        {faces && faces.total > 0 && (
          <>
            <FaceStack
              faces={faces.list}
              total={faces.total}
              countLabel={faces.label}
              className="mt-1.5 sm:hidden"
            />
            {/* Beside a value, two faces and no +N, so the value isn't cut short. */}
            <FaceStack
              faces={faces.list}
              size="sm"
              {...(fact.value ? { max: 2 } : { total: faces.total, countLabel: faces.label })}
              className="hidden sm:inline-flex"
            />
          </>
        )}
      </dd>
      {fact.footer}
    </>
  );
}

/** The pool's split in a thin bar, from sm: the funder's part in green, the backers' in indigo. */
function PoolBar({ communityPercent }: { communityPercent: number }) {
  const backersPercent = visiblePercent(communityPercent);
  return (
    <dd
      className="mt-2.5 hidden h-1 overflow-hidden rounded-full bg-gray-100 sm:flex"
      aria-hidden="true"
    >
      <span className="bg-green-600" style={{ width: `${100 - backersPercent}%` }} />
      {backersPercent > 0 && (
        <span className="bg-indigo-500" style={{ width: `${backersPercent}%` }} />
      )}
    </dd>
  );
}

/**
 * The funder's award. Below lg, where the sidebar's pool card is hidden, a
 * pool stands in for it: its total, its backers' faces and its split.
 */
function fundingFact(award: FundingPoolAmount, pool: FundingPool | null): Fact {
  const awardFact: Fact = {
    label: 'Available funding',
    compactLabel: 'Funding',
    value: formatCurrency({
      amount: award.usd,
      showUSD: true,
      exchangeRate: 1,
      skipConversion: true,
    }),
    compactValue: formatCompactAmount(award.usd),
    money: true,
  };
  if (!pool) return awardFact;

  const { total, communityPercent } = getPoolSplit(award, pool, true);
  return {
    ...awardFact,
    withoutSidebar: {
      label: 'Funding pool',
      value: formatCompactAmount(total.usd),
      money: true,
      faces: {
        list: toBackers(pool.contributors.top, true),
        total: pool.contributors.total,
        label: 'Backers',
      },
      footer: <PoolBar communityPercent={communityPercent} />,
    },
  };
}

/** Available funding, proposals, deadline and opening date in one strip under the cover. */
export function GrantFacts({ openedDate, className }: { openedDate?: string; className?: string }) {
  const { proposalCount } = useFundraises();
  const { grantAmount, fundingPool, applications, isActive, isPending } = useGrantPage();

  // One face per applicant, however many proposals they sent.
  const applicants = [...new Map(applications.map((a) => [a.profile.id, a.profile])).values()];
  const proposals = proposalCount > 0 ? String(proposalCount) : 'None yet';

  const facts: Fact[] = [
    ...(grantAmount?.usd ? [fundingFact(grantAmount, fundingPool)] : []),
    applicants.length > 0
      ? {
          // From sm the count moves into a pill by the label, and the faces
          // fill the cell.
          label: 'Proposals',
          count: proposalCount,
          compactValue: proposals,
          faces: {
            list: applicants.map((profile) => ({
              name: profile.fullName,
              image: profile.profileImage,
              authorId: profile.id,
            })),
            total: applicants.length,
            label: 'Applicants',
          },
        }
      : // Without faces (private applications, or none yet) the count stays the value.
        { label: 'Proposals', value: proposals },
    // Open RFPs take proposals on a rolling basis for now, whatever their end
    // date. A pending one will once it is approved.
    { label: 'Deadline', value: isActive || isPending ? 'Rolling' : 'Closed' },
    ...(openedDate
      ? [
          {
            label: 'Opened',
            value: formatTimestamp(openedDate, false),
            compactValue: formatShortDate(openedDate),
          },
        ]
      : []),
  ];

  // The cells share one row, each column as wide as its content and the spare
  // room split evenly, so "Available funding" isn't cut short in the narrow
  // page's main column while "Rolling" gives up the room it doesn't need. All
  // four fit a phone from 360px; narrower, the longest labels end in an ellipsis.
  return (
    <dl
      className={cn('grid rounded-lg border border-gray-200 bg-white', className)}
      style={{ gridTemplateColumns: `repeat(${facts.length}, auto)` }}
    >
      {facts.map((fact, i) => (
        <div
          key={fact.label}
          className={cn(
            'min-w-0 px-2 py-2.5 sm:px-4 sm:py-3.5',
            i > 0 && 'border-l border-gray-100'
          )}
        >
          {fact.withoutSidebar ? (
            <>
              <div className="lg:hidden">
                <FactBody fact={fact.withoutSidebar} />
              </div>
              <div className="hidden lg:block">
                <FactBody fact={fact} />
              </div>
            </>
          ) : (
            <FactBody fact={fact} />
          )}
        </div>
      ))}
    </dl>
  );
}
