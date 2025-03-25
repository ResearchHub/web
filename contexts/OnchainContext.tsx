'use client';

import type { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';

export function OnchainProvider(props: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      config={{
        appearance: {
          name: '',
          logo: 'flask.svg',
          mode: 'auto',
          theme: 'light',
        },
        wallet: {
          display: 'modal',
        },
      }}
      chain={base}
    >
      {props.children}
    </OnchainKitProvider>
  );
}
