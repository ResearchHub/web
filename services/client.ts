import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getSession } from 'next-auth/react'

export class ApiClient {
  private static readonly baseURL = process.env.NEXT_PUBLIC_API_URL;

  private static async getAuthToken() {
    // For server-side requests
    if (typeof window === 'undefined') {
      const session = await getServerSession(authOptions);
      return session?.authToken;
    }
    
    // For client-side requests
    const session = await getSession();
    return session?.authToken;
  }

  private static async getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const authToken = await this.getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Token ${authToken}`;
    }

    return headers;
  }

  static async get<T>(path: string) {
    const response = await fetch(`${this.baseURL}${path}`, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  static async post<T>(path: string, body?: any) {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
} 