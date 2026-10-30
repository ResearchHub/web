import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
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
    TwitterProvider({
      id: 'x',
      name: 'X',
      clientId: process.env.X_CLIENT_ID!,
      clientSecret: process.env.X_CLIENT_SECRET!,
      version: '2.0',
      authorization: {
        url: 'https://x.com/i/oauth2/authorize',
        params: { scope: 'users.read users.email tweet.read' },
      },
      token: {
        url: 'https://api.x.com/2/oauth2/token',
        async request({ params, checks, provider }) {
          if (
            params.error ||
            !params.code ||
            !checks.state ||
            params.state !== checks.state ||
            !checks.code_verifier
          ) {
            throw new Error('Invalid X OAuth callback');
          }

          const session = await getServerSession(authOptions);
          const data = await AuthService.authenticateWithX(
            {
              code: params.code,
              code_verifier: checks.code_verifier,
              redirect_uri: provider.callbackUrl,
            },
            session?.authToken
          );

          return {
            tokens: {
              access_token: data.access_token,
              token_type: 'bearer',
              authToken: data.key,
            },
          };
        },
      },
      userinfo: { url: 'https://api.x.com/2/users/me' },
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
    error: '/api/auth/signin',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'x') {
        try {
          // Log OAuth token state for debugging
          if (DEBUG_AUTH) {
            console.log('[Auth] OAuth callback received', {
              hasAccessToken: !!account?.access_token,
              hasIdToken: !!account?.id_token,
              accountProvider: account?.provider,
              timestamp: new Date().toISOString(),
            });
          }

          // Validate required tokens
          if (!account.access_token || (account.provider === 'google' && !account.id_token)) {
            console.error('[Auth] Missing OAuth tokens', {
              hasAccessToken: !!account?.access_token,
              hasIdToken: !!account?.id_token,
            });
            throw new Error('MissingOAuthTokens');
          }

          const data =
            account.provider === 'x'
              ? { key: account.authToken }
              : await AuthService.googleLogin({
                  access_token: account.access_token,
                  id_token: account.id_token,
                });

          // Validate API response
          if (!data || !data.key) {
            console.error('[Auth] Invalid OAuth login response', {
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

          const authenticatedUser = userData.results[0];

          // Store auth token and user ID
          user.email = authenticatedUser.email;
          (account as any).authToken = data.key;
          (account as any).userId = authenticatedUser.id;

          if (DEBUG_AUTH) {
            console.log('[Auth] OAuth successful', {
              userId: authenticatedUser.id,
              timestamp: new Date().toISOString(),
            });
          }

          return true;
        } catch (error) {
          // Log detailed error information
          console.error('[Auth] OAuth error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            errorType: error instanceof Error ? error.constructor.name : typeof error,
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
          });

          // Preserve specific error messages for better debugging
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
