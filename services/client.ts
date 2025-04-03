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
    }

    return headers;
  }

  private static getFetchOptions(
    method: string = 'GET',
    headers: Record<string, string>,
    body?: any
  ): RequestInit {
    if (body instanceof FormData) {
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
    // Removed logging
  }

  static async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    try {
      const headers = await this.getHeaders('GET');
      let url = `${this.baseURL}${path}`;

      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value);
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

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
      const url = `${this.baseURL}${path}`;

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

      return response.blob();
    } catch (error) {
      throw error;
    }
  }

  static async post<T>(path: string, body?: any): Promise<T> {
    try {
      const headers = await this.getHeaders('POST');
      const url = `${this.baseURL}${path}`;

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

      try {
        return await response.json();
      } catch (e) {
        return {} as T;
      }
    } catch (error) {
      throw error;
    }
  }

  static async patch<T>(path: string, body?: any): Promise<T> {
    try {
      const headers = await this.getHeaders('PATCH');
      const url = `${this.baseURL}${path}`;

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
      throw error;
    }
  }

  static async delete<T>(path: string, body?: any): Promise<T> {
    try {
      const headers = await this.getHeaders('DELETE');
      const url = `${this.baseURL}${path}`;

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
      throw error;
    }
  }
}
