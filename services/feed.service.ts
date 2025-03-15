import { ApiClient } from './client';
import { FeedEntry, FeedApiResponse, transformFeedEntry, RawApiFeedEntry } from '@/types/feed';
import { Bounty, BountyType, transformBounty } from '@/types/bounty';
import { transformUser } from '@/types/user';
import { transformAuthorProfile } from '@/types/authorProfile';

export class FeedService {
  private static readonly BASE_PATH = '/api/feed';

  static async getFeed(params?: {
    page?: number;
    pageSize?: number;
    feedView?: string;
    hubSlug?: string;
  }): Promise<{ entries: FeedEntry[]; hasMore: boolean }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
    if (params?.feedView) queryParams.append('feed_view', params.feedView);
    if (params?.hubSlug) queryParams.append('hub_slug', params.hubSlug);

    const url = `${this.BASE_PATH}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log(`Fetching feed from URL: ${url}`);

    try {
      const response = await ApiClient.get<FeedApiResponse>(url);

      // For debugging - log the raw response
      console.log('Raw feed response:', response);

      // Transform the raw entries into FeedEntry objects
      const transformedEntries = response.results
        .map(transformFeedEntry)
        .filter((entry) => entry.contentType !== 'COMMENT');
      console.log(`Transformed ${transformedEntries.length} feed entries`);

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
    let user;
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
        authorProfile: {
          id: safeAuthor.id || 0,
          fullName:
            `${safeAuthor.first_name || ''} ${safeAuthor.last_name || ''}`.trim() || 'Unknown User',
          profileImage: safeAuthor.profile_image || '',
          headline: safeAuthor.description || '',
          profileUrl: `/profile/${safeAuthor.id || 0}`,
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
          },
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
}
