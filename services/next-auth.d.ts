// services/next-auth.d.ts
import 'next-auth';
import type { User } from '@/types/user';

declare module 'next-auth' {
  interface Session {
    user: User;
    authToken?: string;
    isLoggedIn?: boolean;
    error?: string;
  }

  interface JWT {
    authToken?: string;
    isLoggedIn?: boolean;
    error?: string;
    user?: User;
  }

  interface User {
    authToken?: string;
  }
}
