'use client';

import type { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';

interface OnchainProviderProps {
  children: ReactNode;
}

/**
 * Provider component for blockchain interactions using Coinbase's OnchainKit
 * Configures wallet connections and blockchain interactions
 */
export function OnchainProvider({ children }: OnchainProviderProps) {
  return (
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
      }}
      chain={base}
    >
      {children}
    </OnchainKitProvider>
  );
}
