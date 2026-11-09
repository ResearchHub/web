import { ApiClient } from './client';
import {
  transformOAuthConsentRequest,
  type OAuthConsentRequest,
  type OAuthConsentRequestApiResponse,
  type OAuthRedirectApiResponse,
} from '@/types/oauth';

type ConsentApiResponse = OAuthConsentRequestApiResponse | OAuthRedirectApiResponse;

export type OAuthConsentResult =
  | { kind: 'consent'; request: OAuthConsentRequest }
  | { kind: 'redirect'; url: string };

/**
 * Service for handling OAuth consent requests and decisions.
 * Both calls forward the client's authorization request unchanged as
 * the query string, and the backend validates it each time,
 * so redirect URLs only ever come from the backend.
 */
export class OAuthService {
  private static readonly BASE_PATH = '/api/oauth/authorize/';

  /**
   * Fetches the OAuth consent request based on the query string.
   * Returns either a consent request or a redirect URL.
   */
  static async getConsentRequest(query: string): Promise<OAuthConsentResult> {
    const response = await ApiClient.get<ConsentApiResponse>(`${this.BASE_PATH}?${query}`);
    if ('redirect_url' in response) {
      return { kind: 'redirect', url: response.redirect_url };
    }
    return { kind: 'consent', request: transformOAuthConsentRequest(response) };
  }

  /**
   * Returns the URL that takes the user back to the client with their decision.
   */
  static async decide(query: string, allow: boolean): Promise<string> {
    const response = await ApiClient.post<OAuthRedirectApiResponse>(`${this.BASE_PATH}?${query}`, {
      allow,
    });
    return response.redirect_url;
  }
}
