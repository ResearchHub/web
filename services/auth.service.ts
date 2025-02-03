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
      return await ApiClient.post<User>(`${this.BASE_PATH}/auth/register/`, credentials, {
        rawError: true,
      });
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
      throw new Error('Failed to fetch user data');
    }

    const data = await response.json();
    return {
      results: data.results.map(transformUser),
    };
  }
}
