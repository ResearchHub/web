import localFont from 'next/font/local';

import './globals.css';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/auth.config';
import { SITE_CONFIG } from '@/lib/metadata';
import { generateOrganizationStructuredData } from '@/lib/structured-data';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import Clarity from '@/components/Clarity';
import { ClientProviders } from '@/components/providers/ClientProviders';

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
  other: {
    'application/ld+json': JSON.stringify(generateOrganizationStructuredData()),
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
        <ClientProviders session={session}>{children}</ClientProviders>
        {process.env.GA_MEASUREMENT_ID && <GoogleAnalytics gaId={process.env.GA_MEASUREMENT_ID} />}
        <Analytics />
        <Clarity />
      </body>
    </html>
  );
}
