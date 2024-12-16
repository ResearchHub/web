import { ApiClient } from './client'
import type { 
  LoginApiRequest, 
  LoginApiResponse, 
  RegisterApiRequest, 
  CheckAccountApiResponse 
} from './types'
import type { User } from '@/types/user'

export class AuthService {
  private static readonly BASE_PATH = '/api'

  static async checkAccount(email: string) {
    return ApiClient.post<CheckAccountApiResponse>(
      `${this.BASE_PATH}/check_account/`, 
      { email }
    )
  }

  static async login(credentials: LoginApiRequest) {
    return ApiClient.post<LoginApiResponse>(
      `${this.BASE_PATH}/login/`, 
      credentials
    )
  }

  static async register(credentials: RegisterApiRequest) {
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