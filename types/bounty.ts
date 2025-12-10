import { CommentType, ContentFormat } from './comment';
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

export interface BountyComment {
  content: any;
  contentFormat: ContentFormat;
  commentType: CommentType;
  id: number;
}

export interface Bounty {
  id: number;
  amount: string;
  status: 'OPEN' | 'CLOSED';
  expirationDate?: string;
  bountyType: BountyType;
  createdBy: User;
  solutions: BountySolution[];
  contributions: BountyContribution[];
  totalAmount: string;
  comment?: BountyComment; // Optional comment field
  raw: any;
}

export interface BountyWithComment extends Bounty {
  comment: BountyComment; // Required comment field
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

  if (raw?.author?.user) {
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
      createdBy: transformUser(raw.user || raw.created_by || null),
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

/**
 * Transforms raw comment data into BountyComment format
 */
const transformBountyComment = (rawComment: any): BountyComment | undefined => {
  if (!rawComment) return undefined;

  // Parse the comment content JSON if it's a string
  let content = rawComment.comment_content_json;
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch {
      // Keep as string if parsing fails
    }
  }

  return {
    id: rawComment.id || 0,
    content,
    contentFormat: rawComment.comment_content_type || 'TIPTAP',
    commentType: rawComment.comment_type || 'GENERIC_COMMENT',
  };
};

export const transformBounty = (raw: any, options?: { ignoreBaseAmount?: boolean }): Bounty => {
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

  const { ignoreBaseAmount = false } = options || {};

  try {
    // Transform contributions if they exist
    const contributions = Array.isArray(raw.contributions)
      ? raw.contributions.map(transformContribution)
      : [];

    // Calculate total amount (base amount + all contributions)
    const baseAmount = ignoreBaseAmount ? 0 : parseFloat(raw.amount) || 0;
    const contributionsTotal = contributions.reduce(
      (total: number, contribution: BountyContribution) => {
        return total + (parseFloat(contribution.amount) || 0);
      },
      0
    );
    const totalAmount = (baseAmount + contributionsTotal).toString();

    // Transform the comment if it exists
    const comment = transformBountyComment(raw.comment);

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
      comment,
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
