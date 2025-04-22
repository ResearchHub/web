import { ApiClient } from './client';
import {
  type LoginApiRequest,
  type LoginApiResponse,
  type RegisterApiRequest,
  type CheckAccountApiResponse,
  ApiError,
} from './types';
import type { User } from '@/types/user';
import { transformUser } from '@/types/user';

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
      const { data, status } = JSON.parse(error.message);
      const errorMsg = Object.values(data as Record<string, string[]>)?.[0]?.[0];
      throw new ApiError(errorMsg || 'Registration failed', status, data);
    }
  }

  static async resetPassword(email: string) {
    return ApiClient.post(`${this.BASE_PATH}/reset-password/`, { email });
  }

  static async getUser() {
    return ApiClient.get<User>(`${this.BASE_PATH}/user/`);
  }

  static async logout() {
    return ApiClient.post(`${this.BASE_PATH}/logout/`);
  }

  static async fetchUserData(authToken: string): Promise<{ results: User[] }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/`, {
      headers: {
        Authorization: `Token ${authToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new AuthError('Failed to fetch user data', response.status);
    }

    const data = await response.json();
    return {
      results: data.results.map(transformUser),
    };
  }

  static async googleLogin(tokens: { access_token?: string; id_token?: string }) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${this.BASE_PATH}/auth/google/login/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_token: tokens.access_token,
          id_token: tokens.id_token,
        }),
      }
    );

    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new Error('AuthenticationFailed');
        case 403:
          throw new Error('AccessDenied');
        case 409:
          throw new Error('Verification');
        default:
          throw new Error('AuthenticationFailed');
      }
    }

    return response.json();
  }
}
