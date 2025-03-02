import { Bounty } from '@/types/bounty';

/**
 * Checks if a bounty is open and not a contribution
 * @param bounty The bounty to check
 * @returns True if the bounty is open and not a contribution
 */
export const isOpenBounty = (bounty: Bounty): boolean => {
  return bounty.status === 'OPEN' && !bounty.isContribution;
};

/**
 * Checks if a bounty is closed and not a contribution
 * @param bounty The bounty to check
 * @returns True if the bounty is closed and not a contribution
 */
export const isClosedBounty = (bounty: Bounty): boolean => {
  return bounty.status === 'CLOSED' && !bounty.isContribution;
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
 * Finds the first active (open and not a contribution) bounty in an array
 * @param bounties Array of bounties to search
 * @returns The first active bounty or undefined if none found
 */
export const findActiveBounty = (bounties: Bounty[]): Bounty | undefined => {
  return bounties.find(isOpenBounty);
};

/**
 * Finds the first closed (not a contribution) bounty in an array
 * @param bounties Array of bounties to search
 * @returns The first closed bounty or undefined if none found
 */
export const findClosedBounty = (bounties: Bounty[]): Bounty | undefined => {
  return bounties.find(isClosedBounty);
};

/**
 * Gets a display bounty - either the first active bounty or the first closed bounty if no active bounty exists
 * @param bounties Array of bounties to search
 * @returns The display bounty or undefined if none found
 */
export const getDisplayBounty = (bounties: Bounty[]): Bounty | undefined => {
  return findActiveBounty(bounties) || findClosedBounty(bounties);
};
