import { Bounty } from '@/types/bounty';
import type { User } from '@/types/user';
import { FOUNDATION_USER_ID, FOUNDATION_BOUNTY_FLAT_USD } from '@/config/constants';
import { getRemainingDays } from '@/utils/date';

/**
 * Checks if a bounty is open and not a contribution
 * @param bounty The bounty to check
 * @returns True if the bounty is open and not a contribution
 */
export const isOpenBounty = (bounty: Bounty): boolean => {
  // A bounty is not a contribution if it doesn't have a parent bounty
  const isContribution = bounty.raw && !!bounty.raw.parent;
  return bounty.status === 'OPEN' && !isContribution;
};

/**
 * Checks if a bounty is closed and not a contribution
 * @param bounty The bounty to check
 * @returns True if the bounty is closed and not a contribution
 */
export const isClosedBounty = (bounty: Bounty): boolean => {
  // A bounty is not a contribution if it doesn't have a parent bounty
  const isContribution = bounty.raw && !!bounty.raw.parent;
  return bounty.status === 'CLOSED' && !isContribution;
};

/**
 * @param bounty The bounty to check
 * @returns True if the bounty is OPEN or ASSESSMENT and not a contribution
 */
export const isActiveBounty = (bounty: Bounty): boolean => {
  // A bounty is not a contribution if it doesn't have a parent bounty
  const isContribution = bounty.raw && !!bounty.raw.parent;
  if (isContribution) return false;

  return bounty.status === 'OPEN' || bounty.status === 'ASSESSMENT';
};

/**
 * Filters an array of bounties to only include active bounties (OPEN or ASSESSMENT)
 * @param bounties Array of bounties to filter
 * @returns Array of active bounties
 */
export const getActiveBounties = (bounties: Bounty[]): Bounty[] => {
  return bounties.filter(isActiveBounty);
};

/**
 * Filters an array of bounties to only include closed bounties
 * @param bounties Array of bounties to filter
 * @returns Array of closed bounties
 */
export const getClosedBounties = (bounties: Bounty[]): Bounty[] => {
  return bounties.filter(isClosedBounty);
};

/**
 * Counts the number of active bounties (OPEN or ASSESSMENT) in an array
 * @param bounties Array of bounties to count
 * @returns Number of active bounties
 */
export const countActiveBounties = (bounties: Bounty[]): number => {
  return getActiveBounties(bounties).length;
};

/**
 * Counts the number of closed bounties in an array
 * @param bounties Array of bounties to count
 * @returns Number of closed bounties
 */
export const countClosedBounties = (bounties: Bounty[]): number => {
  return getClosedBounties(bounties).length;
};

/**
 * Finds the first active (open) bounty in an array
 * @param bounties Array of bounties to search
 * @returns The first active bounty or undefined if none found
 */
export const findActiveBounty = (bounties: Bounty[]): Bounty | undefined => {
  if (!bounties || !Array.isArray(bounties) || bounties.length === 0) {
    return undefined;
  }

  // Find the first active bounty that is not a contribution
  const activeBounty = bounties.find((b) => isOpenBounty(b));

  return activeBounty;
};

/**
 * Finds the first closed bounty in an array
 * @param bounties Array of bounties to search
 * @returns The first closed bounty or undefined if none found
 */
export const findClosedBounty = (bounties: Bounty[]): Bounty | undefined => {
  if (!bounties || !Array.isArray(bounties) || bounties.length === 0) {
    return undefined;
  }

  // Find the first closed bounty that is not a contribution
  const closedBounty = bounties.find((b) => isClosedBounty(b));

  return closedBounty;
};

/**
 * Checks if a bounty is expiring soon (within 3 days)
 * @param expirationDate The expiration date string
 * @param daysThreshold Number of days to consider as "expiring soon" (default: 3)
 * @returns True if the bounty is expiring within the threshold
 */
export const isExpiringSoon = (expirationDate?: string, daysThreshold: number = 3): boolean => {
  if (!expirationDate) return false;

  const expiration = new Date(expirationDate);
  const now = new Date();

  // Calculate the difference in milliseconds
  const diffTime = expiration.getTime() - now.getTime();

  // Convert to days
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  // Return true if less than threshold days remaining
  return diffDays > 0 && diffDays < daysThreshold;
};

/**
 * Calculates the total awarded amount for a bounty with solutions
 * @param bounty The bounty object with solutions
 * @returns The total awarded amount as a number
 */
export const calculateTotalAwardedAmount = (bounty?: Bounty): number => {
  if (!bounty?.solutions || bounty.solutions.length === 0) return 0;

  return bounty.solutions.reduce(
    (sum, solution) => sum + (solution.awardedAmount ? parseFloat(solution.awardedAmount) : 0),
    0
  );
};

/**
 * Interface for a contributor with profile information
 */
export interface Contributor {
  profile: {
    fullName: string;
    profileImage?: string;
    isClaimed?: boolean;
  };
  amount: number;
  isCreator?: boolean;
}

