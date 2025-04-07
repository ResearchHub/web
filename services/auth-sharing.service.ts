import Cookies from 'js-cookie';
import { AUTH_TOKEN } from '@/config/constants';
import { signOut } from 'next-auth/react';

/**
 * Service to handle authentication sharing between the old and new ResearchHub applications
 */
export class AuthSharingService {
  private static readonly ENV_PREFIX = (() => {
    switch (process.env.VERCEL_ENV) {
      case 'production':
        return 'prod';
      case 'preview':
      case 'development':
        return 'stg';
      default:
        return 'local';
    }
  })();

  private static readonly AUTH_COOKIE_NAME = `${AuthSharingService.ENV_PREFIX}.${AUTH_TOKEN}`;

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
   * Sets the authentication token in a shared cookie that can be accessed by both domains
   * @param token The authentication token to store
   * @param expiryDays Number of days until the cookie expires (default: 14)
   */
  static setSharedAuthToken(token: string, expiryDays = 14): void {
    const cookieOptions: Cookies.CookieAttributes = {
      expires: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
      path: '/',
      domain: this.PARENT_DOMAIN,
      secure: process.env.VERCEL_ENV !== undefined,
      sameSite: 'lax',
    };

    console.log('[AuthSharing] Setting shared auth token:', {
      cookieName: this.AUTH_COOKIE_NAME,
      domain: cookieOptions.domain,
      environment: process.env.VERCEL_ENV,
    });

    Cookies.set(this.AUTH_COOKIE_NAME, token, cookieOptions);

    const verifyToken = Cookies.get(this.AUTH_COOKIE_NAME);
    console.log('[AuthSharing] Verify cookie was set:', {
      cookieName: this.AUTH_COOKIE_NAME,
      wasSet: !!verifyToken,
      matches: verifyToken === token,
    });
  }

  /**
   * Gets the authentication token from the shared cookie
   * @returns The authentication token or null if not found
   */
  static getSharedAuthToken(): string | null {
    const token = Cookies.get(this.AUTH_COOKIE_NAME);
    console.log('[AuthSharing] Getting shared auth token:', {
      cookieName: this.AUTH_COOKIE_NAME,
      found: !!token,
    });
    return token || null;
  }

  /**
   * Removes the shared authentication token (logout)
   */
  static removeSharedAuthToken(): void {
    Cookies.remove(this.AUTH_COOKIE_NAME, {
      domain: this.PARENT_DOMAIN,
      path: '/',
    });
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
