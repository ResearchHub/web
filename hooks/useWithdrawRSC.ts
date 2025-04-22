'use client';

import { useState, useEffect } from 'react';
import {
  TransactionService,
  WithdrawalRequest,
  WithdrawalResponse,
} from '@/services/transaction.service';

// Define transaction status type
export type TransactionStatus =
  | { state: 'idle' }
  | { state: 'pending' }
  | { state: 'success'; txHash: string }
  | { state: 'error'; message: string };

interface UseWithdrawRSCState {
  txStatus: TransactionStatus;
  isLoading: boolean;
  fee: number | null;
  isFeeLoading: boolean;
  feeError: string | null;
}

type WithdrawRSCFn = (
  withdrawalData: Omit<WithdrawalRequest, 'transaction_fee'>
) => Promise<WithdrawalResponse | null>;
type UseWithdrawRSCReturn = [UseWithdrawRSCState, WithdrawRSCFn];

/**
 * Hook for withdrawing RSC to a wallet address.
 * Manages transaction state and handles API interaction.
 *
 * @returns A tuple containing withdrawal state and function
 */
export function useWithdrawRSC(): UseWithdrawRSCReturn {
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ state: 'idle' });
  const [fee, setFee] = useState<number | null>(null);
  const [isFeeLoading, setIsFeeLoading] = useState<boolean>(true);
  const [feeError, setFeeError] = useState<string | null>(null);

  // Fetch the transaction fee when the hook is initialized
  useEffect(() => {
    const fetchTransactionFee = async () => {
      try {
        setIsFeeLoading(true);
        setFeeError(null);
        const feeAmount = await TransactionService.getWithdrawalFee();
        setFee(feeAmount);
      } catch (error) {
        let errorMessage = 'Failed to fetch transaction fee';

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        setFeeError(errorMessage);
      } finally {
        setIsFeeLoading(false);
      }
    };

    fetchTransactionFee();
  }, []);

  const withdrawRSC = async (
    withdrawalData: Omit<WithdrawalRequest, 'transaction_fee'>
  ): Promise<WithdrawalResponse | null> => {
    if (!fee) {
      setTxStatus({
        state: 'error',
        message: 'Transaction fee not available. Please try again.',
      });
      return null;
    }

    try {
      setTxStatus({ state: 'pending' });

      const response = await TransactionService.withdrawRSC({
        ...withdrawalData,
        transaction_fee: fee.toString(),
      });

      setTxStatus({
        state: 'success',
        txHash: response.transaction_hash,
      });

      return response;
    } catch (error) {
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
      fee,
      isFeeLoading,
      feeError,
    },
    withdrawRSC,
  ];
}
