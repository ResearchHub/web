'use client';

import { useState } from 'react';
import {
  WithdrawalService,
  WithdrawalRequest,
  WithdrawalResponse,
} from '@/services/withdrawal.service';

// Define transaction status type
export type TransactionStatus =
  | { state: 'idle' }
  | { state: 'pending' }
  | { state: 'success'; txHash: string }
  | { state: 'error'; message: string };

interface UseWithdrawRSCState {
  txStatus: TransactionStatus;
  isLoading: boolean;
}

type WithdrawRSCFn = (withdrawalData: WithdrawalRequest) => Promise<WithdrawalResponse | null>;
type UseWithdrawRSCReturn = [UseWithdrawRSCState, WithdrawRSCFn];

/**
 * Hook for withdrawing RSC to a wallet address.
 * Manages transaction state and handles API interaction.
 *
 * @returns A tuple containing withdrawal state and function
 */
export function useWithdrawRSC(): UseWithdrawRSCReturn {
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ state: 'idle' });

  const withdrawRSC = async (
    withdrawalData: WithdrawalRequest
  ): Promise<WithdrawalResponse | null> => {
    try {
      setTxStatus({ state: 'pending' });

      const response = await WithdrawalService.withdrawRSC(withdrawalData);

      setTxStatus({
        state: 'success',
        txHash: response.transaction_hash,
      });

      return response;
    } catch (error) {
      console.error('Withdrawal failed:', error);

      // Extract error message - our service now properly handles this
      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      setTxStatus({
        state: 'error',
        message: errorMessage,
      });

      return null;
    }
  };

  return [
    {
      txStatus,
      isLoading: txStatus.state === 'pending',
    },
    withdrawRSC,
  ];
}
