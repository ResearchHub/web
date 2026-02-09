import { Bounty } from '@/types/bounty';
import { FOUNDATION_USER_ID, FOUNDATION_BOUNTY_FLAT_USD } from '@/config/constants';

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
 * Filters an array of bounties to only include open bounties
 * @param bounties Array of bounties to filter
 * @returns Array of open bounties
 */
export const getOpenBounties = (bounties: Bounty[]): Bounty[] => {
  return bounties.filter(isOpenBounty);
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
 * Counts the number of open bounties in an array
 * @param bounties Array of bounties to count
 * @returns Number of open bounties
 */
export const countOpenBounties = (bounties: Bounty[]): number => {
  return getOpenBounties(bounties).length;
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
 * Calculates the total amount of all bounties in an array
 * @param bounties Array of bounties to sum
 * @returns Total amount as a number
 */
export const calculateTotalBountyAmount = (bounties: Bounty[]): number => {
  return bounties.reduce((sum, bounty) => sum + parseFloat(bounty.amount), 0);
};

/**
 * Calculates the total amount of open bounties in an array
 * @param bounties Array of bounties to sum
 * @returns Total amount of open bounties as a number
 */
export const calculateOpenBountiesAmount = (bounties: Bounty[]): number => {
  return getOpenBounties(bounties).reduce((sum, bounty) => sum + parseFloat(bounty.amount), 0);
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
 * Gets the bounty to display from an array of bounties
 * @param bounties Array of bounties
 * @returns The display bounty or undefined if none found
 */
export const getDisplayBounty = (bounties: Bounty[]): Bounty | undefined => {
  if (!bounties || !Array.isArray(bounties) || bounties.length === 0) {
    return undefined;
  }

  const activeBounty = findActiveBounty(bounties);
  const closedBounty = findClosedBounty(bounties);

  return activeBounty || closedBounty;
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
 * Gets the appropriate title for a bounty based on its type and status
 * @param bounty The bounty object
 * @param isOpen Whether the bounty is open
 * @returns The appropriate title string
 */
export const getBountyTitle = (bounty?: Bounty, isOpen?: boolean): string => {
  if (bounty?.bountyType === 'REVIEW') {
    return isOpen ? 'Bounty: Peer Review' : 'Awarded Bounty: Peer Review';
  }
  if (bounty?.bountyType === 'ANSWER') {
    return isOpen ? 'Bounty: Answer to Question' : 'Awarded Bounty: Answer to Question';
  }
  return isOpen ? 'Bounty' : 'Awarded Bounty';
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
 * Formats contributor names for display
 * @param contributors Array of contributors
 * @returns Formatted string of contributor names
 */
export const formatContributorNames = (contributors: Contributor[]): string => {
  if (contributors.length === 0) return 'Unknown';

  // Find the creator first (the main bounty creator)
  const creator = contributors.find((c) => c.isCreator);
  const creatorName = creator?.profile.fullName || contributors[0]?.profile.fullName || 'Unknown';

  // Get all non-creator contributors
  const otherContributors = contributors.filter(
    (c) => c.profile.fullName !== creatorName && c.profile.fullName
  );

  if (contributors.length === 1) {
    // Case 1: Just one contributor
    return creatorName;
  } else if (contributors.length === 2) {
    // Case 2: Two contributors
    const otherContributor = otherContributors[0];
    return `${creatorName} and ${otherContributor?.profile.fullName || 'another contributor'}`;
  } else {
    // Case 3: More than two contributors
    if (otherContributors.length === 0) {
      return `${creatorName} and others`;
    } else if (otherContributors.length === 1) {
      return `${creatorName} and ${otherContributors[0].profile.fullName}`;
    } else {
      return `${creatorName}, ${otherContributors[0].profile.fullName} and ${
        otherContributors.length > 1 ? `${otherContributors.length - 1} others` : 'another'
      }`;
    }
  }
};

/**
 * Extracts all contributors from an array of bounties
 * @param bounties Array of bounties
 * @param displayBounty The main bounty being displayed
 * @returns Array of contributors with profile information
 */
export const extractContributors = (bounties: Bounty[], displayBounty?: Bounty): Contributor[] => {
  return bounties
    .filter((bounty) => bounty.createdBy.authorProfile)
    .map((bounty) => {
      // A bounty is not a contribution if it doesn't have a parent bounty
      const isContribution = bounty.raw && !!bounty.raw.parent;

      return {
        profile: bounty.createdBy.authorProfile!,
        amount: Number(bounty.amount),
        isCreator: bounty.id === displayBounty?.id && !isContribution,
      };
    });
};

/**
 * Filters out the creator from the contributors list
 * @param contributors Array of contributors
 * @returns Array of contributors without the creator
 */
export const filterOutCreator = (contributors: Contributor[]): Contributor[] => {
  return contributors.filter((contributor) => !contributor.isCreator);
};

/**
 * Extracts contributors for display in the UI based on the following rules:
 * 1. If there are no contributors (other than the creator), return an empty array
 * 2. If there are one or more contributors, return both the creator and the contributors
 *
 * @param bounty The bounty to extract contributors from
 * @returns Array of contributors for display
 */
export const extractContributorsForDisplay = (bounty: Bounty): Contributor[] => {
  // Debug log to help diagnose issues
  console.log('extractContributorsForDisplay input:', {
    bountyId: bounty.id,
    hasContributions: !!bounty.contributions && bounty.contributions.length > 0,
    contributionsCount: bounty.contributions?.length || 0,
    contributionsData: bounty.contributions?.map((c) => ({
      id: c.id,
      amount: c.amount,
      createdById: c.createdBy?.id,
      hasAuthorProfile: !!c.createdBy?.authorProfile,
    })),
  });

  // If there are no contributions, return an empty array
  if (!bounty.contributions || bounty.contributions.length === 0) {
    return [];
  }

  // Process contributions directly from the bounty.contributions array
  const contributorsFromContributions = bounty.contributions.map((contribution) => {
    // Get the name from the contribution's createdBy
    let fullName = 'Unknown';
    let profileImage: string | undefined = undefined;

    // Try to get profile info from authorProfile if it exists
    if (contribution.createdBy.authorProfile) {
      fullName = contribution.createdBy.authorProfile.fullName || 'Unknown';
      profileImage = contribution.createdBy.authorProfile.profileImage;
    }
    // Fallback to raw data if available
    else if (contribution.raw?.created_by?.author_profile) {
      const rawProfile = contribution.raw.created_by.author_profile;
      fullName = `${rawProfile.first_name || ''} ${rawProfile.last_name || ''}`.trim() || 'Unknown';
      profileImage = rawProfile.profile_image;
    }

    return {
      profile: {
        fullName,
        profileImage,
        isClaimed: true,
      },
      amount: Number(contribution.amount),
      isCreator: false,
    };
  });

  // Add the creator as a contributor if not already included
  let creatorFullName = 'Unknown';
  let creatorProfileImage: string | undefined = undefined;

  // Try to get creator profile info from authorProfile if it exists
  if (bounty.createdBy.authorProfile) {
    creatorFullName = bounty.createdBy.authorProfile.fullName || 'Unknown';
    creatorProfileImage = bounty.createdBy.authorProfile.profileImage;
  }
  // Fallback to raw data if available
  else if (bounty.raw?.created_by?.author_profile) {
    const rawProfile = bounty.raw.created_by.author_profile;
    creatorFullName =
      `${rawProfile.first_name || ''} ${rawProfile.last_name || ''}`.trim() || 'Unknown';
    creatorProfileImage = rawProfile.profile_image;
  }

  const creator: Contributor = {
    profile: {
      fullName: creatorFullName,
      profileImage: creatorProfileImage,
      isClaimed: true,
    },
    amount: Number(bounty.amount),
    isCreator: true,
  };

  // Check if the creator is already in the contributors list
  const creatorAlreadyIncluded = contributorsFromContributions.some(
    (c) => c.profile.fullName === creator.profile.fullName
  );

  // Return all contributors including the creator (if not already included)
  const result = creatorAlreadyIncluded
    ? contributorsFromContributions
    : [...contributorsFromContributions, creator];

  return result;
};

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
 * Extracts avatar information from bounties for use in UI components
 * @param bounties Array of bounties to extract avatars from
 * @param openOnly Whether to only include open bounties (default: true)
 * @returns Array of avatar objects ready for display
 */
export const extractBountyAvatars = (
  bounties: Bounty[],
  openOnly: boolean = true
): BountyAvatar[] => {
  // Filter bounties if openOnly is true
  const filteredBounties = openOnly
    ? bounties.filter((bounty) => bounty.status === 'OPEN')
    : bounties;

  // Extract avatars from each bounty
  const avatars = filteredBounties.flatMap((bounty) => {
    const result = [];

    // Add creator avatar if available
    if (bounty.createdBy) {
      // Try to access profile information from raw data
      const creatorRaw = bounty.raw?.created_by || {};
      const authorProfile = bounty.createdBy.authorProfile || {};

      // Use explicit type casting to avoid TypeScript errors with optional fields
      const profileImage = (authorProfile as any).profileImage || (creatorRaw as any).profile_image;
      const fullName = (authorProfile as any).fullName || (creatorRaw as any).full_name;
      const id = (authorProfile as any).id || (creatorRaw as any).id;

      result.push({
        src: profileImage || '/images/default-avatar.png',
        alt: fullName || 'Creator',
        tooltip: fullName,
        authorId: id,
      });
    }

    // Add contributor avatars if available
    if (bounty.contributions && bounty.contributions.length > 0) {
      const contributorAvatars = bounty.contributions.map((contribution) => {
        const contributorRaw = contribution.raw?.user?.author_profile || {};
        const authorProfile = contribution.createdBy?.authorProfile || {};

        // Use explicit type casting to avoid TypeScript errors with optional fields
        const profileImage =
          (authorProfile as any).profileImage || (contributorRaw as any).profile_image;
        const fullName = (authorProfile as any).fullName || (contributorRaw as any).full_name;
        const id = (authorProfile as any).id || (contributorRaw as any).id;

        return {
          src: profileImage || '/images/default-avatar.png',
          alt: fullName || 'Contributor',
          tooltip: fullName,
          authorId: id,
        };
      });

      result.push(...contributorAvatars);
    }

    return result;
  });

  // Remove duplicates by authorId
  return avatars.filter(
    (avatar, index, self) =>
      avatar.authorId && index === self.findIndex((a) => a.authorId === avatar.authorId)
  );
};

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
 * Gets the RSC amount from a bounty, preferring totalAmount if it's greater than 0.
 * This handles the case where totalAmount might be '0' due to ignoreBaseAmount transformation.
 *
 * @param bounty The bounty to get the amount from
 * @returns The RSC amount as a number
 */
const getRscAmount = (bounty: Bounty): number => {
  const totalAmount = Number.parseFloat(bounty.totalAmount || '0');
  return totalAmount > 0 ? totalAmount : Number.parseFloat(bounty.amount || '0');
};

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

  const rscAmount = getRscAmount(bounty);
  return Math.round(rscAmount * exchangeRate);
};

export const calculateTotalBountyDisplayAmountUSD = (
  bounties: Bounty[],
  exchangeRate: number
): number => {
  return bounties.reduce((total, bounty) => {
    return total + calculateBountyDisplayAmountUSD(bounty, exchangeRate);
  }, 0);
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
  const rscAmount = getRscAmount(bounty);

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
