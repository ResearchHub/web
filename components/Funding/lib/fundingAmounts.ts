import {
  getGrantBadgeAmount,
  type FundingPool,
  type FundingPoolAmount,
  type FundingPoolContributor,
} from '@/types/grant';
import { formatCurrency } from '@/utils/currency';
import { formatRSC } from '@/utils/number';

/**
 * An amount already in the reader's currency, with its unit: "$1,155", or
 * "12,345 RSC". RSC keeps one decimal under 10, so a small gift doesn't read 0.
 */
export function formatMoney(value: number, showUSD: boolean): string {
  if (showUSD) {
    return formatCurrency({ amount: value, showUSD, exchangeRate: 1, skipConversion: true });
  }
  const rsc = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${formatRSC({ amount: rsc })} RSC`;
}

/** An amount kept in both currencies, in whichever the reader prefers. */
export function formatFundingAmount(amount: FundingPoolAmount, showUSD: boolean): string {
  return formatMoney(showUSD ? amount.usd : amount.rsc, showUSD);
}

/** Someone who put money in, as faces and tooltips show them. */
export interface Backer {
  id: string | number;
  name: string;
  image: string;
  authorId?: number;
  /** Already formatted, e.g. "$250". */
  amount: string;
}

/** A pool's top contributors, each with what they gave. */
export function toBackers(contributors: FundingPoolContributor[], showUSD: boolean): Backer[] {
  return contributors.map((contributor) => ({
    id: contributor.id,
    name: contributor.fullName,
    image: contributor.profileImage,
    authorId: contributor.authorProfileId,
    amount: formatFundingAmount(contributor.totalContribution, showUSD),
  }));
}

/** A first $100 against a $25K total is a sliver; floor it so it shows on a bar. */
const MIN_VISIBLE_PERCENT = 4;

/** A part's width on a bar, 0 to 100: none when empty, never too thin to see. */
export function visiblePercent(percent: number): number {
  return percent > 0 ? Math.max(MIN_VISIBLE_PERCENT, percent) : 0;
}

/** An RFP's pool: the funder's award plus what backers added, and the backers' share. */
export function getPoolSplit(
  award: FundingPoolAmount,
  pool: FundingPool,
  showUSD: boolean
): { total: FundingPoolAmount; communityPercent: number } {
  const total = getGrantBadgeAmount({ amount: award, fundingPool: pool });
  const raised = pool.amountRaised;
  const totalShare = showUSD ? total.usd : total.rsc;
  const raisedShare = showUSD ? raised.usd : raised.rsc;
  return { total, communityPercent: totalShare > 0 ? (raisedShare / totalShare) * 100 : 0 };
}
