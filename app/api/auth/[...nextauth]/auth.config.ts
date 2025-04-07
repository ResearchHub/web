import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthService } from '@/services/auth.service';
import { AuthSharingService } from '@/services/auth-sharing.service';

const promptInvalidCredentials = () => null;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        authToken: { label: 'Auth Token', type: 'text' },
      },
      async authorize(credentials, req) {
        try {
          console.log('[NextAuth DEBUG] authorize called with credentials:', {
            hasEmail: !!credentials?.email,
            hasPassword: !!credentials?.password,
            hasAuthToken: !!credentials?.authToken,
          });

          // If we have an authToken from the shared cookie, use that directly
          if (credentials?.authToken) {
            console.log('[NextAuth DEBUG] Using provided authToken for direct authentication');
            try {
              // Fetch user data using the provided authToken
              const userData = await AuthService.fetchUserData(credentials.authToken);
              const user = userData.results[0];

              console.log('[NextAuth DEBUG] Successfully fetched user with authToken');
              return {
                id: Number(user.id),
                email: user.email,
                authToken: credentials.authToken,
              };
            } catch (error) {
              console.error('[NextAuth DEBUG] Failed to fetch user with authToken:', error);
              return promptInvalidCredentials();
            }
          }

          if (!credentials?.email || !credentials?.password) {
            console.log('[NextAuth DEBUG] Missing email or password');
            return promptInvalidCredentials();
          }

          console.log('[NextAuth DEBUG] Attempting to login with email/password');
          const loginResponse = await AuthService.login({
            email: credentials.email,
            password: credentials.password,
          });

          if (!loginResponse.key) {
            console.log('[NextAuth DEBUG] No key in login response');
            return promptInvalidCredentials();
          }

          console.log('[NextAuth DEBUG] Login successful, fetching user data with token');
          // Then fetch user data using the AuthService
          const userData = await AuthService.fetchUserData(loginResponse.key);
          // The API returns an array of results, but for user data we only expect
          // and need the first element since it represents the current authenticated user
          const user = userData.results[0];

          console.log('[NextAuth DEBUG] User data fetched successfully');
          return {
            id: Number(user.id),
            email: user.email,
            authToken: loginResponse.key,
          };
        } catch (error) {
          console.error('[NextAuth DEBUG] Error in authorize callback:', error);
          return promptInvalidCredentials();
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[NextAuth DEBUG] signIn callback called:', {
        accountType: account?.type,
        userId: user?.id,
      });

      if (account?.type === 'oauth') {
        try {
          console.log('[NextAuth DEBUG] Handling OAuth login');
          const data = await AuthService.googleLogin({
            access_token: account?.access_token,
            id_token: account?.id_token,
          });

          console.log('[NextAuth DEBUG] Google login successful, fetching user data');
          // Then fetch user data using the AuthService
          const userData = await AuthService.fetchUserData(data.key);
          // The API returns an array of results, but for user data we only expect
          // and need the first element since it represents the current authenticated user
          const user = userData.results[0];

          if (data.key) {
            console.log('[NextAuth DEBUG] Setting authToken and userId on account');
            (account as any).authToken = data.key;
            (account as any).userId = user.id;
          }

          return true;
        } catch (error) {
          console.error('[NextAuth DEBUG] Error in OAuth login:', error);
          // Instead of returning an error object, throw it to trigger next-auth's error handling
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error('AuthenticationFailed');
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      console.log('[NextAuth DEBUG] jwt callback called:', {
        hasUser: !!user,
        hasAccount: !!account,
        tokenSub: token.sub,
        authToken: token.authToken,
      });

      if (account && user) {
        console.log('[NextAuth DEBUG] Setting authToken on JWT token');
        return {
          ...token,
          authToken: account.type === 'credentials' ? user.authToken : account.authToken,
          sub: account.type === 'credentials' ? token.sub : account.userId,
        };
      }

      return token;
    },

    async session({ session, token }) {
      if (!token.authToken) {
        return {
          ...session,
          isLoggedIn: false,
          userId: undefined,
          error: 'AuthenticationFailed',
        };
      }

      try {
        return {
          ...session,
          authToken: token.authToken,
          isLoggedIn: true,
          userId: token.sub,
        };
      } catch (error) {
        console.error('Session callback failed:', error);
        return {
          ...session,
          userId: undefined,
          isLoggedIn: false,
          error: 'SessionExpired',
        };
      }
    },
  },
};
