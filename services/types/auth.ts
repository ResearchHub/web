import type { User } from '@/types/user'

// Auth DTOs
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token?: string
}

export interface RegisterRequest {
  email: string
  password1: string
  password2: string
  first_name: string
  last_name: string
}

export interface CheckAccountResponse {
  exists: boolean
  auth?: 'google' | 'email'
  is_verified?: boolean
} 