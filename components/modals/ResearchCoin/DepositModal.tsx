'use client';

import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { X as XIcon, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAccount, usePublicClient } from 'wagmi';
import { Interface } from 'ethers';
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useWalletRSCBalance } from '@/hooks/useWalletRSCBalance';
import { useIsMobile } from '@/hooks/useIsMobile';
import { TransactionService } from '@/services/transaction.service';
import { RSC, TRANSFER_ABI } from '@/constants/tokens';

// Constants
const HOT_WALLET_ADDRESS_ENV = process.env.NEXT_PUBLIC_WEB3_WALLET_ADDRESS;
if (!HOT_WALLET_ADDRESS_ENV?.trim()) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_WEB3_WALLET_ADDRESS');
}
const HOT_WALLET_ADDRESS = HOT_WALLET_ADDRESS_ENV as `0x${string}`;

const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const NETWORK_NAME = IS_PRODUCTION ? 'Base' : 'Base Sepolia';
const NETWORK_DESCRIPTION = IS_PRODUCTION
  ? 'Deposits are processed on Base L2'
  : 'Deposits are processed on Base Sepolia testnet';

const BLOCKS_TO_CHECK = 10; // ~20 seconds of history on Base
const MAX_POLLING_RETRIES = 5;
const POLLING_INTERVAL = 3000; // 3 seconds

// Types
type Call = {
  to: `0x${string}`;
  data?: `0x${string}`;
  value?: bigint;
};

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onSuccess?: () => void;
}

type TransactionStatus =
  | { state: 'idle' }
  | { state: 'buildingTransaction' }
  | { state: 'pending'; txHash?: string }
  | { state: 'success'; txHash: string }
  | { state: 'error'; message: string };

// Helper Functions
const closeWalletPopups = () => {
  const elements = document.querySelectorAll('div, aside, section');

  elements.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;

    const styles = window.getComputedStyle(el);
    const isPositioned = styles.position === 'fixed' || styles.position === 'absolute';
    const isVisible = styles.display !== 'none' && styles.visibility !== 'hidden';
    const hasHighZIndex = parseInt(styles.zIndex || '0') > 40;

    if (isPositioned && isVisible && hasHighZIndex) {
      const text = el.textContent || '';
      const isDepositModal = text.includes('Deposit RSC');
      const isWalletPopup =
        text.includes('Redirecting to Coinbase Wallet') || text.includes('Open in Wallet');

      if (isWalletPopup && !isDepositModal) {
        el.style.display = 'none';

        // Hide positioned parent containers
        let parent = el.parentElement;
        let depth = 0;
        while (parent && parent !== document.body && depth < 3) {
          const parentStyles = window.getComputedStyle(parent);
          if (parentStyles.position === 'fixed' || parentStyles.position === 'absolute') {
            parent.style.display = 'none';
            break;
          }
          parent = parent.parentElement;
          depth++;
        }
      }
    }
  });
};

