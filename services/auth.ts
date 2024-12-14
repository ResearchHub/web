import { ApiClient } from './client'
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  CheckAccountResponse 
} from './types'
import type { User } from '@/types/user'

export class AuthService {
  private static readonly BASE_PATH = '/api'

  static async checkAccount(email: string) {
    return ApiClient.post<CheckAccountResponse>(
      `${this.BASE_PATH}/check_account/`, 
      { email }
    )
  }

  static async login(credentials: LoginRequest) {
    return ApiClient.post<LoginResponse>(
      `${this.BASE_PATH}/login/`, 
      credentials
    )
  }

  static async register(credentials: RegisterRequest) {
    return ApiClient.post<User>(
      `${this.BASE_PATH}/register/`, 
      credentials
    )
  }

  static async resetPassword(email: string) {
    return ApiClient.post(
      `${this.BASE_PATH}/reset-password/`, 
      { email }
    )
  }

  static async getUser() {
    return ApiClient.get<User>(`${this.BASE_PATH}/user/`)
  }

  static async logout() {
    return ApiClient.post(`${this.BASE_PATH}/logout/`)
  }
} 