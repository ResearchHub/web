'use client';

import { useAccount, useBalance } from 'wagmi';
import { useMemo } from 'react';
import { RSC } from '@/constants/tokens';

interface UseWalletRSCBalanceReturn {
  balance: number;
  balanceData: ReturnType<typeof useBalance>['data'];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to check the connected wallet's RSC balance
 * @returns An object containing the wallet's RSC balance and related states
 */
export function useWalletRSCBalance(): UseWalletRSCBalanceReturn {
  const { address } = useAccount();

  const {
    data: balanceData,
    isLoading,
    error,
  } = useBalance({
    address,
    token: RSC.address && RSC.address.startsWith('0x') ? (RSC.address as `0x${string}`) : undefined,
    chainId: RSC.chainId,
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
