import { BaseTransformer } from './transformer';
import { User, transformUser } from './user';

export type BountyType = 'REVIEW' | 'ANSWER' | 'BOUNTY' | 'GENERIC_COMMENT';
export type SolutionStatus = 'AWARDED' | 'PENDING';
export type ContributionStatus = 'ACTIVE' | 'REFUNDED';

export interface BountySolution {
  id: number;
  contentType?: {
    id: number;
    name: string;
  };
  objectId: number;
  createdBy: User;
  status: SolutionStatus;
  awardedAmount?: string;
}

export interface BountyContribution {
  id: number;
  amount: string;
  createdBy: User;
  status: ContributionStatus;
  raw: any;
}

export interface Bounty {
  id: number;
  amount: string;
  status: 'OPEN' | 'CLOSED';
  expirationDate: string;
  bountyType: BountyType;
  createdBy: User;
  solutions: BountySolution[];
  contributions: BountyContribution[];
  totalAmount: string;
  raw: any;
}

export const transformSolution = (raw: any): BountySolution => ({
  id: raw.id,
  contentType: raw.content_type,
  objectId: raw.object_id,
  createdBy: transformUser(raw.created_by),
  status: raw.status,
  awardedAmount: raw.awarded_amount,
});

export const transformContribution = (raw: any): BountyContribution => {
  return {
    id: raw.id,
    amount: raw.amount,
    createdBy: transformUser(raw.created_by),
    status: raw.status || 'ACTIVE',
    raw,
  };
};

/**
 * Groups bounties and their contributions together
 * @param bounties Array of bounty objects from the API
 * @returns Array of transformed Bounty objects with contributions attached
 */
export const groupBountiesWithContributions = (bounties: any[]): Bounty[] => {
  if (!bounties || !Array.isArray(bounties) || bounties.length === 0) {
    return [];
  }

  // First, separate main bounties from contributions
  const mainBounties: any[] = [];
  const contributions: Record<string | number, any[]> = {};

  bounties.forEach((bounty) => {
    if (bounty.parent) {
      // This is a contribution
      const parentId = typeof bounty.parent === 'object' ? bounty.parent.id : bounty.parent;
      if (!contributions[parentId]) {
        contributions[parentId] = [];
      }
      contributions[parentId].push(bounty);
    } else {
      // This is a main bounty
      mainBounties.push(bounty);
    }
  });

  // Now transform main bounties and attach their contributions
  const result = mainBounties.map((bounty) => {
    const bountyContributions = contributions[bounty.id] || [];

    return transformBounty({
      ...bounty,
      contributions: bountyContributions,
    });
  });

  return result;
};

export const transformBounty: BaseTransformer<any, Bounty> = (raw) => {
  // Transform contributions if they exist
  const contributions = Array.isArray(raw.contributions)
    ? raw.contributions.map(transformContribution)
    : [];

  // Calculate total amount (base amount + all contributions)
  const baseAmount = parseFloat(raw.amount) || 0;
  const contributionsTotal = contributions.reduce(
    (total: number, contribution: BountyContribution) => {
      return total + (parseFloat(contribution.amount) || 0);
    },
    0
  );
  const totalAmount = (baseAmount + contributionsTotal).toString();

  const result = {
    id: raw.id,
    amount: raw.amount,
    status: raw.status,
    expirationDate: raw.expiration_date,
    bountyType: raw.bounty_type,
    createdBy: transformUser(raw.created_by),
    solutions: Array.isArray(raw.solutions) ? raw.solutions.map(transformSolution) : [],
    contributions,
    totalAmount,
    raw,
  };

  return result;
};
