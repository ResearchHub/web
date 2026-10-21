'use client';

import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/styles';

/** An amount kept in both currencies, shown in whichever the reader prefers. */
export interface DualAmount {
  usd: number;
  rsc: number;
}

export function formatFundingAmount(amount: DualAmount, showUSD: boolean): string {
  return formatCurrency({
    amount: showUSD ? amount.usd : amount.rsc,
    showUSD,
    exchangeRate: 1,
    skipConversion: true,
  });
}

/** Someone who put money in, as the card's faces and tooltips show them. */
export interface Backer {
  id: string | number;
  name: string;
  image: string;
  authorId?: number;
  /** Already formatted, e.g. "$250". */
  amount: string;
}

/** A first $100 against a $25K total is a sliver; floor it so it shows on the bar. */
export const MIN_VISIBLE_PERCENT = 4;

interface FundingCardProps {
  label: string;
  /** After the label, dimmed: "Closed", "Fully funded". */
  status?: string;
  /** At the right end of the label's row, e.g. an info button or the time left. */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  testId?: string;
}

/**
 * The navy money card at the top of an RFP's or a proposal's sidebar: a small
 * label over the total, the bar, and whatever the card adds under them.
 */
export function FundingCard({
  label,
  status,
  aside,
  children,
  className,
  testId,
}: FundingCardProps) {
  return (
    <div
      data-testid={testId}
      className={cn('w-full rounded-lg bg-[#0b1530] p-4 text-white', className)}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-white/65">
          {label}
          {status && (
            <span className="font-semibold normal-case tracking-normal text-white/50">
              · {status}
            </span>
          )}
        </span>
        {aside}
      </div>
      {children}
    </div>
  );
}

/** The card's total, large: "$26,821", or "$1,173 of $10,000" against a goal. */
export function FundingTotal({ amount, goal }: { amount: string; goal?: string }) {
  return (
    <p className="mt-1.5 flex items-baseline gap-2 leading-none">
      <span className="font-mono text-[30px] font-semibold tracking-tight tabular-nums">
        {amount}
      </span>
      {goal && <span className="text-sm text-white/60">of {goal}</span>}
    </p>
  );
}

export interface FundingBarPart {
  /** Share of the bar, 0 to 100. */
  percent: number;
  /** The part's fill, e.g. `bg-emerald-400`. */
  colorClassName: string;
  /** Shown on hover: who put this part in. */
  tip: ReactNode;
  tipWidth?: string;
}

/**
 * One part of the bar. Hovering it grows it a little and brightens it;
 * hovering another part dims it.
 */
const PART_CLASS = cn(
  'block h-2 w-full origin-center transition-all duration-200',
  'group-hover/bar:opacity-50 group-hover/segment:!opacity-100',
  'group-hover/segment:scale-y-150 group-hover/segment:brightness-110'
);

/**
 * The card's bar, filled part by part. Each part is its own hover target,
 * padded taller than the 8px bar so it is easy to land on, and its tooltip
 * names who put it in. What the parts leave of the bar is an empty track.
 */
export function FundingBar({ parts, label }: { parts: FundingBarPart[]; label: string }) {
  const filled = parts.filter((part) => part.percent > 0);
  const trackPercent = 100 - filled.reduce((sum, part) => sum + part.percent, 0);
  // Parts that add up to the whole bar can miss 100 by a rounding error.
  const hasTrack = trackPercent >= 0.5;

  return (
    <div className="group/bar mt-1.5 flex w-full gap-0.5" role="img" aria-label={label}>
      {filled.map((part, index) => (
        <span key={index} className="flex" style={{ width: `${part.percent}%` }}>
          <Tooltip
            content={part.tip}
            position="bottom"
            width={part.tipWidth ?? 'w-56'}
            wrapperClassName="group/segment w-full cursor-default py-2"
          >
            <span
              className={cn(
                PART_CLASS,
                part.colorClassName,
                index === 0 && 'rounded-l-full',
                index === filled.length - 1 && !hasTrack && 'rounded-r-full'
              )}
            />
          </Tooltip>
        </span>
      ))}
      {hasTrack && (
        <span className="flex py-2" style={{ width: `${trackPercent}%` }}>
          <span
            className={cn(
              'block h-2 w-full rounded-r-full bg-white/15',
              filled.length === 0 && 'rounded-l-full'
            )}
          />
        </span>
      )}
    </div>
  );
}

/** Backers listed by name in a tooltip; the rest are counted. */
const MAX_LISTED_BACKERS = 5;

/** A bar part's tooltip: a heading, then the backers by name with what each put in. */
export function BackersTip({
  heading,
  backers,
  total,
}: {
  heading: ReactNode;
  backers: Backer[];
  /** Everyone who backed it, listed or not. */
  total: number;
}) {
  const listed = backers.slice(0, MAX_LISTED_BACKERS);
  return (
    <div className="text-left text-xs">
      <div className="font-semibold text-gray-900">{heading}</div>
      {listed.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {listed.map((backer) => (
            <li key={backer.id} className="flex items-center gap-2">
              <Avatar src={backer.image} alt={backer.name} size={20} />
              <span className="min-w-0 flex-1 truncate text-gray-700">{backer.name}</span>
              <span className="shrink-0 font-mono text-gray-900">{backer.amount}</span>
            </li>
          ))}
        </ul>
      )}
      {total > listed.length && (
        <div className="mt-1.5 text-gray-500">and {total - listed.length} more</div>
      )}
    </div>
  );
}

const MAX_FACES = 3;

/**
 * The first few backers' faces, ringed in the card's navy. Each links to its
 * profile, unless the faces sit inside a control of their own.
 */
export function BackerFaces({ backers, linked = true }: { backers: Backer[]; linked?: boolean }) {
  return (
    <AvatarStack
      className="shrink-0"
      items={backers.slice(0, MAX_FACES).map((backer) => ({
        src: backer.image,
        alt: backer.name,
        tooltip: backer.name,
        authorId: linked ? backer.authorId : undefined,
      }))}
      size="xxs"
      maxItems={MAX_FACES}
      spacing={-6}
      ringColorClass="ring-[#0b1530]"
      showExtraCount={false}
      showLabel={false}
    />
  );
}
