import 'next-auth';

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
    id?: number;
    email?: string | null;
    authToken?: string;
  }
}
