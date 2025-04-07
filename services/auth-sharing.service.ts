import Cookies from 'js-cookie';
import { AUTH_TOKEN } from '@/config/constants';
import { ApiClient } from './client';
import { signIn, signOut } from 'next-auth/react';
import { AuthService } from '@/services/auth.service';

/**
 * Service to handle authentication sharing between the old and new ResearchHub applications
 */
export class AuthSharingService {
  /**
   * The parent domain that both applications share (for cookie sharing)
   */
  private static readonly PARENT_DOMAIN = (() => {
    switch (process.env.VERCEL_ENV) {
      case 'production':
        return '.researchhub.com';
      case 'preview':
      case 'development':
        return '.staging.researchhub.com';
      default:
        return 'localhost';
    }
  })();

  /**
   * The specific domain for the current application
   */
  private static readonly CURRENT_DOMAIN = (() => {
    switch (process.env.VERCEL_ENV) {
      case 'production':
        return 'new.researchhub.com';
      case 'preview':
      case 'development':
        return 'v2.staging.researchhub.com';
      default:
        return 'localhost';
    }
  })();

  /**
   * Sets the authentication token in a shared cookie that can be accessed by both domains
   * @param token The authentication token to store
   * @param expiryDays Number of days until the cookie expires (default: 14)
   */
  static setSharedAuthToken(token: string, expiryDays = 14): void {
    const cookieOptions: Cookies.CookieAttributes = {
      expires: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
      path: '/',
    };

    // Add additional options only for production/staging
    if (process.env.VERCEL_ENV) {
      cookieOptions.secure = true;
      cookieOptions.sameSite = 'lax';

      if (this.PARENT_DOMAIN !== 'localhost') {
        cookieOptions.domain = this.PARENT_DOMAIN;
      }
    }

    console.log('[AuthSharing] Setting shared auth token:', {
      token: token ? `${token.substring(0, 5)}...` : null,
      domain: cookieOptions.domain,
      currentDomain: this.CURRENT_DOMAIN,
      parentDomain: this.PARENT_DOMAIN,
      environment: process.env.VERCEL_ENV,
      cookieOptions,
    });

    Cookies.set(AUTH_TOKEN, token, cookieOptions);

    const verifyToken = Cookies.get(AUTH_TOKEN);
    console.log('[AuthSharing] Verify cookie was set:', {
      wasSet: !!verifyToken,
      matches: verifyToken === token,
    });
  }

  /**
   * Gets the authentication token from the shared cookie
   * @returns The authentication token or null if not found
   */
  static getSharedAuthToken(): string | null {
    const token = Cookies.get(AUTH_TOKEN);
    console.log('[AuthSharing] Getting shared auth token:', {
      found: !!token,
      token: token ? `${token.substring(0, 5)}...` : null,
      allCookies: document.cookie.split(';').map((cookie) => cookie.trim()),
    });
    return token || null;
  }

  /**
   * Removes the shared authentication token (logout)
   */
  static removeSharedAuthToken(): void {
    // Remove from both specific and parent domains to ensure cleanup
    const domains = [this.CURRENT_DOMAIN, this.PARENT_DOMAIN].filter(Boolean);

    domains.forEach((domain) => {
      Cookies.remove(AUTH_TOKEN, {
        domain,
        path: '/',
      });
    });
  }

  /**
   * Fetches user data from the API using the provided auth token
   * @param token The authentication token to use
   * @returns User data from the API
   */
  static async fetchUserDataWithToken(token: string) {
    console.log(
      '[AuthSharing] Fetching user data with token:',
      token ? `${token.substring(0, 5)}...` : null
    );

    try {
      const userData = await AuthService.fetchUserData(token);
      console.log('[AuthSharing] Successfully fetched user data');
      return userData;
    } catch (error) {
      console.error('[AuthSharing] Failed to fetch user data with token:', error);
      throw error;
    }
  }

  /**
   * Checks if there's a shared auth token that doesn't match the current session,
   * and tries to authenticate with it.
   * @param currentSessionToken The current session token to compare against
   * @returns True if authenticated with a new token, false otherwise
   */
  static async checkAndAuthenticateWithSharedToken(currentSessionToken?: string): Promise<boolean> {
    const sharedToken = this.getSharedAuthToken();

    if (!sharedToken) {
      console.log('[AuthSharing] No shared token found');
      return false;
    }

    // If current session matches the shared token, no need to re-authenticate
    if (currentSessionToken && currentSessionToken === sharedToken) {
      console.log(
        '[AuthSharing] Current session token matches shared token, no need to re-authenticate'
      );
      return false;
    }

    console.log(
      '[AuthSharing] Found shared token that differs from current session, trying to authenticate'
    );
    return this.signInWithSharedToken();
  }

  /**
   * Signs in to the new app using a token from the old app
   * This should be called when detecting a token from the old app
   */
  static async signInWithSharedToken(): Promise<boolean> {
    const token = this.getSharedAuthToken();

    console.log('[AuthSharing] Attempting to sign in with shared token:', {
      hasToken: !!token,
    });

    if (!token) {
      console.log('[AuthSharing] No shared token found, cannot sign in');
      return false;
    }

    try {
      // First validate the token by fetching user data
      console.log('[AuthSharing] Validating token by fetching user data');
      try {
        await this.fetchUserDataWithToken(token);
      } catch (error) {
        console.error('[AuthSharing] Token validation failed, not proceeding with sign in:', error);
        return false;
      }

      // Call NextAuth signIn method with the credentials provider
      console.log('[AuthSharing] Calling NextAuth signIn with credentials');
      const result = await signIn('credentials', {
        redirect: false,
        authToken: token,
      });

      console.log('[AuthSharing] NextAuth signIn result:', {
        success: result?.ok,
        error: result?.error,
        status: result?.status,
      });

      return result?.ok || false;
    } catch (error) {
      console.error('[AuthSharing] Failed to sign in with shared token:', error);
      return false;
    }
  }

  /**
   * Signs out from both applications by removing the token
   * and calling the signOut method
   */
  static async signOutFromBothApps(): Promise<void> {
    console.log('[AuthSharing] Signing out from both apps');

    // First remove the shared cookie
    this.removeSharedAuthToken();

    // Finally, sign out from NextAuth
    console.log('[AuthSharing] Calling NextAuth signOut');
    await signOut({ callbackUrl: '/' });
  }
}
