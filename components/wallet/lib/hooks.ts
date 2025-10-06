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
      console.log('[useDepositTransaction] Modal closed, resetting all state');
      setTxStatus({ state: 'idle' });
      setIsInitiating(false);
      hasProcessedRef.current = false;
    } else {
      console.log('[useDepositTransaction] Modal opened, ready for transaction', {
        depositAmount,
        address,
      });
    }
  }, [isOpen, depositAmount, address]);

  // Auto-reset isInitiating once transaction starts processing
  useEffect(() => {
    if (txStatus.state === 'processing' && isInitiating) {
      console.log('[useDepositTransaction] Transaction started processing, resetting isInitiating');
      setIsInitiating(false);
    }
  }, [txStatus.state, isInitiating]);

  /**
   * Handle button click to initiate transaction
   * Sets isInitiating to true for immediate button disable
   */
  const handleInitiateTransaction = useCallback(() => {
    console.log('[useDepositTransaction] Transaction initiated by user');
    setIsInitiating(true);
  }, []);

  /**
   * Handle OnchainKit transaction status updates
   * Processes transaction states and saves successful deposits to backend
   */
  const handleOnStatus = useCallback(
    (status: any) => {
      const { statusName, statusData } = status;

      console.log('[useDepositTransaction] ⚡ onStatus fired!', {
        statusName,
        statusData,
        timestamp: new Date().toISOString(),
      });

      // Set to processing when transaction starts
      if (statusName === 'buildingTransaction' || statusName === 'transactionPending') {
        console.log('[useDepositTransaction] Setting status to processing');
        setTxStatus({ state: 'processing' });
        return;
      }

      // Handle success and save deposit
      if (statusName === 'success' && statusData?.transactionReceipts?.[0]?.transactionHash) {
        const txHash = statusData.transactionReceipts[0].transactionHash;
        console.log('[useDepositTransaction] ✅ Transaction successful via onStatus:', txHash);
        setTxStatus({ state: 'success', txHash });

        // Save deposit to backend (only once)
        if (!hasProcessedRef.current && address) {
          console.log('[useDepositTransaction] Saving deposit to backend...');
          hasProcessedRef.current = true;

          TransactionService.saveDeposit({
            amount: depositAmount,
            transaction_hash: txHash,
            from_address: address,
            network: 'BASE',
          })
            .then(() => {
              console.log('[useDepositTransaction] Deposit saved successfully to backend');
            })
            .catch((error) => {
              console.error('[useDepositTransaction] Failed to save deposit:', error);
            });

          if (onSuccess) {
            console.log('[useDepositTransaction] Calling onSuccess callback');
            onSuccess();
          }
        } else {
          console.warn('[useDepositTransaction] Skipping deposit save', {
            hasProcessed: hasProcessedRef.current,
            hasAddress: !!address,
          });
        }
      } else if (statusName === 'success') {
        console.warn('[useDepositTransaction] Success status but no transaction hash found', {
          statusData,
        });
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
      console.log('[useDepositTransaction] 🎉 onSuccess fired!', {
        response,
        timestamp: new Date().toISOString(),
      });

      const txHash = response?.transactionReceipts?.[0]?.transactionHash;

      if (txHash) {
        console.log('[useDepositTransaction] ✅ Transaction hash from onSuccess:', txHash);
        setTxStatus({ state: 'success', txHash });

        // Save deposit to backend (only once)
        if (!hasProcessedRef.current && address) {
          console.log('[useDepositTransaction] Saving deposit to backend via onSuccess...');
          hasProcessedRef.current = true;

          TransactionService.saveDeposit({
            amount: depositAmount,
            transaction_hash: txHash,
            from_address: address,
            network: 'BASE',
          })
            .then(() => {
              console.log('[useDepositTransaction] Deposit saved successfully via onSuccess');
            })
            .catch((error) => {
              console.error('[useDepositTransaction] Failed to save deposit via onSuccess:', error);
            });

          if (onSuccess) {
            console.log('[useDepositTransaction] Calling onSuccess callback via onSuccess handler');
            onSuccess();
          }
        } else {
          console.warn('[useDepositTransaction] Skipping deposit save via onSuccess', {
            hasProcessed: hasProcessedRef.current,
            hasAddress: !!address,
          });
        }
      } else {
        console.warn('[useDepositTransaction] onSuccess called but no transaction hash found', {
          response,
        });
      }
    },
    [depositAmount, address, onSuccess]
  );

  /**
   * Handle OnchainKit onError callback
   * Helps catch and display transaction errors
   */
  const handleOnError = useCallback((error: any) => {
    console.error('[useDepositTransaction] ❌ onError fired!', {
      error,
      errorMessage: error?.message,
      errorCode: error?.code,
      timestamp: new Date().toISOString(),
    });
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
