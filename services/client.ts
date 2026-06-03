import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { getSession } from 'next-auth/react';
import { ApiError } from './types';

export class ApiClient {
  private static readonly baseURL = process.env.NEXT_PUBLIC_API_URL;
  private static globalAuthToken: string | null = null;
  private static tokenInitPromise: Promise<string | null> | null = null;

  static setGlobalAuthToken(token: string | null) {
    this.globalAuthToken = token;
    this.tokenInitPromise = null;
  }

  static getGlobalAuthToken(): string | null {
    return this.globalAuthToken;
  }

  private static async getAuthToken() {
    if (typeof window === 'undefined') {
      return this.initializeToken();
    }

    if (this.globalAuthToken) {
      return this.globalAuthToken;
    }

    if (this.tokenInitPromise) {
      return this.tokenInitPromise;
    }

    this.tokenInitPromise = this.initializeToken();
    return this.tokenInitPromise;
  }

  private static async initializeToken(): Promise<string | null> {
    try {
      if (typeof window === 'undefined') {
        return await this.getServerAuthToken();
      } else {
        const session = await getSession();
        if (session?.authToken) {
          this.globalAuthToken = session.authToken;
          return session.authToken;
        }
      }
      return null;
    } finally {
      this.tokenInitPromise = null;
    }
  }

  /**
   * Resolve the auth token during server-side rendering by decoding the
   * next-auth session cookie directly from the incoming request headers.
   *
   * We deliberately do not rely solely on `getServerSession` here: inside
   * React Server Components it intermittently returns null even when the
   * session cookie is present and valid (the `/api/auth/session` route reads
   * the same cookie fine). When that happens, authenticated SSR fetches go out
   * with no Authorization header, so the backend 404s private documents and
   * the page renders a (misleading) not-found. Reading the cookie via
   * `next/headers` and decoding it with `getToken` is request-scoped and
   * deterministic. `getServerSession` is kept as a fallback.
   *
   * `next/headers` and `next-auth/jwt` are imported dynamically so they are
   * never pulled into the client bundle (this module is shared with the browser).
   */
  private static async getServerAuthToken(): Promise<string | null> {
    try {
      const [{ cookies }, { getToken }] = await Promise.all([
        import('next/headers'),
        import('next-auth/jwt'),
      ]);
      // next-auth's getToken reads cookie values from `req.cookies` (via its
      // `.getAll()` shape), not from a raw `cookie` header string. Next's
      // cookie store satisfies that shape, and getToken handles the `__Secure-`
      // prefix and chunked session cookies automatically. `secret` and
      // `secureCookie` default to the same env-derived values next-auth used to
      // set the cookie, so names and the decryption key line up across
      // prod/preview/dev.
      const cookieStore = await cookies();
      const token = await getToken({ req: { cookies: cookieStore } as any });
      const authToken = token?.authToken;
      if (typeof authToken === 'string' && authToken.length > 0) {
        return authToken;
      }
    } catch (error) {
      console.error('Failed to decode auth token from request cookies:', error);
    }

    try {
      const session = await getServerSession(authOptions);
      if (session?.authToken) {
        return session.authToken;
      }
    } catch (error) {
      console.error('getServerSession fallback failed:', error);
    }

    return null;
  }

  private static isNotFoundError(error: unknown): boolean {
    return error instanceof ApiError && error.status === 404;
  }

  private static logError(error: unknown): void {
    const log = this.isNotFoundError(error) ? console.warn : console.error;
    log('API request failed:', error);
  }

