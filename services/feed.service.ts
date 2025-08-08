import { ApiClient } from './client';
import { FeedEntry, FeedApiResponse, transformFeedEntry, RawApiFeedEntry } from '@/types/feed';
import { Bounty, BountyType, transformBounty } from '@/types/bounty';
import { transformUser, User } from '@/types/user';
import { transformAuthorProfile } from '@/types/authorProfile';
import { Fundraise, transformFundraise } from '@/types/funding';

export class FeedService {
  private static readonly BASE_PATH = '/api/feed';
  private static readonly FUNDING_PATH = '/api/funding_feed';
  private static readonly GRANT_PATH = '/api/grant_feed';

  static async getFeed(params?: {
    page?: number;
    pageSize?: number;
    feedView?: string;
    hubSlug?: string;
    contentType?: string;
    source?: 'all' | 'researchhub';
    endpoint?: 'feed' | 'funding_feed' | 'grant_feed';
    fundraiseStatus?: 'OPEN' | 'CLOSED';
    grantId?: number;
    createdBy?: number;
    ordering?: string;
  }): Promise<{ entries: FeedEntry[]; hasMore: boolean }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
    if (params?.feedView) queryParams.append('feed_view', params.feedView);
    if (params?.hubSlug) queryParams.append('hub_slug', params.hubSlug);
    if (params?.contentType) queryParams.append('content_type', params.contentType);
    if (params?.source) queryParams.append('source', params.source);
    if (params?.fundraiseStatus) queryParams.append('fundraise_status', params.fundraiseStatus);
    if (params?.grantId) queryParams.append('grant_id', params.grantId.toString());
    if (params?.createdBy) queryParams.append('created_by', params.createdBy.toString());
    if (params?.ordering) queryParams.append('ordering', params.ordering);

