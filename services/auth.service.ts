import { ApiClient } from './client';
import {
  type LoginApiRequest,
  type LoginApiResponse,
  type RegisterApiRequest,
  type CheckAccountApiResponse,
  type PasswordResetConfirmRequest,
  ApiError,
} from './types';
import type { User } from '@/types/user';
import { transformUser } from '@/types/user';

// Debug flag - set to true to enable detailed authentication logging
const DEBUG_AUTH = true;

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthService {
  private static readonly BASE_PATH = '/api';

  static async checkAccount(email: string) {
    return ApiClient.post<CheckAccountApiResponse>(`${this.BASE_PATH}/user/check_account/`, {
      email,
    });
  }

  static async login(credentials: LoginApiRequest) {
    return ApiClient.post<LoginApiResponse>(`${this.BASE_PATH}/auth/login/`, credentials);
  }

  static async register(credentials: RegisterApiRequest) {
    try {
      return await ApiClient.post<User>(`${this.BASE_PATH}/auth/register/`, credentials);
    } catch (error: any) {
      const status = error instanceof ApiError ? error.status : undefined;
      const data = error instanceof ApiError ? error.errors : {};
      const errorMsg = Object.values(data as Record<string, string[]>)?.[0]?.[0];
      throw new AuthError(errorMsg || 'Registration failed', status);
    }
  }

  static async verifyEmail(key: string) {
    try {
      return await ApiClient.post<{ key: string }>(
        `${this.BASE_PATH}/auth/register/verify-email/`,
        { key }
      );
    } catch (error: any) {
      if (error instanceof ApiError) {
        const errorValues = Object.values(error.errors as Record<string, string[]>)?.[0];
        const errorMessage = Array.isArray(errorValues)
          ? errorValues[0]
          : typeof errorValues === 'string'
            ? errorValues
            : 'Email verification failed';
        throw new ApiError(errorMessage, error.status, error.errors);
      }

      throw new ApiError('Email verification failed', 500);
    }
  }

  static async resetPassword(email: string) {
    return ApiClient.post(`${this.BASE_PATH}/auth/password-reset/`, { email });
  }

  static async confirmPasswordReset(data: PasswordResetConfirmRequest) {
    try {
      return await ApiClient.post<{ key: string }>(`${this.BASE_PATH}/auth/confirm/`, data);
    } catch (error: any) {
      if (error instanceof ApiError) {
        const errorValues = Object.values(error.errors as Record<string, string[]>)?.[0];
        const errorMessage = Array.isArray(errorValues)
          ? errorValues[0]
          : typeof errorValues === 'string'
            ? errorValues
            : 'Password reset confirmation failed';
        throw new ApiError(errorMessage, error.status, error.errors);
      }

      throw new ApiError('Password reset confirmation failed', 500);
    }
  }

  static async getUser() {
    return ApiClient.get<User>(`${this.BASE_PATH}/user/`);
  }

  static async logout() {
    return ApiClient.post(`${this.BASE_PATH}/logout/`);
  }

  static async fetchUserData(authToken: string): Promise<{ results: User[] }> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/user/`;

    if (DEBUG_AUTH) {
      console.log('[AuthService] Fetching user data', {
        url,
        hasAuthToken: !!authToken,
        tokenLength: authToken?.length,
        timestamp: new Date().toISOString(),
      });
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Token ${authToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[AuthService] Failed to fetch user data', {
        status: response.status,
        statusText: response.statusText,
        url,
        timestamp: new Date().toISOString(),
      });
      throw new AuthError('Failed to fetch user data', response.status);
    }

    const data = await response.json();

    if (DEBUG_AUTH) {
      console.log('[AuthService] User data fetched successfully', {
        resultsCount: data.results?.length || 0,
        hasResults: !!data.results,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      results: data.results.map(transformUser),
    };
  }

  static async googleLogin(tokens: { access_token?: string; id_token?: string }) {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${this.BASE_PATH}/auth/google/login/`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_token: tokens.access_token,
          id_token: tokens.id_token,
        }),
      });

      if (!response.ok) {
        // Log error details for debugging
        const errorBody = await response.text().catch(() => 'Unable to read response body');
        console.error('[AuthService] Google login failed', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorBody,
          hasAccessToken: !!tokens.access_token,
          hasIdToken: !!tokens.id_token,
          url: url,
          timestamp: new Date().toISOString(),
        });

        if (response.status === 400 || response.status === 403 || response.status === 409) {
          throw new Error('OAuthAccountNotLinked');
        }
        throw new Error('AuthenticationFailed');
      }

      const data = await response.json();

      // Validate response data
      if (!data || !data.key) {
        console.error('[AuthService] Google login response missing key', {
          hasData: !!data,
          hasKey: !!data?.key,
          responseKeys: data ? Object.keys(data) : [],
        });
      }

      return data;
    } catch (error) {
      // Log network or parsing errors
      console.error('[AuthService] Google login exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        url: url,
        hasAccessToken: !!tokens.access_token,
        hasIdToken: !!tokens.id_token,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }
}