  private static async getHeaders(method: string) {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    const authToken = await this.getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Token ${authToken}`;
    } else if (typeof window !== 'undefined') {
      console.warn('No auth token available for request');
    }

    return headers;
  }

  private static getFetchOptions(
    method: string = 'GET',
    headers: Record<string, string>,
    body?: any
  ): RequestInit {
    if (body instanceof FormData) {
      // Remove Content-Type header for FormData to let browser set it with boundary
      const formDataHeaders = { ...headers };
      delete formDataHeaders['Content-Type'];

      return {
        method,
        headers: formDataHeaders,
        mode: 'cors',
        cache: 'no-cache',
        body: body,
      };
    }

    return {
      method,
      headers,
      mode: 'cors',
      cache: 'no-cache',
      body: body ? JSON.stringify(body) : undefined,
    };
  }

  static async getStream(
    path: string,
    options?: { signal?: AbortSignal; accept?: string }
  ): Promise<Response> {
    const headers = await this.getHeaders('GET');
    if (options?.accept) {
      headers['Accept'] = options.accept;
    }
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    return fetch(url, {
      method: 'GET',
      headers,
      mode: 'cors',
      cache: 'no-cache',
      signal: options?.signal,
    });
  }

  private static async fetchJson<T>(path: string, headers: Record<string, string>): Promise<T> {
    try {
      const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
      const response = await fetch(url, this.getFetchOptions('GET', headers));

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: 'Invalid JSON response from server' };
        }
        throw new ApiError(errorData.message || 'Request failed', response.status, errorData);
      }

      return response.json();
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }

  /**
   * Makes an authenticated GET request for endpoints that require authentication.
   * Automatically includes the auth token in the headers.
   */
  static async get<T>(path: string): Promise<T> {
    const headers = await this.getHeaders('GET');
    return this.fetchJson<T>(path, headers);
  }

  /**
   * Makes an unauthenticated GET request for public endpoints.
   */
  static async getPublic<T>(path: string): Promise<T> {
    return this.fetchJson<T>(path, { Accept: 'application/json' });
  }

  /**
   * Fetches binary data from an API endpoint and returns it as a Blob.
   * Primarily used for downloading files like CSV exports of transactions.
   * Removes Content-Type and Accept headers to properly handle blob responses.
   */
  static async getBlob(path: string): Promise<Blob> {
    try {
      const headers = await this.getHeaders('GET');
      delete headers['Accept']; // Remove Accept header to allow blob response

      const response = await fetch(`${this.baseURL}${path}`, {
        ...this.getFetchOptions('GET', headers),
        headers: headers, // Override headers
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      return response.blob();
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }

  static async post<T>(path: string, body?: any): Promise<T> {
    const headers = await this.getHeaders('POST');
    const response = await fetch(
      `${this.baseURL}${path}`,
      this.getFetchOptions('POST', headers, body)
    );

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Invalid JSON response from server' };
      }
      throw new ApiError(errorData.message || 'Request failed', response.status, errorData);
    }

    // Try to parse JSON, but don't fail if there's nothing to parse
    // Some endpoints return empty responses,
    // eg when creating a new publication (POST: /api/author/${authorId}/publications/)
    // In this case, the response is an empty object
    try {
      return await response.json();
    } catch (e) {
      // If parsing fails, return an empty object
      return {} as T;
    }
  }

  static async patch<T>(path: string, body?: any): Promise<T> {
    const headers = await this.getHeaders('PATCH');
    const response = await fetch(
      `${this.baseURL}${path}`,
      this.getFetchOptions('PATCH', headers, body)
    );

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Invalid JSON response from server' };
      }
      throw new ApiError(errorData.message || 'Request failed', response.status, errorData);
    }

    return response.json();
  }

  static async delete<T>(path: string, body?: any): Promise<T> {
    try {
      const headers = await this.getHeaders('DELETE');
      const response = await fetch(
        `${this.baseURL}${path}`,
        this.getFetchOptions('DELETE', headers, body)
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: 'Invalid JSON response from server' };
        }
        throw new ApiError(errorData.message || 'Request failed', response.status, errorData);
      }

      return response.json();
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }

  static async deleteNoContent(path: string): Promise<void> {
    const headers = await this.getHeaders('DELETE');
    const response = await fetch(`${this.baseURL}${path}`, this.getFetchOptions('DELETE', headers));
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Invalid JSON response from server' };
      }
      throw new ApiError(errorData.message || 'Request failed', response.status, errorData);
    }
  }
}