export function DepositModal({ isOpen, onClose, currentBalance, onSuccess }: DepositModalProps) {
  // State
  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ state: 'idle' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs for tracking
  const hasCalledSuccessRef = useRef(false);
  const hasProcessedDepositRef = useRef(false);
  const processedTxHashRef = useRef<string | null>(null);

  // Hooks
  const { address } = useAccount();
  const { balance: walletBalance } = useWalletRSCBalance();
  const publicClient = usePublicClient();
  const isMobile = useIsMobile();

  // Derived values
  const depositAmount = useMemo(() => parseInt(amount || '0', 10), [amount]);
  const newBalance = useMemo(() => currentBalance + depositAmount, [currentBalance, depositAmount]);

  const isButtonDisabled = useMemo(
    () =>
      !address ||
      !amount ||
      depositAmount <= 0 ||
      depositAmount > walletBalance ||
      (isMobile && isProcessing),
    [address, amount, depositAmount, walletBalance, isMobile, isProcessing]
  );

  const isInputDisabled = useMemo(
    () =>
      !address ||
      txStatus.state === 'buildingTransaction' ||
      txStatus.state === 'pending' ||
      txStatus.state === 'success',
    [address, txStatus.state]
  );

  // Process deposit helper
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

        setIsProcessing(false);
        setTxStatus({ state: 'success', txHash });

        // Force re-render to ensure UI updates
        setTimeout(() => setTxStatus({ state: 'success', txHash }), 0);

        if (onSuccess && !hasCalledSuccessRef.current) {
          hasCalledSuccessRef.current = true;
          onSuccess();
        }
      } catch (error) {
        console.error('[DepositModal] Failed to process deposit:', error);
        setIsProcessing(false);
        setTxStatus({
          state: 'error',
          message: 'Failed to record deposit. Please contact support.',
        });
      }
    },
    [depositAmount, address, onSuccess]
  );

  // Check blockchain for recent transactions
  const checkForRecentTransaction = useCallback(async (): Promise<string | 'pending' | null> => {
    if (!publicClient || !address) return null;

    try {
      const currentBlock = await publicClient.getBlockNumber();
      const txCount = await publicClient.getTransactionCount({ address, blockTag: 'latest' });
      const pendingTxCount = await publicClient.getTransactionCount({
        address,
        blockTag: 'pending',
      });

      if (pendingTxCount > txCount) {
        return 'pending';
      }

      // Check last N blocks for RSC token transfers from this address
      for (let i = 0; i < BLOCKS_TO_CHECK; i++) {
        try {
          const block = await publicClient.getBlock({
            blockNumber: currentBlock - BigInt(i),
            includeTransactions: true,
          });

          if (block.transactions && Array.isArray(block.transactions)) {
            for (const tx of block.transactions) {
              if (
                typeof tx === 'object' &&
                tx.from?.toLowerCase() === address.toLowerCase() &&
                tx.to?.toLowerCase() === RSC.address.toLowerCase()
              ) {
                return tx.hash;
              }
            }
          }
        } catch (blockError) {
          console.error('[DepositModal] Error checking block:', blockError);
        }
      }

      return null;
    } catch (error) {
      console.error('[DepositModal] Error checking blockchain:', error);
      return null;
    }
  }, [publicClient, address]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTxStatus({ state: 'idle' });
      setAmount('');
      setIsProcessing(false);
      hasCalledSuccessRef.current = false;
      hasProcessedDepositRef.current = false;
      processedTxHashRef.current = null;
    }
  }, [isOpen]);

  // Mobile: Handle return from Coinbase Wallet app
  useEffect(() => {
    if (!isMobile || !isOpen || txStatus.state !== 'pending') {
      return;
    }

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return;

      // Close OnchainKit wallet popups
      closeWalletPopups();

      // Process existing transaction hash
      if (txStatus.txHash && !hasProcessedDepositRef.current) {
        await processDeposit(txStatus.txHash);
        return;
      }

      // Poll blockchain for transaction hash
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
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [isMobile, isOpen, txStatus, checkForRecentTransaction, processDeposit]);

  // Handlers
  const handleClose = useCallback(() => {
    setTxStatus({ state: 'idle' });
    setAmount('');
    onClose();
  }, [onClose]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
    }
  }, []);

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
        const txHash = statusData.transactionHashList[0];
        setTxStatus({ state: 'pending', txHash });

        // Mobile: Process immediately when hash is available
        if (isMobile && !hasProcessedDepositRef.current) {
          processDeposit(txHash);
        }
        return;
      }

      if (statusName === 'success' && statusData?.transactionReceipts?.[0]?.transactionHash) {
        const txHash = statusData.transactionReceipts[0].transactionHash;
        setTxStatus({ state: 'success', txHash });

        // Desktop: Process on success (mobile already processed in transactionLegacyExecuted)
        if (!isMobile && !hasProcessedDepositRef.current && processedTxHashRef.current !== txHash) {
          hasProcessedDepositRef.current = true;
          processedTxHashRef.current = txHash;

          TransactionService.saveDeposit({
            amount: depositAmount,
            transaction_hash: txHash,
            from_address: address!,
            network: 'BASE',
          }).catch((error) => console.error('[DepositModal] Failed to record deposit:', error));
        }

        if (onSuccess && !hasCalledSuccessRef.current) {
          hasCalledSuccessRef.current = true;
          onSuccess();
        }
        return;
      }

      if (statusName === 'error') {
        setTxStatus({
          state: 'error',
          message: statusData?.message || 'Transaction failed',
        });
      }
    },
    [depositAmount, address, onSuccess, isMobile, processDeposit]
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
      amountInWei.toString(),
    ]);

    return [
      {
        to: RSC.address as `0x${string}`,
        data: encodedData as `0x${string}`,
      },
    ];
  }, [depositAmount, walletBalance]);

  if (!address) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-8">
                  <DialogTitle className="text-2xl font-semibold text-gray-900">
                    Deposit RSC
                  </DialogTitle>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors rounded-full p-1 hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Network Info */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-md">
                    <div className="flex items-center gap-3">
                      <img
                        src="/base-logo.svg"
                        alt={`${NETWORK_NAME} Network`}
                        className="h-6 w-6"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{NETWORK_NAME}</span>
                        <span className="text-xs text-gray-500">{NETWORK_DESCRIPTION}</span>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Balance */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Wallet Balance:</span>
                      <div className="flex items-center gap-2">
                        <ResearchCoinIcon size={16} />
                        <span className="text-sm font-semibold text-gray-900">
                          {walletBalance.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">RSC</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[15px] text-gray-700">Amount to Deposit</span>
                      <button
                        onClick={() => setAmount(Math.floor(walletBalance).toString())}
                        className="text-sm text-primary-500 font-medium hover:text-primary-600 disabled:opacity-50 disabled:text-gray-400 disabled:hover:text-gray-400"
                        disabled={isInputDisabled}
                      >
                        MAX
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0"
                        disabled={isInputDisabled}
                        aria-label="Amount to deposit"
                        className={`w-full h-12 px-4 rounded-lg border border-gray-300 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition duration-200 ${isInputDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <span className="text-gray-500">RSC</span>
                      </div>
                    </div>
                    {depositAmount > walletBalance && (
                      <p className="text-sm text-red-600" role="alert">
                        Deposit amount exceeds your wallet balance.
                      </p>
                    )}
                  </div>

                  {/* Balance Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Balance:</span>
                      <div className="flex items-center gap-2">
                        <ResearchCoinIcon size={16} />
                        <span className="text-sm font-semibold text-gray-900">
                          {formatRSC({ amount: currentBalance })}
                        </span>
                        <span className="text-sm text-gray-500">RSC</span>
                      </div>
                    </div>

                    <div className="my-2 border-t border-gray-200" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">After Deposit:</span>
                      <div className="flex items-center gap-2">
                        <ResearchCoinIcon size={16} />
                        <span
                          className={`text-sm font-semibold ${depositAmount > 0 && depositAmount <= walletBalance ? 'text-green-600' : 'text-gray-900'}`}
                        >
                          {depositAmount > 0 && depositAmount <= walletBalance
                            ? formatRSC({ amount: newBalance })
                            : formatRSC({ amount: currentBalance })}
                        </span>
                        <span className="text-sm text-gray-500">RSC</span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Button */}
                  {txStatus.state !== 'success' && txStatus.state !== 'error' && (
                    <Transaction
                      isSponsored={true}
                      chainId={RSC.chainId}
                      calls={callsCallback}
                      onStatus={handleOnStatus}
                    >
                      {isMobile && isProcessing ? (
                        <button
                          disabled
                          className="w-full h-12 bg-primary-400 text-white rounded-lg font-medium transition-colors opacity-75 cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                        >
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Processing...</span>
                        </button>
                      ) : (
                        <div
                          onClick={() => isMobile && !isProcessing && setIsProcessing(true)}
                          onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === ' ') && isMobile && !isProcessing) {
                              e.preventDefault();
                              setIsProcessing(true);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <TransactionButton
                            className="w-full h-12 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            disabled={isButtonDisabled || txStatus.state === 'pending'}
                            text="Deposit RSC"
                          />
                        </div>
                      )}
                    </Transaction>
                  )}

                  {/* Status Display */}
                  {(txStatus.state === 'success' || txStatus.state === 'error') && (
                    <div className="mt-4 p-4 rounded-lg border">
                      {txStatus.state === 'success' && (
                        <div className="space-y-2">
                          <div className="flex items-center text-green-600">
                            <Check className="mr-2 h-5 w-5" />
                            <span className="font-medium">Deposit successful!</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            It can take up to 10-20 minutes for the deposit to appear in your
                            account.
                          </p>
                        </div>
                      )}

                      {txStatus.state === 'error' && (
                        <div className="space-y-2">
                          <div className="flex items-center text-red-600">
                            <AlertCircle className="mr-2 h-5 w-5" />
                            <span className="font-medium">Deposit failed</span>
                          </div>
                          <p className="text-sm text-gray-600">{txStatus.message}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
