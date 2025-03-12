// services/next-auth.d.ts
import 'next-auth';
import type { User as RHUser } from '@/types/user';
import type { AuthorProfile } from '@/types/authorProfile';

declare module 'next-auth' {
  interface Session {
    userId: string;
    authToken?: string;
    isLoggedIn?: boolean;
    error?: string;
  }

  interface JWT {
    authToken?: string;
    isLoggedIn?: boolean;
    error?: string;
    userId: string;
  }

  interface User {
    authToken?: string;
    id?: number;
    fullName?: string;
    authorProfile?: AuthorProfile;
    balance?: number;
  }
}
