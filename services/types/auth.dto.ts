import type { User } from '@/types/user';

export interface LoginApiRequest {
  email: string;
  password: string;
}

export interface LoginApiResponse {
  user?: User;
  token?: string;
  key?: string;
}

export interface RegisterApiRequest {
  email: string;
  password1: string;
  password2: string;
  first_name: string;
  last_name: string;
}

export interface CheckAccountApiResponse {
  exists: boolean;
  auth?: 'google' | 'email';
  is_verified?: boolean;
}
