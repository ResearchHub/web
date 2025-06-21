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
        const session = await getServerSession(authOptions);
        if (session?.authToken) {
          return session.authToken;
        }
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

  static async get<T>(path: string, body?: string): Promise<T> {
    try {
      const headers = await this.getHeaders('GET');
      // Check if the path is already a full URL
      // If it is, use it as is, otherwise prepend the base URL
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

      const response = await fetch(`${this.baseURL}${path}`, {
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

  static async put<T>(path: string, body?: any): Promise<T> {
    const headers = await this.getHeaders('PUT');
    const response = await fetch(
      `${this.baseURL}${path}`,
      this.getFetchOptions('PUT', headers, body)
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
      console.error('API request failed:', error);
      throw error;
    }
  }
}
