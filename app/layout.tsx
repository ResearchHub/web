import NextAuthProvider from '@/components/providers/NextAuthProvider';
import ToasterProvider from '@/components/providers/ToasterProvider';
import '@coinbase/onchainkit/styles.css';
import localFont from 'next/font/local';
import './globals.css';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ExchangeRateProvider } from '@/contexts/ExchangeRateContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/auth.config';
import { UserProvider } from '@/contexts/UserContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { OnchainProvider } from '@/contexts/OnchainContext';
import { FollowProvider } from '@/contexts/FollowContext';
import { ClickProvider } from '@/contexts/ClickContext';

import { AuthSharingWrapper } from '@/components/AuthSharingWrapper';
import { VerificationProvider } from '@/contexts/VerificationContext';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicons/favicon-16x16.png', sizes: '16x16' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32' },
      { url: '/favicons/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicons/favicon.ico',
    apple: [{ url: '/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      { rel: 'android-chrome', url: '/favicons/android-chrome-144x144.png', sizes: '144x144' },
      { rel: 'mask-icon', url: '/favicons/mstile-150x150.png', color: '#da532c' },
    ],
  },
  manifest: '/favicons/site.webmanifest',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <title>ResearchHub | Open Science Community</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClickProvider>
          <OnchainProvider>
            <NextAuthProvider session={session}>
              <AuthSharingWrapper>
                <AuthModalProvider>
                  <UserProvider>
                    <VerificationProvider>
                      <ExchangeRateProvider>
                        <NotificationProvider>
                          <OrganizationProvider>
                            <FollowProvider>{children}</FollowProvider>
                          </OrganizationProvider>
                        </NotificationProvider>
                      </ExchangeRateProvider>
                    </VerificationProvider>
                  </UserProvider>
                </AuthModalProvider>
              </AuthSharingWrapper>
            </NextAuthProvider>
            <ToasterProvider />
          </OnchainProvider>
        </ClickProvider>
      </body>
    </html>
  );
}
