import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthService } from '@/services/auth.service';

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
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return promptInvalidCredentials();
          }
          const loginResponse = await AuthService.login({
            email: credentials.email,
            password: credentials.password,
          });

          if (!loginResponse.key) {
            return promptInvalidCredentials();
          }

          // Then fetch user data using the AuthService
          const userData = await AuthService.fetchUserData(loginResponse.key);
          // The API returns an array of results, but for user data we only expect
          // and need the first element since it represents the current authenticated user
          const user = userData.results[0];

          return {
            id: Number(user.id),
            email: user.email,
            authToken: loginResponse.key,
          };
        } catch (error) {
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
      if (account?.type === 'oauth') {
        try {
          const data = await AuthService.googleLogin({
            access_token: account?.access_token,
            id_token: account?.id_token,
          });

          // Then fetch user data using the AuthService
          const userData = await AuthService.fetchUserData(data.key);
          // The API returns an array of results, but for user data we only expect
          // and need the first element since it represents the current authenticated user
          const user = userData.results[0];

          if (data.key) {
            (account as any).authToken = data.key;
            (account as any).userId = user.id;
          }

          return true;
        } catch (error) {
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
      if (account && user) {
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
