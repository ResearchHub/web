import NextAuthProvider from '@/components/providers/NextAuthProvider';
import ToasterProvider from '@/components/providers/ToasterProvider';
import '@coinbase/onchainkit/styles.css';
import localFont from 'next/font/local';
import './globals.css';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ExchangeRateProvider } from '@/contexts/ExchangeRateContext';
import { CurrencyPreferenceProvider } from '@/contexts/CurrencyPreferenceContext';
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
import SignupModalContainer from '@/components/modals/SignupModalContainer';
import ShareModalTrigger from '@/components/modals/ShareModalTrigger';
import { SITE_CONFIG } from '@/lib/metadata';
import AnalyticsProvider from '@/components/providers/AnalyticsProvider';
import { ShareModalProvider } from '@/contexts/ShareContext';

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
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: ['research', 'science', 'academic', 'collaboration', 'open science'],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
  openGraph: {
    type: 'website',
    title: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    images: [
      {
        url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
        type: 'image/png',
      },
    ],
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.locale,
  },
  twitter: {
    card: 'summary_large_image',
    site: SITE_CONFIG.twitterHandle,
    creator: SITE_CONFIG.twitterHandle,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [`${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClickProvider>
          <OnchainProvider>
            <NextAuthProvider session={session}>
              <AnalyticsProvider>
                <AuthSharingWrapper>
                  <AuthModalProvider>
                    <ShareModalProvider>
                      <UserProvider>
                        <VerificationProvider>
                          <ExchangeRateProvider>
                            <CurrencyPreferenceProvider>
                              <NotificationProvider>
                                <OrganizationProvider>
                                  <FollowProvider>{children}</FollowProvider>
                                </OrganizationProvider>
                              </NotificationProvider>
                            </CurrencyPreferenceProvider>
                          </ExchangeRateProvider>
                        </VerificationProvider>
                      </UserProvider>
                      <SignupModalContainer />
                      {/* <ShareModalTrigger /> */}
                    </ShareModalProvider>
                  </AuthModalProvider>
                </AuthSharingWrapper>
              </AnalyticsProvider>
            </NextAuthProvider>
            <ToasterProvider />
          </OnchainProvider>
        </ClickProvider>
      </body>
    </html>
  );
}
