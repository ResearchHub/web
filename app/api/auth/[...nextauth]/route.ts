import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import type { User } from '@/types/user'
import { transformUserData } from '@/services/types/user.dto'

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
            throw new Error(`Failed to authenticate with backend: ${response.status}`);
          }

          const data = await response.json();
          token.authToken = data.key;
          token.isLoggedIn = true;
          
          // Fetch user data immediately after successful login
          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
            headers: {
              'Authorization': `Token ${data.key}`,
              'Accept': 'application/json',
            },
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.results?.[0]) {
              token.user = transformUserData(userData.results[0]); // We'll create this function
            }
          }
        } catch (error) {
          console.error('Backend authentication failed:', error);
          token.isLoggedIn = false;
          token.error = 'Authentication failed';
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Only fetch user data if we have a token but no user data
      if (token.authToken && !token.user) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
            headers: {
              'Authorization': `Token ${token.authToken}`,
              'Accept': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.results?.[0]) {
              token.user = transformUserData(data.results[0]) as User;
            } else {
              token.isLoggedIn = false;
              token.error = 'User data not found';
            }
          } else {
            token.isLoggedIn = false;
            token.error = 'Session expired';
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          token.isLoggedIn = false;
          token.error = 'Failed to fetch user data';
        }
      }

      // Update session with current token state
      return {
        ...session,
        authToken: token.authToken,
        isLoggedIn: token.isLoggedIn,
        error: token.error,
        user: token.user || session.user,
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




