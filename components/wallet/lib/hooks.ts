import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Interface } from 'ethers';
import { TransactionService } from '@/services/transaction.service';
import { RSC, TRANSFER_ABI } from '@/constants/tokens';

const HOT_WALLET_ADDRESS_ENV = process.env.NEXT_PUBLIC_WEB3_WALLET_ADDRESS;
if (!HOT_WALLET_ADDRESS_ENV || HOT_WALLET_ADDRESS_ENV.trim() === '') {
  throw new Error('Missing environment variable: NEXT_PUBLIC_WEB3_WALLET_ADDRESS');
}
const HOT_WALLET_ADDRESS = HOT_WALLET_ADDRESS_ENV as `0x${string}`;

type TransactionStatus =
  | { state: 'idle' }
  | { state: 'buildingTransaction' }
  | { state: 'pending'; txHash?: string }
  | { state: 'success'; txHash: string }
  | { state: 'error'; message: string };

type Call = {
  to: `0x${string}`;
  data: `0x${string}`;
};

interface UseDepositTransactionParams {
  depositAmount: number;
  walletBalance: number;
  isOpen: boolean;
  onSuccess?: () => void;
}

interface UseDepositTransactionReturn {
  txStatus: TransactionStatus;
  isButtonDisabled: boolean;
  callsCallback: () => Promise<Call[]>;
  handleOnStatus: (status: any) => void;
  initiateTransaction: () => void;
}

export function useDepositTransaction({
  depositAmount,
  walletBalance,
  isOpen,
  onSuccess,
}: UseDepositTransactionParams): UseDepositTransactionReturn {
  const { address } = useAccount();
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ state: 'idle' });
  const hasCalledSuccessRef = useRef(false);
  const hasProcessedDepositRef = useRef(false);
  const processedTxHashRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTxStatus({ state: 'idle' });
      hasCalledSuccessRef.current = false;
      hasProcessedDepositRef.current = false;
      processedTxHashRef.current = null;
    }
  }, [isOpen]);

  const isButtonDisabled = useMemo(
    () =>
      !address ||
      depositAmount <= 0 ||
      depositAmount > walletBalance ||
      txStatus.state === 'buildingTransaction' ||
      txStatus.state === 'pending',
    [address, depositAmount, walletBalance, txStatus.state]
  );

  const callsCallback = useCallback(async (): Promise<Call[]> => {
    if (!depositAmount || depositAmount <= 0) {
      throw new Error('Invalid deposit amount');
    }
    if (depositAmount > walletBalance) {
      throw new Error('Deposit amount exceeds wallet balance');
    }

    const amountInWei = BigInt(depositAmount) * BigInt(10 ** 18);
    const transferInterface = new Interface(TRANSFER_ABI);
    const encodedData = transferInterface.encodeFunctionData('transfer', [
      HOT_WALLET_ADDRESS,
      amountInWei,
    ]);

    const transferCall: Call = {
      to: RSC.address as `0x${string}`,
      data: encodedData as `0x${string}`,
    };

    return [transferCall];
  }, [depositAmount, walletBalance]);

  const initiateTransaction = useCallback(() => {
    setTxStatus({ state: 'buildingTransaction' });
  }, []);

  const handleOnStatus = useCallback(
    (status: any) => {
      if (status.statusName === 'buildingTransaction') {
        setTxStatus({ state: 'buildingTransaction' });
        return;
      }

      if (status.statusName === 'transactionPending') {
        setTxStatus({ state: 'pending' });
        return;
      }

      if (
        status.statusName === 'transactionLegacyExecuted' &&
        status.statusData?.transactionHashList?.[0]
      ) {
        const txHash = status.statusData.transactionHashList[0];
        setTxStatus({ state: 'pending', txHash });
        return;
      }

      if (
        status.statusName === 'success' &&
        status.statusData?.transactionReceipts?.[0]?.transactionHash
      ) {
        const txHash = status.statusData.transactionReceipts[0].transactionHash;
        setTxStatus({ state: 'success', txHash });

        if (!hasProcessedDepositRef.current && processedTxHashRef.current !== txHash && address) {
          hasProcessedDepositRef.current = true;
          processedTxHashRef.current = txHash;

          TransactionService.saveDeposit({
            amount: depositAmount,
            transaction_hash: txHash,
            from_address: address,
            network: 'BASE',
          }).catch((error) => {
            console.error('Failed to record deposit:', error);
          });
        }

        if (onSuccess && !hasCalledSuccessRef.current) {
          hasCalledSuccessRef.current = true;
          onSuccess();
        }
        return;
      }

      if (status.statusName === 'error') {
        setTxStatus({
          state: 'error',
          message: status.statusData?.message || 'Transaction failed',
        });
      }
    },
    [depositAmount, address, onSuccess]
  );

  return {
    txStatus,
    isButtonDisabled,
    callsCallback,
    handleOnStatus,
    initiateTransaction,
  };
}
