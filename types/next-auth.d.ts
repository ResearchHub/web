import 'next-auth';
import type { User as RHUser } from '@/types/user';
import type { AuthorProfile } from '@/types/authorProfile';

declare module 'next-auth' {
  interface Session {
    userId: string;
    authToken?: string;
    isLoggedIn?: boolean;
    error?: string;
    user?: User;
  }

  interface JWT {
    authToken?: string;
    isLoggedIn?: boolean;
    error?: string;
    userId: string;
  }

  interface User {
    id?: number;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    authToken?: string;
    fullName?: string;
    authorProfile?: AuthorProfile;
    balance?: number;
  }
}
