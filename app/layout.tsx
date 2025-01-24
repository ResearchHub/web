'use client';

import NextAuthProvider from '@/components/providers/NextAuthProvider';
import ToasterProvider from '@/components/providers/ToasterProvider';
import localFont from 'next/font/local';
import './globals.css';
import '@coinbase/onchainkit/styles.css';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ExchangeRateProvider } from '@/contexts/ExchangeRateContext';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { goerli } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';

const config = createConfig({
  chains: [goerli],
  transports: {
    [goerli.id]: http(),
  },
});

const queryClient = new QueryClient();

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <OnchainKitProvider apiKey="R3BNRouiK50tlGik0WVtWwZJXRxpDECM" chain={goerli}>
              <NextAuthProvider>
                <NotificationProvider>
                  <ExchangeRateProvider>{children}</ExchangeRateProvider>
                </NotificationProvider>
              </NextAuthProvider>
            </OnchainKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}