    // Determine which endpoint to use
    const basePath =
      params?.endpoint === 'funding_feed'
        ? this.FUNDING_PATH
        : params?.endpoint === 'grant_feed'
          ? this.GRANT_PATH
          : this.BASE_PATH;
    const url = `${basePath}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      // Use ApiClient for both server and client environments
      const isServer = typeof window === 'undefined';
      console.log(`Fetching feed from URL: ${url} (${isServer ? 'server-side' : 'client-side'})`);

      const response = await ApiClient.get<FeedApiResponse>(url);

      const transformedEntries = response.results
        .map((entry) => {
          try {
            return transformFeedEntry(entry as any);
          } catch (error) {
            console.error('Error transforming feed entry:', error, entry);
            return null;
          }
        })
        .filter((entry): entry is FeedEntry => !!entry);

      // Return the transformed entries
      return {
        entries: transformedEntries,
        hasMore: !!response.next,
      };
    } catch (error) {
      console.error('Error fetching feed:', error);
      // Return empty entries on error
      return {
        entries: [],
        hasMore: false,
      };
    }
  }

  // Helper function to transform a raw bounty from the feed API to a Bounty object
  // This is used by the BountyCard component which expects the old Bounty type
  static transformRawBounty(rawBounty: RawApiFeedEntry): Bounty {
    if (!rawBounty) {
      throw new Error('Raw bounty is undefined');
    }

    const { content_object, author, action_date, created_date } = rawBounty;

    if (!content_object) {
      throw new Error('Raw bounty content_object is undefined');
    }

    // Create default author if missing
    const defaultAuthor = {
      id: 0,
      first_name: 'Unknown',
      last_name: 'User',
      profile_image: '',
      description: '',
      user: {
        id: 0,
        first_name: 'Unknown',
        last_name: 'User',
        email: '',
        is_verified: false,
      },
    };

    // Use default author if author is missing
    const safeAuthor = author || defaultAuthor;

    // Transform the author to a User object
    let user: User;
    try {
      if (safeAuthor.user) {
        user = transformUser(safeAuthor.user);
        user.authorProfile = transformAuthorProfile(safeAuthor);
      } else {
        user = transformUser({
          id: safeAuthor.id,
          email: '',
          first_name: safeAuthor.first_name,
          last_name: safeAuthor.last_name,
          is_verified: false,
          balance: 0,
          author_profile: safeAuthor,
        });
      }
    } catch (error) {
      console.error('Error transforming user:', error);
      // Fallback to manual transformation
      user = {
        id: safeAuthor.user?.id || safeAuthor.id || 0,
        email: safeAuthor.user?.email || '',
        firstName: safeAuthor.first_name || '',
        lastName: safeAuthor.last_name || '',
        fullName:
          `${safeAuthor.first_name || ''} ${safeAuthor.last_name || ''}`.trim() || 'Unknown User',
        isVerified: safeAuthor.user?.is_verified || false,
        balance: 0,
        lockedBalance: 0,
        moderator: false,
        authorProfile: {
          id: safeAuthor.id || 0,
          fullName:
            `${safeAuthor.first_name || ''} ${safeAuthor.last_name || ''}`.trim() || 'Unknown User',
          firstName: safeAuthor.first_name || '',
          lastName: safeAuthor.last_name || '',
          profileImage: safeAuthor.profile_image || '',
          headline: safeAuthor.description || '',
          profileUrl: `/author/${safeAuthor.id || 0}`,
          user: {
            id: safeAuthor.user?.id || safeAuthor.id || 0,
            email: safeAuthor.user?.email || '',
            firstName: safeAuthor.first_name || '',
            lastName: safeAuthor.last_name || '',
            fullName:
              `${safeAuthor.first_name || ''} ${safeAuthor.last_name || ''}`.trim() ||
              'Unknown User',
            isVerified: safeAuthor.user?.is_verified || false,
            balance: 0,
            lockedBalance: 0,
            moderator: false,
          },
          isClaimed: !!safeAuthor.user,
          isVerified: safeAuthor.user?.is_verified || false,
        },
      };
    }

    // Map bounty_type to BountyType
    const bountyTypeMap: Record<string, BountyType> = {
      REVIEW: 'REVIEW',
      ANSWER: 'ANSWER',
      BOUNTY: 'BOUNTY',
      GENERIC_COMMENT: 'GENERIC_COMMENT',
    };

    // Get the bounty type, defaulting to 'BOUNTY' if not found
    const bountyType =
      content_object.bounty_type && bountyTypeMap[content_object.bounty_type]
        ? bountyTypeMap[content_object.bounty_type]
        : 'BOUNTY';

    // Create a Bounty object from the feed entry
    return {
      id: content_object.id,
      amount: (content_object.amount || 0).toString(),
      status: content_object.status || 'OPEN',
      expirationDate: content_object.expiration_date || new Date().toISOString(),
      bountyType,
      createdBy: user,
      solutions: [],
      contributions: [],
      totalAmount: (content_object.amount || 0).toString(),
      raw: {
        ...content_object,
        created_date: created_date || new Date().toISOString(),
        action_date: action_date || new Date().toISOString(),
        author: safeAuthor,
        hub: content_object.hub || { name: 'Unknown', slug: 'unknown' },
        paper: content_object.paper || null,
      },
    };
  }

  // Helper function to transform a raw fundraise from the feed API to a Fundraise object
  static transformRawFundraise(rawFundraise: RawApiFeedEntry): Fundraise {
    if (!rawFundraise) {
      throw new Error('Raw fundraise is undefined');
    }

    const { content_object } = rawFundraise;

    if (!content_object) {
      throw new Error('Raw fundraise content_object is undefined');
    }

    // Create a raw format expected by the transformer
    const formattedRawFundraise = {
      id: content_object.id,
      status: content_object.status,
      goal_currency: content_object.goal_currency,
      goal_amount: {
        usd: content_object.goal_amount?.usd || 0,
        rsc: content_object.goal_amount?.rsc || 0,
      },
      amount_raised: {
        usd: content_object.amount_raised?.usd || 0,
        rsc: content_object.amount_raised?.rsc || 0,
      },
      start_date: content_object.start_date,
      end_date: content_object.end_date,
      contributors: {
        total: content_object.contributors?.total || 0,
        top: (content_object.contributors?.top || []).map((contributor: any) => ({
          author_profile: contributor.author_profile,
        })),
      },
      created_date: content_object.created_date,
      updated_date: content_object.updated_date,
    };

    return transformFundraise(formattedRawFundraise);
  }
}
