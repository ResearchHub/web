import { useState, useCallback, useRef, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { TransactionService } from '@/services/transaction.service';
import { RSC } from '@/constants/tokens';
import { closeWalletPopups } from '@/components/wallet/lib/utils';
import type { Address } from 'viem';

const BLOCKS_TO_CHECK = 10;
const MAX_POLLING_RETRIES = 5;
const POLLING_INTERVAL = 3000;

type TransactionStatus =
  | { state: 'idle' }
  | { state: 'buildingTransaction' }
  | { state: 'pending'; txHash?: string }
  | { state: 'success'; txHash: string }
  | { state: 'error'; message: string };

interface UseDepositTransactionParams {
  depositAmount: number;
  isMobile: boolean;
  isOpen: boolean;
  onSuccess?: () => void;
}

interface UseDepositTransactionReturn {
  txStatus: TransactionStatus;
  setTxStatus: React.Dispatch<React.SetStateAction<TransactionStatus>>;
  handleTransactionExecuted: (txHash: string) => void;
  handleTransactionSuccess: (txHash: string) => void;
  handleOnStatus: (status: any) => void;
}

/**
 * Custom hook for handling deposit transactions with mobile-specific recovery logic
 * Manages transaction status, blockchain polling, and deposit processing
 */
export function useDepositTransaction({
  depositAmount,
  isMobile,
  isOpen,
  onSuccess,
}: UseDepositTransactionParams): UseDepositTransactionReturn {
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ state: 'idle' });

  const hasCalledSuccessRef = useRef(false);
  const hasProcessedDepositRef = useRef(false);
  const processedTxHashRef = useRef<string | null>(null);

  const { address } = useAccount();
  const publicClient = usePublicClient();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTxStatus({ state: 'idle' });
      hasCalledSuccessRef.current = false;
      hasProcessedDepositRef.current = false;
      processedTxHashRef.current = null;
    }
  }, [isOpen]);

  /**
   * Process deposit by saving to backend and updating status
   */
  const processDeposit = useCallback(
    async (txHash: string) => {
      if (hasProcessedDepositRef.current || processedTxHashRef.current === txHash) {
        return;
      }

      hasProcessedDepositRef.current = true;
      processedTxHashRef.current = txHash;

      try {
        await TransactionService.saveDeposit({
          amount: depositAmount,
          transaction_hash: txHash,
          from_address: address!,
          network: 'BASE',
        });

        setTxStatus({ state: 'success', txHash });

        setTimeout(() => setTxStatus({ state: 'success', txHash }), 0);

        if (onSuccess && !hasCalledSuccessRef.current) {
          hasCalledSuccessRef.current = true;
          onSuccess();
        }
      } catch (error) {
        console.error('[useDepositTransaction] Failed to process deposit:', error);
        setTxStatus({
          state: 'error',
          message: 'Failed to record deposit. Please contact support.',
        });
      }
    },
    [depositAmount, address, onSuccess]
  );

  /**
   * Check if user has pending transactions in mempool
   */
  const hasPendingTransactions = useCallback(async (): Promise<boolean> => {
    if (!publicClient || !address) return false;

    const txCount = await publicClient.getTransactionCount({ address, blockTag: 'latest' });
    const pendingTxCount = await publicClient.getTransactionCount({
      address,
      blockTag: 'pending',
    });

    return pendingTxCount > txCount;
  }, [publicClient, address]);

  /**
   * Validate if a transaction is an RSC deposit from the current user
   */
  const isRSCDepositTransaction = useCallback(
    (tx: unknown): boolean => {
      if (typeof tx !== 'object' || !tx) return false;

      const transaction = tx as { from?: string; to?: string; hash?: string };
      const isFromUser = transaction.from?.toLowerCase() === address?.toLowerCase();
      const isToRSCContract = transaction.to?.toLowerCase() === RSC.address.toLowerCase();

      return isFromUser && isToRSCContract;
    },
    [address]
  );

  /**
   * Search a specific block for user's RSC deposit transaction
   */
  const searchBlockForTransaction = useCallback(
    async (blockNumber: bigint): Promise<string | null> => {
      try {
        const block = await publicClient?.getBlock({
          blockNumber,
          includeTransactions: true,
        });

        if (!block?.transactions || !Array.isArray(block.transactions)) {
          return null;
        }

        for (const tx of block.transactions) {
          if (isRSCDepositTransaction(tx)) {
            return (tx as { hash: string }).hash;
          }
        }

        return null;
      } catch (blockError) {
        console.error('[useDepositTransaction] Error checking block:', blockError);
        return null;
      }
    },
    [publicClient, isRSCDepositTransaction]
  );

  /**
   * Check recent blocks for user's transaction
   * Returns transaction hash if found, 'pending' if in mempool, or null
   */
  const checkForRecentTransaction = useCallback(async (): Promise<string | null> => {
    if (!publicClient || !address) return null;

    try {
      if (await hasPendingTransactions()) {
        return 'pending' as const;
      }

      const currentBlock = await publicClient.getBlockNumber();

      for (let i = 0; i < BLOCKS_TO_CHECK; i++) {
        const txHash = await searchBlockForTransaction(currentBlock - BigInt(i));
        if (txHash) return txHash;
      }

      return null;
    } catch (error) {
      console.error('[useDepositTransaction] Error checking blockchain:', error);
      return null;
    }
  }, [publicClient, address, hasPendingTransactions, searchBlockForTransaction]);

  /**
   * Handle transaction executed event (mobile flow)
   */
  const handleTransactionExecuted = useCallback(
    (txHash: string) => {
      setTxStatus({ state: 'pending', txHash });

      if (isMobile && !hasProcessedDepositRef.current) {
        processDeposit(txHash);
      }
    },
    [isMobile, processDeposit]
  );

  /**
   * Handle transaction success event (desktop flow)
   */
  const handleTransactionSuccess = useCallback(
    (txHash: string) => {
      setTxStatus({ state: 'success', txHash });

      if (!isMobile && !hasProcessedDepositRef.current && processedTxHashRef.current !== txHash) {
        hasProcessedDepositRef.current = true;
        processedTxHashRef.current = txHash;

        TransactionService.saveDeposit({
          amount: depositAmount,
          transaction_hash: txHash,
          from_address: address!,
          network: 'BASE',
        }).catch((error) =>
          console.error('[useDepositTransaction] Failed to record deposit:', error)
        );
      }

      if (onSuccess && !hasCalledSuccessRef.current) {
        hasCalledSuccessRef.current = true;
        onSuccess();
      }
    },
    [isMobile, depositAmount, address, onSuccess]
  );

  /**
   * Handle OnchainKit transaction status updates
   */
  const handleOnStatus = useCallback(
    (status: any) => {
      const { statusName, statusData } = status;

      if (statusName === 'buildingTransaction') {
        setTxStatus({ state: 'buildingTransaction' });
        return;
      }

      if (statusName === 'transactionPending') {
        setTxStatus({ state: 'pending' });
        return;
      }

      if (statusName === 'transactionLegacyExecuted' && statusData?.transactionHashList?.[0]) {
        handleTransactionExecuted(statusData.transactionHashList[0]);
        return;
      }

      if (statusName === 'success' && statusData?.transactionReceipts?.[0]?.transactionHash) {
        handleTransactionSuccess(statusData.transactionReceipts[0].transactionHash);
        return;
      }

      if (statusName === 'error') {
        setTxStatus({
          state: 'error',
          message: statusData?.message || 'Transaction failed',
        });
      }
    },
    [handleTransactionExecuted, handleTransactionSuccess]
  );

  /**
   * Mobile-specific: Handle visibility changes when returning from wallet
   */
  useEffect(() => {
    if (!isMobile || !isOpen || txStatus.state !== 'pending') {
      return;
    }

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return;

      closeWalletPopups();

      if (txStatus.txHash && !hasProcessedDepositRef.current) {
        await processDeposit(txStatus.txHash);
        return;
      }

      if (!txStatus.txHash && !hasProcessedDepositRef.current) {
        let retryCount = 0;

        const pollTransaction = async () => {
          if (retryCount++ >= MAX_POLLING_RETRIES) return;

          const result = await checkForRecentTransaction();

          if (result && result !== 'pending') {
            setTxStatus({ state: 'pending', txHash: result });
            await processDeposit(result);
          } else {
            setTimeout(pollTransaction, POLLING_INTERVAL);
          }
        };

        pollTransaction();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    globalThis.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      globalThis.removeEventListener('focus', handleVisibilityChange);
    };
  }, [isMobile, isOpen, txStatus, checkForRecentTransaction, processDeposit]);

  return {
    txStatus,
    setTxStatus,
    handleTransactionExecuted,
    handleTransactionSuccess,
    handleOnStatus,
  };
}
