import { ApiError, ApiResponse } from './types';

export class ApiClient {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  private static async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json()
    
    if (!response.ok) {
      throw new ApiError(
        data.message || 'An error occurred',
        response.status,
        data.errors
      )
    }
    
    return data
  }

  private static createHeaders(options?: RequestInit): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options?.headers,
    }
  }

  private static async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        ...options,
        headers: this.createHeaders(options),
        credentials: 'include',
      })
      
      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError('Network error occurred', 500)
    }
  }

  static async get<T>(endpoint: string, params?: Record<string, string>) {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params)}`
      : endpoint
    return this.fetch<T>(url, { method: 'GET' })
  }

  static async post<T>(
    endpoint: string, 
    data?: unknown, 
    options?: RequestInit
  ) {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  static async put<T>(endpoint: string, data: unknown) {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  static async delete(endpoint: string) {
    return this.fetch(endpoint, { method: 'DELETE' })
  }
} 