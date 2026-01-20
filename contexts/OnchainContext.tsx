'use client';

import type { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia, mainnet, sepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';

const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL?.trim() || undefined;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://researchhub.com';

const productionConfig = createConfig({
  chains: [base, mainnet],
  connectors: [
    coinbaseWallet({
      appName: 'ResearchHub',
      preference: 'all',
    }),
    metaMask({
      dappMetadata: {
        name: 'ResearchHub',
        url: SITE_URL,
      },
    }),
  ],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});

const developmentConfig = createConfig({
  chains: [baseSepolia, sepolia],
  connectors: [
    coinbaseWallet({
      appName: 'ResearchHub',
      preference: 'all',
    }),
    metaMask({
      dappMetadata: {
        name: 'ResearchHub',
        url: SITE_URL,
      },
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

const wagmiConfig = IS_PRODUCTION ? productionConfig : developmentConfig;

const queryClient = new QueryClient();

interface OnchainProviderProps {
  children: ReactNode;
}

/**
 * Provider component for blockchain interactions using Coinbase's OnchainKit
 * Configures wallet connections and blockchain interactions for Base and Ethereum networks
 */
export function OnchainProvider({ children }: OnchainProviderProps) {
  const primaryChain = IS_PRODUCTION ? base : baseSepolia;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          projectId={process.env.NEXT_PUBLIC_CDP_PROJECT_ID}
          config={{
            appearance: {
              name: 'ResearchHub',
              logo: 'flask.webp',
              mode: 'auto',
              theme: 'light',
            },
            wallet: {
              display: 'modal',
            },
            paymaster: PAYMASTER_URL,
          }}
          chain={primaryChain}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
