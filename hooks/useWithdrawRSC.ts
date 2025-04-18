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
    console.log('[useWithdrawRSC] Starting withdrawal with data:', withdrawalData);
    try {
      setTxStatus({ state: 'pending' });
      console.log('[useWithdrawRSC] Set state to pending');

      const response = await WithdrawalService.withdrawRSC(withdrawalData);
      console.log('[useWithdrawRSC] Received successful response:', response);

      setTxStatus({
        state: 'success',
        txHash: response.transaction_hash,
      });
      console.log('[useWithdrawRSC] Set state to success with hash:', response.transaction_hash);

      return response;
    } catch (error) {
      console.error('[useWithdrawRSC] Withdrawal failed, caught error:', error);

      // Extract error message - our service now properly handles this
      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        console.log('[useWithdrawRSC] Error is Error instance with message:', error.message);
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        console.log('[useWithdrawRSC] Error is string:', error);
        errorMessage = error;
      } else {
        console.log('[useWithdrawRSC] Error is unknown type:', typeof error);
      }

      console.log('[useWithdrawRSC] Final error message to display:', errorMessage);
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
