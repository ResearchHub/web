// API Infrastructure
export interface ApiResponse<T = unknown> {
    data: T
    message?: string
  }
  
  export class ApiError extends Error {
    constructor(
      public message: string,
      public status?: number,
      public errors?: Record<string, string[]>
    ) {
      super(message)
      this.name = 'ApiError'
  }
}
