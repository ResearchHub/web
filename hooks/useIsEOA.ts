'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';

/**
 * Hook to check if the connected wallet is an Externally Owned Account (EOA)
 * or a Smart Contract Wallet
 *
 * @param trigger - Optional value that will trigger a re-check when changed
 * @returns An object containing:
 *   - isEOA: boolean | null - true if EOA, false if smart wallet, null if unknown
 *   - isLoading: boolean - true while checking
 */
export const useIsEOA = (trigger?: unknown) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [isEOA, setIsEOA] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkEOA = async () => {
      if (!address || !publicClient) {
        setIsEOA(null);
        return;
      }

      setIsLoading(true);
      try {
        const code = await publicClient.getCode({ address });
        // If code is undefined, '0x', or null, it's an EOA
        setIsEOA(!code || code === '0x');
      } catch (error) {
        console.error('Error checking if address is EOA:', error);
        // Default to allowing EOAs in case of error
        setIsEOA(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkEOA();
  }, [address, publicClient, trigger]); // Added trigger to dependencies

  return { isEOA, isLoading };
};
