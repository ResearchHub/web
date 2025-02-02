import { transformUser } from '@/types/user';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthService } from '@/services/auth.service';

// Direct fetch for auth route to avoid circular dependency
async function fetchUserData(authToken: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/`, {
    headers: {
      Authorization: `Token ${authToken}`,
      Accept: 'application/json',
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
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Invalid credentials');
          }
          const loginResponse = await AuthService.login({
            email: credentials.email,
            password: credentials.password,
          });

          if (!loginResponse.key) {
            return null;
          }

          // Then fetch user data using the token
          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/`, {
            headers: {
              Authorization: `Token ${loginResponse.key}`,
              Accept: 'application/json',
            },
          });

          if (!userResponse.ok) {
            return null;
          }

          const userData = await userResponse.json();
          const user = transformUser(userData.results[0]);

          return {
            id: String(user.id),
            email: user.email,
            name: user.fullName,
            authToken: loginResponse.key,
          };
        } catch (error) {
          return null;
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
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/login/`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                access_token: account?.access_token,
                id_token: account?.id_token,
              }),
            }
          );

          if (!response.ok) {
            switch (response.status) {
              case 401:
                throw new Error('AuthenticationFailed');
              case 403:
                throw new Error('AccessDenied');
              case 409:
                throw new Error('Verification');
              default:
                throw new Error('AuthenticationFailed');
            }
          }

          const data = await response.json();
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

    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          authToken: account.type === 'credentials' ? user.authToken : account.authToken,
        };
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
        const userData = await fetchUserData(token.authToken as string);
        const isAuthenticated = Boolean(userData.results.length > 0 && userData.results[0]);

        if (isAuthenticated) {
          const transformedUser = transformUser(userData.results[0]);

          return {
            ...session,
            authToken: token.authToken,
            isLoggedIn: true,
            user: transformedUser,
          };
        } else {
          return {
            ...session,
            isLoggedIn: false,
            error: 'AccessDenied',
          };
        }
      } catch (error) {
        console.error('Session callback failed:', error);
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
