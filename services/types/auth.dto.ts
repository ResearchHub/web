import type { User } from '@/types/user';

export interface LoginApiRequest {
  email: string;
  password: string;
}

export interface LoginApiResponse {
  user?: User;
  token?: string;
  key?: string;
  mfa_required?: boolean;
  ephemeral_token?: string;
}

export interface VerifyMfaApiRequest {
  ephemeral_token: string;
  code: string;
}

export interface VerifyMfaApiResponse {
  key?: string;
}

export interface RegisterApiRequest {
  email: string;
  password1: string;
  password2: string;
  first_name: string;
  last_name: string;
  referral_code?: string;
}

export interface CheckAccountApiResponse {
  exists: boolean;
  auth?: 'google' | 'email';
  is_verified?: boolean;
}

export interface PasswordResetConfirmRequest {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
}
