'use client';

import type { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';

export function Providers(props: { children: ReactNode }) {
  return (
    <OnchainKitProvider apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY} chain={base}>
      {props.children}
    </OnchainKitProvider>
  );
}
