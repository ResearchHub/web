import { Bounty, BountyType } from '@/types/bounty';

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
  console.log('findActiveBounty input:', {
    bounties,
    isArray: Array.isArray(bounties),
    length: bounties?.length || 0,
  });

  if (!bounties || bounties.length === 0) {
    return undefined;
  }

  const activeBounty = bounties.find(isOpenBounty);
  console.log('findActiveBounty result:', activeBounty?.id);
  return activeBounty;
};

/**
 * Finds the first closed bounty in an array
 * @param bounties Array of bounties to search
 * @returns The first closed bounty or undefined if none found
 */
export const findClosedBounty = (bounties: Bounty[]): Bounty | undefined => {
  console.log('findClosedBounty input:', {
    bounties,
    isArray: Array.isArray(bounties),
    length: bounties?.length || 0,
  });

  if (!bounties || bounties.length === 0) {
    return undefined;
  }

  const closedBounty = bounties.find(isClosedBounty);
  console.log('findClosedBounty result:', closedBounty?.id);
  return closedBounty;
};

/**
 * Gets the bounty to display from an array of bounties
 * @param bounties Array of bounties
 * @returns The display bounty or undefined if none found
 */
export const getDisplayBounty = (bounties: Bounty[]): Bounty | undefined => {
  console.log('getDisplayBounty input:', {
    bounties,
    isArray: Array.isArray(bounties),
    length: bounties?.length || 0,
  });

  if (!bounties || bounties.length === 0) {
    console.log('getDisplayBounty: No bounties provided');
    return undefined;
  }

  // Since we've restructured bounties to group contributions with their parent bounties,
  // we should now have only main bounties in the array. We can simply find the first open one,
  // or fall back to the first closed one.
  const activeBounty = findActiveBounty(bounties);
  const closedBounty = findClosedBounty(bounties);

  console.log('getDisplayBounty results:', {
    hasActiveBounty: !!activeBounty,
    hasClosedBounty: !!closedBounty,
    activeBountyId: activeBounty?.id,
    closedBountyId: closedBounty?.id,
  });

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
 * Checks if a comment has any bounties
 * @param comment The comment object to check
 * @returns Boolean indicating if the comment has any bounties
 */
export const hasBounties = (comment?: any): boolean => {
  return !!(comment?.bounties && comment.bounties.length > 0);
};
