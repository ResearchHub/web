import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthService } from '@/services/auth.service';
import { isUser } from '@/types/user';

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
      async authorize(credentials) {
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
            id: String(user.id),
            email: user.email,
            name: user.fullName,
            authToken: loginResponse.key,
            userData: user,
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

          if (data.key) {
            (account as any).authToken = data.key;
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

    async jwt({ token, user, account, trigger }) {
      // Handle initial sign in
      if (account && user) {
        if (account.type === 'credentials') {
          return {
            ...token,
            authToken: user.authToken,
            userData: user.userData,
          };
        } else if (account.type === 'oauth') {
          const userData = await AuthService.fetchUserData(account.authToken as string);
          return {
            ...token,
            authToken: account.authToken,
            userData: userData.results[0],
          };
        }
      }

      // The `useSession()` hook exposes a `update(data?: any): Promise<Session | null>` method that can be used to update the session
      // the `update()` method will trigger a jwt callback with the `trigger: "update"` option.
      if (trigger === 'update') {
        try {
          const userData = await AuthService.fetchUserData(token.authToken as string);
          return {
            ...token,
            userData: userData.results[0],
          };
        } catch (error) {
          console.error('Token update failed:', error);
          return {
            ...token,
            error: 'RefreshAccessTokenError',
          };
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!token.authToken) {
        return {
          ...session,
          isLoggedIn: false,
          error: 'AuthenticationFailed',
        };
      }

      try {
        if (!token.userData || !isUser(token.userData)) {
          throw new Error('Invalid user data structure');
        }

        return {
          ...session,
          authToken: token.authToken,
          isLoggedIn: true,
          user: token.userData,
        };
      } catch (error) {
        return {
          ...session,
          user: undefined,
          isLoggedIn: false,
          error: 'SessionExpired',
        };
      }
    },
  },
};
