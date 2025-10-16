import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthService } from '@/services/auth.service';
import { AuthSharingService } from '@/services/auth-sharing.service';

// Debug flag - set to true to enable detailed authentication logging
const DEBUG_AUTH = true;

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
          // If we have an authToken from the shared cookie, use that directly
          if (credentials?.authToken) {
            try {
              // Fetch user data using the provided authToken
              const userData = await AuthService.fetchUserData(credentials.authToken);
              const user = userData.results[0];

              return {
                id: Number(user.id),
                email: user.email,
                authToken: credentials.authToken,
              };
            } catch (error) {
              AuthSharingService.removeSharedAuthToken();
              return promptInvalidCredentials();
            }
          }

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
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.type === 'oauth') {
        try {
          // Log OAuth token state for debugging
          if (DEBUG_AUTH) {
            console.log('[Auth] Google OAuth callback received', {
              hasAccessToken: !!account?.access_token,
              hasIdToken: !!account?.id_token,
              accountProvider: account?.provider,
              timestamp: new Date().toISOString(),
            });
          }

          // Validate required tokens
          if (!account?.access_token || !account?.id_token) {
            console.error('[Auth] Missing OAuth tokens', {
              hasAccessToken: !!account?.access_token,
              hasIdToken: !!account?.id_token,
            });
            throw new Error('MissingOAuthTokens');
          }

          const data = await AuthService.googleLogin({
            access_token: account.access_token,
            id_token: account.id_token,
          });

          // Validate API response
          if (!data || !data.key) {
            console.error('[Auth] Invalid response from googleLogin', {
              hasData: !!data,
              hasKey: !!data?.key,
            });
            throw new Error('InvalidAuthResponse');
          }

          // Then fetch user data using the AuthService
          const userData = await AuthService.fetchUserData(data.key);

          // Validate user data
          if (!userData?.results?.[0]) {
            console.error('[Auth] Invalid user data response', {
              hasUserData: !!userData,
              hasResults: !!userData?.results,
              resultsLength: userData?.results?.length || 0,
            });
            throw new Error('InvalidUserData');
          }

          const user = userData.results[0];

          // Store auth token and user ID
          (account as any).authToken = data.key;
          (account as any).userId = user.id;

          if (DEBUG_AUTH) {
            console.log('[Auth] Google OAuth successful', {
              userId: user.id,
              timestamp: new Date().toISOString(),
            });
          }

          return true;
        } catch (error) {
          const errorType = error instanceof Error ? error.message : 'AuthenticationFailed';
          console.error('[Auth] Google OAuth error', {
            error: errorType,
            errorType: error instanceof Error ? error.constructor.name : typeof error,
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
          });
          throw new Error(errorType);
        }
      }

      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.includes('/auth/error')) {
        const urlObj = new URL(url, baseUrl);
        const error = urlObj.searchParams.get('error');

        if (
          error &&
          (error === 'OAuthSignin' || error === 'OAuthCallback' || error === 'AccessDenied')
        ) {
          urlObj.searchParams.set('error', 'OAuthAccountNotLinked');
        }

        return urlObj.toString();
      }

      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
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
