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

export const transformSolution = (raw: any): BountySolution => {
  if (!raw) {
    console.warn('Received null or undefined solution data');
    return {
      id: 0,
      objectId: 0,
      createdBy: transformUser(null),
      status: 'PENDING',
    };
  }

  try {
    return {
      id: raw.id || 0,
      contentType: raw.content_type,
      objectId: raw.object_id || 0,
      createdBy: transformUser(raw.created_by),
      status: raw.status || 'PENDING',
      awardedAmount: raw.awarded_amount,
    };
  } catch (error) {
    console.error('Error transforming solution:', error);
    return {
      id: raw.id || 0,
      objectId: raw.object_id || 0,
      createdBy: transformUser(null),
      status: raw.status || 'PENDING',
    };
  }
};

export const transformContribution = (raw: any): BountyContribution => {
  console.log('raw', raw);

  if (!raw) {
    console.warn('Received null or undefined contribution data');
    return {
      id: 0,
      amount: '0',
      createdBy: transformUser(null),
      status: 'ACTIVE',
      raw: null,
    };
  }

  // This is a shim to mitigate inconsistency in the API response
  let shim = {
    ...raw,
  };
  if (raw.author.user) {
    shim = {
      ...shim,
      user: { ...raw.author.user },
    };
    shim.user.author_profile = raw.author;
    delete shim.user.author_profile.user;
    raw = shim;
  }

  try {
    return {
      id: raw.id || 0,
      amount: raw.amount || '0',
      createdBy: transformUser(raw.user || null),
      status: raw.status || 'ACTIVE',
      raw,
    };
  } catch (error) {
    console.error('Error transforming contribution:', error);
    return {
      id: raw.id || 0,
      amount: raw.amount || '0',
      createdBy: transformUser(null),
      status: raw.status || 'ACTIVE',
      raw,
    };
  }
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
  if (!raw) {
    console.warn('Received null or undefined bounty data');
    return {
      id: 0,
      amount: '0',
      status: 'OPEN',
      expirationDate: new Date().toISOString(),
      bountyType: 'BOUNTY',
      createdBy: transformUser(null),
      solutions: [],
      contributions: [],
      totalAmount: '0',
      raw: null,
    };
  }

  try {
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

    return {
      id: raw.id || 0,
      amount: raw.amount || '0',
      status: raw.status || 'OPEN',
      expirationDate: raw.expiration_date || new Date().toISOString(),
      bountyType: raw.bounty_type || 'BOUNTY',
      createdBy: transformUser(raw.created_by),
      solutions: Array.isArray(raw.solutions) ? raw.solutions.map(transformSolution) : [],
      contributions,
      totalAmount,
      raw,
    };
  } catch (error) {
    console.error('Error transforming bounty:', error, raw);
    // Return a minimal valid bounty object
    return {
      id: raw?.id || 0,
      amount: raw?.amount || '0',
      status: raw?.status || 'OPEN',
      expirationDate: raw?.expiration_date || new Date().toISOString(),
      bountyType: raw?.bounty_type || 'BOUNTY',
      createdBy: transformUser(null),
      solutions: [],
      contributions: [],
      totalAmount: raw?.amount || '0',
      raw,
    };
  }
};
