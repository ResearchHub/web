'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';

interface UseIsEOAReturn {
  isEOA: boolean | null;
  isLoading: boolean;
}

/**
 * Hook to check if the connected wallet is an Externally Owned Account (EOA)
 * or a Smart Contract Wallet
 *
 * @param trigger - Optional value that will trigger a re-check when changed
 * @returns An object containing:
 *   - isEOA: boolean | null - true if EOA, false if smart wallet, null if unknown
 *   - isLoading: boolean - true while checking
 */
export const useIsEOA = (trigger?: unknown): UseIsEOAReturn => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [isEOA, setIsEOA] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset state when dependencies change
    setIsEOA(null);

    // Early exit if no wallet connected or no client available
    if (!address || !publicClient) {
      setIsLoading(false);
      return;
    }

    // Set up race condition protection
    let isCurrent = true;
    setIsLoading(true);

    publicClient
      .getCode({ address })
      .then((code) => {
        if (!isCurrent) return;
        // Viem always returns a string, and EOAs have exactly "0x" as code
        setIsEOA(code === '0x');
      })
      .catch((error) => {
        if (!isCurrent) return;
        console.error('Error checking if address is EOA:', error);
        // Default to allowing EOAs in case of error - security model choice
        setIsEOA(true);
      })
      .finally(() => {
        if (!isCurrent) return;
        setIsLoading(false);
      });

    // Clean up function to prevent stale updates
    return () => {
      isCurrent = false;
    };
  }, [address, publicClient, trigger]); // Keep trigger in dependencies

  return { isEOA, isLoading };
};
