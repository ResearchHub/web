import { useState, useCallback, useRef, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
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
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>(undefined);

  const hasProcessedRef = useRef(false);
  const { address } = useAccount();

  // Independent transaction monitor using Wagmi
  // This continues tracking even if OnchainKit loses the reference
  const { data: receipt, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
    query: {
      enabled: !!pendingTxHash && txStatus.state === 'processing',
    },
  });

  // Reset all state when modal closes
  useEffect(() => {
    if (!isOpen) {
      console.log('[useDepositTransaction] Modal closed, resetting all state');
      setTxStatus({ state: 'idle' });
      setIsInitiating(false);
      setPendingTxHash(undefined);
      hasProcessedRef.current = false;
    } else {
      console.log('[useDepositTransaction] Modal opened, ready for transaction', {
        depositAmount,
        address,
      });
    }
  }, [isOpen, depositAmount, address]);

  // Wagmi backup monitor: Handle transaction receipt when it arrives
  // This fires even if OnchainKit loses track of the transaction
  useEffect(() => {
    if (isReceiptSuccess && receipt && !hasProcessedRef.current) {
      const txHash = receipt.transactionHash;
      console.log('[useDepositTransaction] 🎉 Wagmi backup monitor detected completion!', {
        txHash,
        receipt,
      });

      setTxStatus({ state: 'success', txHash });

      if (address) {
        console.log('[useDepositTransaction] Saving deposit via Wagmi monitor...');
        hasProcessedRef.current = true;

        TransactionService.saveDeposit({
          amount: depositAmount,
          transaction_hash: txHash,
          from_address: address,
          network: 'BASE',
        })
          .then(() => {
            console.log('[useDepositTransaction] Deposit saved successfully via Wagmi monitor');
          })
          .catch((error) => {
            console.error(
              '[useDepositTransaction] Failed to save deposit via Wagmi monitor:',
              error
            );
          });

        if (onSuccess) {
          console.log('[useDepositTransaction] Calling onSuccess callback via Wagmi monitor');
          onSuccess();
        }
      }
    }
  }, [isReceiptSuccess, receipt, address, depositAmount, onSuccess]);

  // Auto-reset isInitiating once transaction starts processing
  useEffect(() => {
    if (txStatus.state === 'processing' && isInitiating) {
      console.log('[useDepositTransaction] Transaction started processing, resetting isInitiating');
      setIsInitiating(false);
    }
  }, [txStatus.state, isInitiating]);

  // Log when Wagmi backup monitor starts tracking
  useEffect(() => {
    if (pendingTxHash) {
      console.log(
        '[useDepositTransaction] 🔍 Wagmi backup monitor now tracking transaction:',
        pendingTxHash
      );
    }
  }, [pendingTxHash]);

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

      // Deep inspection of the entire status object
      console.log(
        '[useDepositTransaction] 🔍 FULL STATUS OBJECT:',
        JSON.stringify(status, null, 2)
      );

      // Comprehensive hash capture: check ALL possible locations in status object
      const possibleHash =
        statusData?.transactionHash ||
        statusData?.transactionReceipts?.[0]?.transactionHash ||
        statusData?.receipt?.transactionHash ||
        statusData?.hash ||
        statusData?.txHash ||
        status?.transactionHash ||
        status?.hash ||
        status?.txHash ||
        status?.receipt?.transactionHash ||
        status?.transaction?.hash ||
        status?.data?.transactionHash ||
        status?.data?.hash;

      if (possibleHash && !pendingTxHash) {
        console.log(
          '[useDepositTransaction] 🔗 Captured transaction hash for monitoring:',
          possibleHash
        );
        setPendingTxHash(possibleHash as `0x${string}`);
      } else if (statusName !== 'init' && !possibleHash) {
        console.warn('[useDepositTransaction] ⚠️ No transaction hash found in statusData:', {
          statusDataKeys: statusData ? Object.keys(statusData) : [],
          statusData,
        });
      }

      // Set to processing when transaction starts
      if (statusName === 'buildingTransaction' || statusName === 'transactionPending') {
        console.log('[useDepositTransaction] Setting status to processing');
        console.log('[useDepositTransaction] 📤 Transaction being built/sent');
        console.log('[useDepositTransaction] 🔎 Searching for hash at this stage...');
        console.log('[useDepositTransaction] - statusData:', statusData);
        console.log('[useDepositTransaction] - status object keys:', Object.keys(status));

        // Try to extract hash from any nested property
        const allKeys = Object.keys(status);
        for (const key of allKeys) {
          if (status[key] && typeof status[key] === 'object') {
            console.log(`[useDepositTransaction] - status.${key}:`, status[key]);
          }
        }

        setTxStatus({ state: 'processing' });
        return;
      }

      // Log all other status names to understand the flow
      if (statusName !== 'init' && statusName !== 'success') {
        console.log(
          '[useDepositTransaction] 📊 Received status:',
          statusName,
          'with data:',
          statusData
        );
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
    [depositAmount, address, onSuccess, pendingTxHash]
  );

  /**
   * Handle OnchainKit onSuccess callback
   * Alternative success handler that may be more reliable on Android
   */
  const handleOnSuccess = useCallback(
    (response: any) => {
      console.log('[useDepositTransaction] 🎉 onSuccess fired!', {
        timestamp: new Date().toISOString(),
      });

      // Deep inspection of the entire response object
      console.log(
        '[useDepositTransaction] 🔍 FULL SUCCESS RESPONSE:',
        JSON.stringify(response, null, 2)
      );

      const txHash = response?.transactionReceipts?.[0]?.transactionHash;

      if (txHash) {
        console.log('[useDepositTransaction] ✅ Transaction hash from onSuccess:', txHash);

        // Capture for Wagmi monitor if we don't have it yet
        if (!pendingTxHash) {
          console.log(
            '[useDepositTransaction] 🔗 Captured transaction hash from onSuccess for monitoring'
          );
          setPendingTxHash(txHash as `0x${string}`);
        }

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
    [depositAmount, address, onSuccess, pendingTxHash]
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
