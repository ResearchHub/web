import { ArrowDownLeft, ArrowUpRight, type LucideIcon } from 'lucide-react';

/**
 * Which way money moves for the person looking at it: out of their hands
 * when they fund research, into them when their research is funded. One
 * visual language for it everywhere — the My Funding tabs, the workspace's
 * intent toggle, a document's kind in a list.
 */
export type FundingDirection = 'giving' | 'receiving';

/** What a workspace conversation is for; the backend stores the same values. */
export type FundingIntent = 'fund' | 'need_funding';

export interface FundingDirectionStyle {
  readonly icon: LucideIcon;
  /** The arrow, when it is coloured rather than inheriting. */
  readonly iconClass: string;
  /** The circle behind the arrow, when coloured. */
  readonly chipClass: string;
  /** Text that takes the direction's colour, e.g. an active toggle label. */
  readonly textClass: string;
}

/** Money out reads blue, the brand's default; money in reads emerald. */
export const FUNDING_DIRECTION: Record<FundingDirection, FundingDirectionStyle> = {
  giving: {
    icon: ArrowUpRight,
    iconClass: 'text-primary-700',
    chipClass: 'bg-primary-100',
    textClass: 'text-primary-700',
  },
  receiving: {
    icon: ArrowDownLeft,
    iconClass: 'text-emerald-700',
    chipClass: 'bg-emerald-100',
    textClass: 'text-emerald-700',
  },
};

export const directionForIntent = (intent: FundingIntent): FundingDirection =>
  intent === 'fund' ? 'giving' : 'receiving';
