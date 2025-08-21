import { Bounty } from '@/types/bounty';

/**
 * Checks if a bounty is from the specified userId and should display as $150
 * @param bounty The bounty to check
 * @param feedAuthor Optional author from the feed entry
 * @returns True if the bounty should display as $150
 */
export const shouldDisplayAsFixedAmount = (bounty: Bounty, feedAuthor?: any): boolean => {
  const bountyUserId = bounty.createdBy?.id;
  const feedAuthorId = feedAuthor?.id;

  // Check if either the bounty creator or feed author has the ResearchHub Foundation userId
  const result = bountyUserId === 153359 || feedAuthorId === 153359;

  // Debug logging in development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('Bounty userId check:', {
      bountyId: bounty.id,
      bountyUserId,
      feedAuthorId,
      expectedUserId: 153359,
      shouldDisplayFixed: result,
      createdBy: bounty.createdBy,
      feedAuthor,
      bountyCreatedByEmail: bounty.createdBy?.email,
      bountyCreatedByName: bounty.createdBy?.fullName,
      feedAuthorEmail: feedAuthor?.email,
      feedAuthorName: feedAuthor?.fullName,
    });
  }

  return result;
};

/**
 * Gets the fixed display amount for bounties from specific creators
 * @param bounty The bounty to check
 * @param feedAuthor Optional author from the feed entry
 * @param currency The currency to display ('RSC' or 'USD')
 * @param exchangeRate The current RSC to USD exchange rate
 * @returns The fixed amount to display, or null if no fixed amount applies
 */
export const getFixedDisplayAmount = (
  bounty: Bounty,
  feedAuthor?: any,
  currency: 'RSC' | 'USD' = 'USD',
  exchangeRate: number = 0
): number | null => {
  if (shouldDisplayAsFixedAmount(bounty, feedAuthor)) {
    if (currency === 'RSC' && exchangeRate > 0) {
      // Convert $150 USD to RSC equivalent
      return Math.round(150 / exchangeRate);
    }
    return 150; // $150 USD
  }
  return null;
};
