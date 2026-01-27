'use client';

import { useAccount, useBalance } from 'wagmi';
import { useMemo } from 'react';
import { getRSCForNetwork, NetworkType } from '@/constants/tokens';

interface UseWalletRSCBalanceReturn {
  balance: number;
  balanceData: ReturnType<typeof useBalance>['data'];
  isLoading: boolean;
  error: Error | null;
}

interface UseWalletRSCBalanceOptions {
  network?: NetworkType;
}

/**
 * Hook to check the connected wallet's RSC balance
 * @param options - Options including network selection
 * @returns An object containing the wallet's RSC balance and related states
 */
export function useWalletRSCBalance(
  options: UseWalletRSCBalanceOptions = {}
): UseWalletRSCBalanceReturn {
  const { network = 'BASE' } = options;
  const { address } = useAccount();

  const rscToken = useMemo(() => getRSCForNetwork(network), [network]);

  const {
    data: balanceData,
    isLoading,
    error,
  } = useBalance({
    address,
    token: rscToken.address?.startsWith('0x') ? (rscToken.address as `0x${string}`) : undefined,
    chainId: rscToken.chainId,
  });

  const balance = useMemo(
    () => (balanceData ? parseFloat(balanceData.formatted) : 0),
    [balanceData]
  );

  return {
    balance,
    balanceData,
    isLoading,
    error: error || null,
  };
}
