import { Bounty, BountyType } from '@/types/bounty';

const isContribution = (bounty: Bounty): boolean => {
  return bounty.raw && !!bounty.raw.parent;
};

export const isOpenBounty = (bounty: Bounty): boolean => {
  return bounty.status === 'OPEN' && !isContribution(bounty);
};

export const isReviewPeriodBounty = (bounty: Bounty): boolean => {
  return bounty.status === 'REVIEW_PERIOD' && !isContribution(bounty);
};

export const isActiveBounty = (bounty: Bounty): boolean => {
  return ['OPEN', 'REVIEW_PERIOD'].includes(bounty.status) && !isContribution(bounty);
};

export const isClosedBounty = (bounty: Bounty): boolean => {
  return bounty.status === 'CLOSED' && !isContribution(bounty);
};

export const getOpenBounties = (bounties: Bounty[]): Bounty[] => {
  return bounties.filter(isOpenBounty);
};

export const getClosedBounties = (bounties: Bounty[]): Bounty[] => {
  return bounties.filter(isClosedBounty);
};

export const countOpenBounties = (bounties: Bounty[]): number => {
  return getOpenBounties(bounties).length;
};

export const countClosedBounties = (bounties: Bounty[]): number => {
  return getClosedBounties(bounties).length;
};

export const calculateTotalBountyAmount = (bounties: Bounty[]): number => {
  return bounties.reduce((sum, bounty) => sum + parseFloat(bounty.amount), 0);
};

export const calculateOpenBountiesAmount = (bounties: Bounty[]): number => {
  return getOpenBounties(bounties).reduce((sum, bounty) => sum + parseFloat(bounty.amount), 0);
};

export const findActiveBounty = (bounties: Bounty[]): Bounty | undefined => {
  if (!bounties?.length) return undefined;
  return bounties.find((b) => isActiveBounty(b));
};

export const findClosedBounty = (bounties: Bounty[]): Bounty | undefined => {
  if (!bounties?.length) return undefined;
  return bounties.find((b) => isClosedBounty(b));
};

export const getDisplayBounty = (bounties: Bounty[]): Bounty | undefined => {
  if (!bounties?.length) return undefined;
  return findActiveBounty(bounties) || findClosedBounty(bounties);
};

