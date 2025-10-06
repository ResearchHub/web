import { useState, useCallback, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { TransactionService } from '@/services/transaction.service';

type TransactionStatus = {
  state: 'idle' | 'processing' | 'success';
  txHash?: string;
};

interface UseDepositTransactionParams {
  depositAmount: number;
  isOpen: boolean;
  onSuccess?: () => void;
}

interface UseDepositTransactionReturn {
  txStatus: TransactionStatus;
  isInitiating: boolean;
  handleInitiateTransaction: () => void;
  handleOnStatus: (status: any) => void;
  handleOnSuccess: (response: any) => void;
  handleOnError: (error: any) => void;
}

/**
 * Custom hook for handling deposit transactions with OnchainKit
 * Manages transaction status and saves deposits to backend on success
 */
export function useDepositTransaction({
  depositAmount,
  isOpen,
  onSuccess,
}: UseDepositTransactionParams): UseDepositTransactionReturn {
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ state: 'idle' });
  const [isInitiating, setIsInitiating] = useState(false);

  const hasProcessedRef = useRef(false);
  const { address } = useAccount();

  // Reset all state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTxStatus({ state: 'idle' });
      setIsInitiating(false);
      hasProcessedRef.current = false;
    }
  }, [isOpen]);

  // Auto-reset isInitiating once transaction starts processing
  useEffect(() => {
    if (txStatus.state === 'processing' && isInitiating) {
      setIsInitiating(false);
    }
  }, [txStatus.state, isInitiating]);

  /**
   * Handle button click to initiate transaction
   * Sets isInitiating to true for immediate button disable
   */
  const handleInitiateTransaction = useCallback(() => {
    setIsInitiating(true);
  }, []);

  /**
   * Handle OnchainKit transaction status updates
   * Processes transaction states and saves successful deposits to backend
   */
  const handleOnStatus = useCallback(
    (status: any) => {
      const { statusName, statusData } = status;

      // Set to processing when transaction starts
      if (statusName === 'buildingTransaction' || statusName === 'transactionPending') {
        setTxStatus({ state: 'processing' });
        return;
      }

      // Handle success and save deposit
      if (statusName === 'success' && statusData?.transactionReceipts?.[0]?.transactionHash) {
        const txHash = statusData.transactionReceipts[0].transactionHash;
        setTxStatus({ state: 'success', txHash });

        // Save deposit to backend (only once)
        if (!hasProcessedRef.current && address) {
          hasProcessedRef.current = true;

          TransactionService.saveDeposit({
            amount: depositAmount,
            transaction_hash: txHash,
            from_address: address,
            network: 'BASE',
          }).catch((error) =>
            console.error('[useDepositTransaction] Failed to save deposit:', error)
          );

          if (onSuccess) {
            onSuccess();
          }
        }
      }
    },
    [depositAmount, address, onSuccess]
  );

  /**
   * Handle OnchainKit onSuccess callback
   * Alternative success handler that may be more reliable on Android
   */
  const handleOnSuccess = useCallback(
    (response: any) => {
      const txHash = response?.transactionReceipts?.[0]?.transactionHash;

      if (txHash) {
        setTxStatus({ state: 'success', txHash });

        // Save deposit to backend (only once)
        if (!hasProcessedRef.current && address) {
          hasProcessedRef.current = true;

          TransactionService.saveDeposit({
            amount: depositAmount,
            transaction_hash: txHash,
            from_address: address,
            network: 'BASE',
          }).catch((error) =>
            console.error('[useDepositTransaction] Failed to save deposit:', error)
          );

          if (onSuccess) {
            onSuccess();
          }
        }
      }
    },
    [depositAmount, address, onSuccess]
  );

  /**
   * Handle OnchainKit onError callback
   * Helps catch and display transaction errors
   */
  const handleOnError = useCallback((error: any) => {
    console.error('[useDepositTransaction] Transaction error:', error);
    // OnchainKit will handle error UI, we just log it
  }, []);

  return {
    txStatus,
    isInitiating,
    handleInitiateTransaction,
    handleOnStatus,
    handleOnSuccess,
    handleOnError,
  };
}
