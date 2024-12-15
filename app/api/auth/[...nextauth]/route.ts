import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import type { User } from '@/types/user'
import { transformUserData } from '@/services/types/user.dto'

// Direct fetch for auth route to avoid circular dependency
async function fetchUserData(authToken: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/`, {
    headers: {
      'Authorization': `Token ${authToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }

  return response.json();
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === 'google') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              access_token: account.access_token,
              id_token: account.id_token,
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to authenticate with API: ${response.status}`);
          }

          const data = await response.json();
          token.authToken = data.key;
          token.isLoggedIn = true;
        } catch (error) {
          console.error('API authentication failed:', error);
          token.isLoggedIn = false;
          token.error = 'Authentication failed';
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (!token.authToken) {
        return {
          ...session,
          isLoggedIn: false,
        }
      }

      // Always fetch user data to validate token and get latest user info
      try {
        const userData = await fetchUserData(token.authToken as string);
        
        // Legacy check for authenticated user
        const isAuthenticated = Boolean(userData.results.length > 0 && userData.results[0]);
        
        if (isAuthenticated) {
          const transformedUser = transformUserData(userData.results[0]);

          return {
            ...session,
            authToken: token.authToken,
            isLoggedIn: true,
            user: transformedUser, // Using our User type directly
          }
        }
      } catch (error) {
        console.error('Token validation/user fetch failed:', error);
        return {
          ...session,
          user: undefined,
          isLoggedIn: false,
          error: 'Session expired',
        }
      }

      // If we get here, something went wrong
      return {
        ...session,
        isLoggedIn: false,
        error: 'Failed to fetch user data',
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 




