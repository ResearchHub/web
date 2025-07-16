'use client';

import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import client from '@/lib/apollo-client';
import { ReactNode } from 'react';

interface ApolloProviderProps {
  children: ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}
