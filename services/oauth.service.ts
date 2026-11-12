import { ApiClient } from './client';
import { ApiError } from '@/services/types';
import {
  transformConnectedApp,
  transformOAuthConsentRequest,
  type ConnectedApp,
  type ConnectedAppApiResponse,
  type OAuthConsentRequest,
  type OAuthConsentRequestApiResponse,
  type OAuthRedirectApiResponse,
} from '@/types/oauth';

type ConsentApiResponse = OAuthConsentRequestApiResponse | OAuthRedirectApiResponse;

export type OAuthConsentResult =
  | { kind: 'consent'; request: OAuthConsentRequest }
  | { kind: 'redirect'; url: string };

/**
 * Service for the OAuth consent page and the apps a user has connected.
 * The consent calls forward the client's authorization request unchanged as
 * the query string, and the backend validates it each time,
 * so redirect URLs only ever come from the backend.
 */
export class OAuthService {
  private static readonly AUTHORIZE_PATH = '/api/oauth/authorize/';
  private static readonly CONNECTED_APPS_PATH = '/api/oauth/connected_apps/';

  /**
   * Fetches the OAuth consent request based on the query string.
   * Returns either a consent request or a redirect URL.
   */
  static async getConsentRequest(query: string): Promise<OAuthConsentResult> {
    const response = await ApiClient.get<ConsentApiResponse>(`${this.AUTHORIZE_PATH}?${query}`);
    if ('redirect_url' in response) {
      return { kind: 'redirect', url: response.redirect_url };
    }
    return { kind: 'consent', request: transformOAuthConsentRequest(response) };
  }

  /**
   * Returns the URL that takes the user back to the client with their decision.
   */
  static async decide(query: string, allow: boolean): Promise<string> {
    const response = await ApiClient.post<OAuthRedirectApiResponse>(
      `${this.AUTHORIZE_PATH}?${query}`,
      { allow }
    );
    return response.redirect_url;
  }

  /**
   * Returns the apps the user has connected, most recently used first,
   * or `null` if OAuth is disabled on the backend.
   */
  static async getConnectedApps(): Promise<ConnectedApp[] | null> {
    try {
      const response = await ApiClient.get<ConnectedAppApiResponse[]>(this.CONNECTED_APPS_PATH);
      return response.map(transformConnectedApp);
    } catch (error) {
      // The backend hides its OAuth endpoints while OAuth is disabled
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  }

  /**
   * Revokes the app's access to the user's account.
   */
  static async revokeConnectedApp(id: number): Promise<void> {
    await ApiClient.deleteNoContent(`${this.CONNECTED_APPS_PATH}${id}/`);
  }
}