/**
 * Checks if a comment has any bounties
 * @param comment The comment object to check
 * @returns Boolean indicating if the comment has any bounties
 */
export const hasBounties = (comment?: any): boolean => {
  return !!(comment?.bounties && comment.bounties.length > 0);
};

// Add avatar interface
export interface BountyAvatar {
  src: string;
  alt: string;
  tooltip?: string;
  authorId?: number;
}

/**
 * Hacky shim to ensure we are rendering $150 USD for Foundation bounties.
 * Extracts the user ID of the bounty creator from various possible data structures.
 * Different code paths store the user ID in different locations:
 * 1. BountyService (earn page): raw.created_by is an author object with user nested
 *    - raw.created_by.id = author_profile.id (NOT what we want)
 *    - raw.created_by.user.id = user ID (what we want)
 *
 * 2. Paper/Post bounties from feed API: raw.created_by is direct from API
 *    - raw.created_by.id = user ID (what we want)
 *    - raw.created_by.author_profile.id = author_profile.id
 *
 * 3. FeedService.transformRawBounty: raw.author structure
 *    - raw.author.user.id = user ID (what we want)
 *
 * 4. Paper bounties with contributions: creator is in first contribution
 *    - contributions[0].createdBy.id = user ID (what we want)
 *    - contributions[0].raw.user.id = user ID (what we want)
 */
const getCreatorUserId = (bounty: Bounty): number | undefined => {
  const raw = bounty.raw;

  // Check for nested user object (BountyService path)
  // If created_by.user exists, then created_by.id is author_profile.id, not user ID
  if (raw?.created_by?.user?.id !== undefined) {
    return raw.created_by.user.id;
  }

  // Check for author.user (FeedService.transformRawBounty path)
  if (raw?.author?.user?.id !== undefined) {
    return raw.author.user.id;
  }

  // For paper/post bounties: created_by.id IS the user ID when author_profile is nested
  // This is the direct API structure where created_by represents the user
  if (raw?.created_by?.id !== undefined && raw.created_by.id !== 0) {
    return raw.created_by.id;
  }

  // For paper bounties where creator is in contributions array
  // The first contribution's creator is typically the bounty creator
  if (bounty.contributions && bounty.contributions.length > 0) {
    const firstContribution = bounty.contributions[0];
    // Check contribution's raw.user.id first (most reliable)
    if (firstContribution.raw?.user?.id !== undefined) {
      return firstContribution.raw.user.id;
    }
    // Fallback to transformed createdBy.id
    if (firstContribution.createdBy?.id !== undefined && firstContribution.createdBy.id !== 0) {
      return firstContribution.createdBy.id;
    }
  }

  // Fallback to transformed createdBy (may be author_profile.id in some cases)
  // Skip if id is 0 (unknown)
  if (bounty.createdBy?.id !== undefined && bounty.createdBy.id !== 0) {
    return bounty.createdBy.id;
  }

  return undefined;
};

/**
 * Checks if a bounty was created by the ResearchHub Foundation account.
 *
 * @param bounty The bounty to check
 * @returns True if the bounty was created by the Foundation account
 */
export const isFoundationBounty = (bounty: Bounty): boolean => {
  if (!FOUNDATION_USER_ID) return false;

  const creatorUserId = getCreatorUserId(bounty);
  return creatorUserId === FOUNDATION_USER_ID;
};

/**
 * True when the given user ID is the ResearchHub Foundation account.
 * Use with the logged-in user's `user.id` to gate create/award UI.
 */
export const isFoundationUser = (userId?: number | null): boolean =>
  FOUNDATION_USER_ID != null && userId === FOUNDATION_USER_ID;

/**
 * True when the user is a platform moderator.
 */
export const isModeratorUser = (user?: User | null): boolean =>
  !!user?.isModerator || !!user?.moderator;

/**
 * True when the user can create or award bounties (Foundation account or moderator).
 */
export const canManageBounties = (user?: User | null): boolean =>
  isFoundationUser(user?.id) || isModeratorUser(user);

/** Set to true to re-enable bounty backing (Support button, Backers list). */
export const ENABLE_BOUNTY_BACKING = false;

/**
 * Calculates the display amount for a bounty in USD.
 * For Foundation bounties, returns a flat $150 USD.
 * For other bounties, converts RSC to USD using the exchange rate.
 *
 * @param bounty The bounty to calculate the display amount for
 * @param exchangeRate The current RSC to USD exchange rate
 * @returns The display amount in USD
 */
export const calculateBountyDisplayAmountUSD = (bounty: Bounty, exchangeRate: number): number => {
  if (isFoundationBounty(bounty)) {
    return FOUNDATION_BOUNTY_FLAT_USD;
  }

  const totalAmount = Number.parseFloat(bounty.totalAmount || '0');
  const rscAmount = totalAmount > 0 ? totalAmount : Number.parseFloat(bounty.amount || '0');
  return Math.round(rscAmount * exchangeRate);
};

