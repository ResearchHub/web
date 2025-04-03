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
        const session = await getServerSession(authOptions);
        if (session?.authToken) {
          this.globalAuthToken = session.authToken;
          console.log('[ApiClient] Server-side token initialized:', session.authToken);
          return session.authToken;
        } else {
          console.log('[ApiClient] Server-side session has no authToken');
        }
      } else {
        const session = await getSession();
        if (session?.authToken) {
          this.globalAuthToken = session.authToken;
          console.log('[ApiClient] Client-side token initialized:', session.authToken);
          return session.authToken;
        } else {
          console.log('[ApiClient] Client-side session has no authToken');
        }
      }
      return null;
    } finally {
      this.tokenInitPromise = null;
    }
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
    } else {
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

  private static logRequest(
    method: string,
    url: string,
    headers: Record<string, string>,
    body?: any
  ) {
    const isServer = typeof window === 'undefined';
    const environment = isServer ? 'SERVER' : 'CLIENT';
    const authHeader = headers['Authorization'] || 'No Auth Header';

    console.log(`[ApiClient:${environment}] ${method} ${url}`);
    console.log(`[ApiClient:${environment}] Headers:`, {
      ...headers,
      Authorization: authHeader, // Log the full auth header
    });

    if (body && method !== 'GET') {
      console.log(
        `[ApiClient:${environment}] Body:`,
        body instanceof FormData ? 'FormData (not stringifiable)' : body
      );
    }
  }

  static async get<T>(path: string): Promise<T> {
    try {
      const headers = await this.getHeaders('GET');
      const url = `${this.baseURL}${path}`;

      this.logRequest('GET', url, headers);

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
      console.error('API request failed:', error);
      throw error;
    }
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
      const url = `${this.baseURL}${path}`;

      this.logRequest('GET (Blob)', url, headers);

      const response = await fetch(url, {
        ...this.getFetchOptions('GET', headers),
        headers: headers, // Override headers
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      return response.blob();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async post<T>(path: string, body?: any): Promise<T> {
    try {
      const headers = await this.getHeaders('POST');
      const url = `${this.baseURL}${path}`;

      this.logRequest('POST', url, headers, body);

      const response = await fetch(url, this.getFetchOptions('POST', headers, body));

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
    } catch (error) {
      console.error('API POST request failed:', error);
      throw error;
    }
  }

  static async patch<T>(path: string, body?: any): Promise<T> {
    try {
      const headers = await this.getHeaders('PATCH');
      const url = `${this.baseURL}${path}`;

      this.logRequest('PATCH', url, headers, body);

      const response = await fetch(url, this.getFetchOptions('PATCH', headers, body));

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
      console.error('API PATCH request failed:', error);
      throw error;
    }
  }

  static async delete<T>(path: string, body?: any): Promise<T> {
    try {
      const headers = await this.getHeaders('DELETE');
      const url = `${this.baseURL}${path}`;

      this.logRequest('DELETE', url, headers, body);

      const response = await fetch(url, this.getFetchOptions('DELETE', headers, body));

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
      console.error('API DELETE request failed:', error);
      throw error;
    }
  }
}