export const isExpiringSoon = (expirationDate?: string, daysThreshold: number = 3): boolean => {
  if (!expirationDate) return false;
  const diffDays = (new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diffDays > 0 && diffDays < daysThreshold;
};

export const getBountyTitle = (bounty?: Bounty, isOpen?: boolean): string => {
  const prefix = isOpen ? 'Bounty' : 'Awarded Bounty';
  if (bounty?.bountyType === 'REVIEW') return `${prefix}: Peer Review`;
  if (bounty?.bountyType === 'ANSWER') return `${prefix}: Answer to Question`;
  return prefix;
};

export const calculateTotalAwardedAmount = (bounty?: Bounty): number => {
  if (!bounty?.solutions?.length) return 0;
  return bounty.solutions.reduce(
    (sum, solution) => sum + (solution.awardedAmount ? parseFloat(solution.awardedAmount) : 0),
    0
  );
};

export interface Contributor {
  profile: {
    fullName: string;
    profileImage?: string;
    isClaimed?: boolean;
  };
  amount: number;
  isCreator?: boolean;
}

export const formatContributorNames = (contributors: Contributor[]): string => {
  if (!contributors.length) return 'Unknown';

  const creator = contributors.find((c) => c.isCreator);
  const creatorName = creator?.profile.fullName || contributors[0]?.profile.fullName || 'Unknown';
  const otherContributors = contributors.filter(
    (c) => c.profile.fullName !== creatorName && c.profile.fullName
  );

  if (contributors.length === 1) return creatorName;
  if (contributors.length === 2) {
    return `${creatorName} and ${otherContributors[0]?.profile.fullName || 'another contributor'}`;
  }

  if (!otherContributors.length) return `${creatorName} and others`;
  if (otherContributors.length === 1)
    return `${creatorName} and ${otherContributors[0].profile.fullName}`;
  return `${creatorName}, ${otherContributors[0].profile.fullName} and ${
    otherContributors.length - 1
  } others`;
};

export const extractContributors = (bounties: Bounty[], displayBounty?: Bounty): Contributor[] => {
  return bounties
    .filter((bounty) => bounty.createdBy.authorProfile)
    .map((bounty) => ({
      profile: bounty.createdBy.authorProfile!,
      amount: Number(bounty.amount),
      isCreator: bounty.id === displayBounty?.id && !isContribution(bounty),
    }));
};

export const filterOutCreator = (contributors: Contributor[]): Contributor[] => {
  return contributors.filter((contributor) => !contributor.isCreator);
};

const extractUserProfile = (user: any, raw?: any): { fullName: string; profileImage?: string } => {
  if (user?.authorProfile) {
    return {
      fullName: user.authorProfile.fullName || 'Unknown',
      profileImage: user.authorProfile.profileImage,
    };
  }
  if (raw?.author_profile) {
    const fullName =
      `${raw.author_profile.first_name || ''} ${raw.author_profile.last_name || ''}`.trim();
    return {
      fullName: fullName || 'Unknown',
      profileImage: raw.author_profile.profile_image,
    };
  }
  return { fullName: 'Unknown' };
};

export const extractContributorsForDisplay = (bounty: Bounty): Contributor[] => {
  if (!bounty.contributions?.length) return [];

  const contributors = bounty.contributions.map((contribution) => {
    const profile = extractUserProfile(contribution.createdBy, contribution.raw?.created_by);
    return {
      profile: { ...profile, isClaimed: true },
      amount: Number(contribution.amount),
      isCreator: false,
    };
  });

  const creatorProfile = extractUserProfile(bounty.createdBy, bounty.raw?.created_by);
  const creator: Contributor = {
    profile: { ...creatorProfile, isClaimed: true },
    amount: Number(bounty.amount),
    isCreator: true,
  };

  const creatorAlreadyIncluded = contributors.some(
    (c) => c.profile.fullName === creator.profile.fullName
  );

  return creatorAlreadyIncluded ? contributors : [...contributors, creator];
};

export const hasBounties = (comment?: any): boolean => {
  return !!comment?.bounties?.length;
};

export interface BountyAvatar {
  src: string;
  alt: string;
  tooltip?: string;
  authorId?: number;
}
export const extractBountyAvatars = (
  bounties: Bounty[],
  openOnly: boolean = true
): BountyAvatar[] => {
  const filteredBounties = openOnly
    ? bounties.filter((bounty) => isActiveBounty(bounty))
    : bounties;

  const avatars = filteredBounties.flatMap((bounty) => {
    const result: BountyAvatar[] = [];

    if (bounty.createdBy) {
      const profile = extractUserProfile(bounty.createdBy, bounty.raw?.created_by);
      const authorId = bounty.createdBy.authorProfile?.id || bounty.raw?.created_by?.id;
      result.push({
        src: profile.profileImage || '/images/default-avatar.png',
        alt: profile.fullName,
        tooltip: profile.fullName,
        authorId,
      });
    }

    if (bounty.contributions?.length) {
      const contributorAvatars = bounty.contributions.map((contribution) => {
        const profile = extractUserProfile(contribution.createdBy, contribution.raw?.user);
        const authorId = contribution.createdBy?.authorProfile?.id || contribution.raw?.user?.id;
        return {
          src: profile.profileImage || '/images/default-avatar.png',
          alt: profile.fullName,
          tooltip: profile.fullName,
          authorId,
        };
      });
      result.push(...contributorAvatars);
    }

    return result;
  });

  return avatars.filter(
    (avatar, index, self) =>
      avatar.authorId && index === self.findIndex((a) => a.authorId === avatar.authorId)
  );
};