/**
 * Calculates the display amount for a bounty, returning either USD or RSC based on preference.
 * For Foundation bounties displayed in USD, returns a flat $150.
 *
 * @param bounty The bounty to calculate the display amount for
 * @param exchangeRate The current RSC to USD exchange rate
 * @param showUSD Whether to display in USD (true) or RSC (false)
 * @returns Object containing the display amount and whether it's a Foundation bounty
 */
export const getBountyDisplayAmount = (
  bounty: Bounty,
  exchangeRate: number,
  showUSD: boolean
): { amount: number; isFoundation: boolean } => {
  const isFoundation = isFoundationBounty(bounty);
  const totalAmount = Number.parseFloat(bounty.totalAmount || '0');
  const rscAmount = totalAmount > 0 ? totalAmount : Number.parseFloat(bounty.amount || '0');

  if (isFoundation) {
    if (showUSD) {
      // Show flat $150 USD for Foundation bounties
      return { amount: FOUNDATION_BOUNTY_FLAT_USD, isFoundation: true };
    }
    // Show RSC equivalent of $150 USD for Foundation bounties
    // exchangeRate is USD per RSC, so RSC = USD / exchangeRate
    const rscEquivalent = exchangeRate > 0 ? FOUNDATION_BOUNTY_FLAT_USD / exchangeRate : rscAmount;
    return { amount: Math.round(rscEquivalent), isFoundation: true };
  }

  if (showUSD) {
    return { amount: Math.round(rscAmount * exchangeRate), isFoundation: false };
  }

  // For RSC display of non-Foundation bounties, show the actual RSC amount
  return { amount: Math.round(rscAmount), isFoundation: false };
};

/**
 * Calculates the total display amount for multiple bounties.
 * Foundation bounties contribute:
 * - $150 USD when showUSD is true
 * - RSC equivalent of $150 USD when showUSD is false
 *
 * @param bounties Array of bounties to calculate total for
 * @param exchangeRate The current RSC to USD exchange rate
 * @param showUSD Whether to display in USD (true) or RSC (false)
 * @returns Object containing the total display amount and count of Foundation bounties
 */
export const getTotalBountyDisplayAmount = (
  bounties: Bounty[],
  exchangeRate: number,
  showUSD: boolean
): { amount: number; foundationBountyCount: number } => {
  let foundationBountyCount = 0;

  const amount = bounties.reduce((total, bounty) => {
    const { amount: bountyAmount, isFoundation } = getBountyDisplayAmount(
      bounty,
      exchangeRate,
      showUSD
    );
    if (isFoundation) foundationBountyCount++;
    return total + bountyAmount;
  }, 0);

  return { amount, foundationBountyCount };
};

/**
 * Finds the latest active Foundation bounty in an array
 * @param bounties Array of bounties to search
 * @returns The latest active Foundation bounty or undefined if none found
 */
export const findLatestFoundationBounty = (bounties: Bounty[]): Bounty | undefined => {
  if (!bounties || !Array.isArray(bounties) || bounties.length === 0) {
    return undefined;
  }

  const activeReviewBounties = bounties.filter(
    (bounty) =>
      (bounty.bountyType === 'REVIEW' || bounty.bountyType === 'BOUNTY') &&
      isFoundationBounty(bounty) &&
      isActiveBounty(bounty)
  );

  if (activeReviewBounties.length === 0) {
    return undefined;
  }

  return activeReviewBounties[0];
};

/** A bounty's status as its action row shows it, with a dot colour and the time left. */
export interface BountyStatusInfo {
  label: 'Open' | 'Assessment' | 'Completed';
  /** Tailwind background class for the status dot. */
  color: string;
  /** "3 days remaining" while open; null otherwise. */
  remaining: string | null;
  /** Under three days left. */
  urgent: boolean;
}

function formatDaysRemaining(days: number): string {
  if (days < 1) return '< 1 day remaining';
  const wholeDays = Math.floor(days);
  return `${wholeDays} day${wholeDays === 1 ? '' : 's'} remaining`;
}

/**
 * Open (with the days left), Assessment or Completed. `isActive` is the caller's own
 * rule for an open bounty still taking submissions, which differs between cards.
 */
export function getBountyStatus(bounty: Bounty, isActive: boolean): BountyStatusInfo {
  if (bounty.status === 'OPEN' && isActive) {
    const days = getRemainingDays(bounty.expirationDate ?? null);
    return {
      label: 'Open',
      color: 'bg-green-500',
      remaining: days === null ? null : formatDaysRemaining(days),
      urgent: days !== null && days < 3,
    };
  }
  if (bounty.status === 'ASSESSMENT') {
    return { label: 'Assessment', color: 'bg-orange-500', remaining: null, urgent: false };
  }
  return { label: 'Completed', color: 'bg-gray-400', remaining: null, urgent: false };
}
