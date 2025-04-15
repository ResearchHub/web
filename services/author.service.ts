import { ApiClient } from './client';
import { User, transformUser } from '@/types/user';

interface AuthorResponse {
  id: number;
  first_name: string;
  last_name: string;
  slug: string;
  profile_image?: string;
  description?: string;
}

interface AuthorsApiResponse {
  results: AuthorResponse[];
}

interface FollowResponse {
  id: number;
  content_type: string;
  type: string;
  object_id: number;
  created_date: string;
  updated_date: string;
}

interface AuthorProfileResponse {
  id: number;
  first_name: string;
  last_name: string;
  profile_image?: string | null;
  description?: string | null;
  headline?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  google_scholar?: string | null;
  education?: any[];
  [key: string]: any; // Allow other properties
}

export interface Author {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
}

// Add this interface for the update payload
interface AuthorUpdatePayload {
  first_name?: string;
  last_name?: string;
  description?: string;
  // Assuming education updates are handled separately or structure is known
  // education?: Array<{ id?: number; name?: string; /* ... other fields ... */ }>;
  headline?: { title: string; isPublic?: boolean } | string | null; // Allow object or string based on sample vs existing types
  linkedin?: string | null;
  twitter?: string | null;
  orcid_id?: string | null;
  google_scholar?: string | null;
  // profile_image update might be handled via a separate endpoint/method like AvatarUpload uses
}

// Helper function (can be kept or removed if not needed elsewhere)
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return blob;
}

// Interface for the update payload parameters
// Export this interface
export interface AuthorUpdateParams extends AuthorUpdatePayload {
  profileImageDataUrl?: string | null; // Add image data URL
}

export class AuthorService {
  private static readonly BASE_PATH = '/api/search/person';
  private static readonly AUTHORS_PATH = '/api/author';

  // Cache to store previously fetched author data
  private static authorCache: Record<number, User> = {};

  static async getAuthors(): Promise<Author[]> {
    const response = await ApiClient.get<AuthorsApiResponse>(`${this.BASE_PATH}/`);
    return response.results.map((author) => ({
      id: author.id,
      name: author.first_name + ' ' + author.last_name,
      slug: author.slug,
      imageUrl: author.profile_image,
      description: author.description,
    }));
  }

  static async getFollowedAuthors(): Promise<number[]> {
    const response = await ApiClient.get<FollowResponse[]>('/api/author/following/');
    return response.map((follow) => follow.object_id);
  }

  static async followAuthor(authorId: number): Promise<void> {
    await ApiClient.post(`${this.AUTHORS_PATH}/${authorId}/follow/`);
  }

  static async unfollowAuthor(authorId: number): Promise<void> {
    await ApiClient.post(`${this.AUTHORS_PATH}/${authorId}/unfollow/`);
  }

  /**
   * Get author information for the tooltip
   */
  static async getAuthorInfo(authorId: number): Promise<User> {
    // Check if we already have cached data for this author
    if (this.authorCache[authorId]) {
      return this.authorCache[authorId];
    }

    try {
      const response = await ApiClient.get<AuthorProfileResponse>(
        `${this.AUTHORS_PATH}/${authorId}/minimal_overview/`
      );

      // Check response structure and ensure it contains expected fields
      if (!response) {
        throw new Error('Received empty response from API');
      }

      // Properly prepare the data for transformUser
      let userData;
      if ('author_profile' in response) {
        // Response already has the expected structure
        userData = transformUser(response);
      } else if ('id' in response) {
        // Response is an author profile directly - wrap it properly
        // Create a user object with the author profile data
        userData = transformUser({
          id: response.id,
          first_name: response.first_name,
          last_name: response.last_name,
          author_profile: {
            ...response,
            id: response.id,
            first_name: response.first_name,
            last_name: response.last_name,
            profile_image: response.profile_image,
            description: response.description,
            orcid_id: response.orcid_id,
          },
        });
      } else {
        throw new Error('Response does not contain expected author data');
      }

      // Cache the result
      this.authorCache[authorId] = userData;

      return userData;
    } catch (error) {
      console.error(`Error fetching author info for ID ${authorId}:`, error);

      // Try to fetch using the alternative method if the first one fails
      try {
        console.log(`Trying alternative method for author ID: ${authorId}`);
        const response = await ApiClient.get<AuthorProfileResponse>(
          `${this.AUTHORS_PATH}/${authorId}/`
        );
        console.log('Alternative method response structure:', Object.keys(response || {}));

        // Ensure the response is wrapped correctly for transformUser
        const userData = transformUser({
          id: response.id,
          first_name: response.first_name,
          last_name: response.last_name,
          author_profile: {
            ...response,
            id: response.id,
            first_name: response.first_name,
            last_name: response.last_name,
            profile_image: response.profile_image,
            description: response.description,
            orcid_id: response.orcid_id,
          },
        });

        // Cache the result
        this.authorCache[authorId] = userData;

        return userData;
      } catch (secondError) {
        console.error(`Both fetch methods failed for author ID ${authorId}:`, secondError);
        throw error; // Throw the original error
      }
    }
  }

  /**
   * Update author profile information, potentially including profile image via FormData.
   * NOTE: Requires API and ApiClient.patch support for multipart/form-data on PATCH.
   */
  static async updateInfo(authorId: number, params: AuthorUpdateParams): Promise<void> {
    const formData = new FormData();
    const { profileImageDataUrl, ...jsonData } = params;

    // Append JSON data fields to FormData
    Object.entries(jsonData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Special handling for headline
        if (key === 'headline') {
          // Ensure value is a non-empty string before formatting
          if (typeof value === 'string' && value.trim() !== '') {
            const headlineObject = { title: value, isPublic: true }; // Default isPublic to true
            formData.append(key, JSON.stringify(headlineObject));
          } else {
            // If headline is empty or not a string, append null or omit based on API needs
            // Omitting for now if empty/invalid
            // formData.append(key, null); // Or handle as backend expects
          }
        }
        // Handle other non-object fields
        else if (typeof value !== 'object') {
          formData.append(key, String(value));
        }
        // Skipping other complex objects for now
        // else if (typeof value === 'object') { ... }
      }
    });

    // Append profile image if provided
    if (profileImageDataUrl && profileImageDataUrl.startsWith('data:image')) {
      try {
        const imageBlob = await dataUrlToBlob(profileImageDataUrl);
        formData.append('profile_image', imageBlob, 'profile_image.png');
      } catch (error) {
        console.error('Error converting image data URL to Blob:', error);
        throw new Error('Failed to process profile image.');
      }
    }

    // Check if there's anything to send
    let hasDataToSend = false;
    for (const _ of formData.entries()) {
      hasDataToSend = true;
      break;
    }
    if (!hasDataToSend) {
      console.log('No data fields or image to update.');
      return;
    }

    try {
      // Send FormData using PATCH
      await ApiClient.patch(`${this.AUTHORS_PATH}/${authorId}/`, formData);
      // Optionally invalidate cache
      delete this.authorCache[authorId];
    } catch (error) {
      console.error(`Error updating author info via PATCH FormData for ID ${authorId}:`, error);
      throw error; // Re-throw
    }
  }

  /**
   * Clear the cache for testing or when needed
   */
  static clearCache(): void {
    this.authorCache = {};
  }
}
