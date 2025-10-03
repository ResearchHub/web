'use client';

import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { X as XIcon, Check, AlertCircle } from 'lucide-react';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useAccount } from 'wagmi';
import { useWalletRSCBalance } from '@/hooks/useWalletRSCBalance';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { Interface } from 'ethers';
import { TransactionService } from '@/services/transaction.service';
import { RSC, TRANSFER_ABI } from '@/constants/tokens';

const HOT_WALLET_ADDRESS_ENV = process.env.NEXT_PUBLIC_WEB3_WALLET_ADDRESS;
if (!HOT_WALLET_ADDRESS_ENV || HOT_WALLET_ADDRESS_ENV.trim() === '') {
  throw new Error('Missing environment variable: NEXT_PUBLIC_WEB3_WALLET_ADDRESS');
}
const HOT_WALLET_ADDRESS = HOT_WALLET_ADDRESS_ENV as `0x${string}`;

// Network configuration based on environment
const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const NETWORK_NAME = IS_PRODUCTION ? 'Base' : 'Base Sepolia';
const NETWORK_DESCRIPTION = IS_PRODUCTION
  ? 'Deposits are processed on Base L2'
  : 'Deposits are processed on Base Sepolia testnet';

// Define types for blockchain transaction call
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

// Define transaction status type to include all relevant states
type TransactionStatus =
  | { state: 'idle' }
  | { state: 'buildingTransaction' }
  | { state: 'pending'; txHash?: string }
  | { state: 'success'; txHash: string }
  | { state: 'error'; message: string };

export function DepositModal({ isOpen, onClose, currentBalance, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = useState<string>('');
  const { address } = useAccount();
  const { balance: walletBalance } = useWalletRSCBalance();
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ state: 'idle' });
  const hasCalledSuccessRef = useRef(false);
  const hasProcessedDepositRef = useRef(false);
  const processedTxHashRef = useRef<string | null>(null);
  const isMobile = useIsMobile();
  const [isMobileProcessing, setIsMobileProcessing] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  // Reset transaction status when modal is closed
  useEffect(() => {
    setTxStatus({ state: 'idle' });
    setAmount('');
    hasCalledSuccessRef.current = false;
    hasProcessedDepositRef.current = false;
    processedTxHashRef.current = null;
    setIsMobileProcessing(false);
    setIsButtonClicked(false);
  }, [isOpen]);

  // Mobile return detection - simple approach
  useEffect(() => {
    if (!isMobile || !isOpen || txStatus.state !== 'pending') return;

    const processMobileDeposit = async () => {
      if (!processedTxHashRef.current || hasProcessedDepositRef.current) return;

      hasProcessedDepositRef.current = true;

      console.log('Mobile: Processing deposit after return detection', {
        txHash: processedTxHashRef.current,
        amount: parseInt(amount || '0', 10),
      });

      try {
        await TransactionService.saveDeposit({
          amount: parseInt(amount || '0', 10),
          transaction_hash: processedTxHashRef.current,
          from_address: address!,
          network: 'BASE',
        });

        console.log('Mobile: Deposit processed successfully');
        setTxStatus({ state: 'success', txHash: processedTxHashRef.current! });

        if (onSuccess && !hasCalledSuccessRef.current) {
          hasCalledSuccessRef.current = true;
          onSuccess();
        }
      } catch (error) {
        console.error('Mobile: Failed to process deposit:', error);
        setTxStatus({
          state: 'error',
          message: 'Failed to process deposit. Please try again.',
        });
      }
    };

    const handleVisibilityChange = () => {
      console.log('Mobile: visibilitychange', document.visibilityState);
      if (document.visibilityState === 'visible') {
        processMobileDeposit();
      }
    };

    const handleFocus = () => {
      console.log('Mobile: focus event');
      processMobileDeposit();
    };

    // Simple event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Simple polling
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('Mobile: Polling detected return');
        processMobileDeposit();
      }
    }, 1000);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(pollInterval);
    };
  }, [isMobile, isOpen, txStatus.state, amount, address, onSuccess]);

  // Handle custom close with state reset
  const handleClose = useCallback(() => {
    setTxStatus({ state: 'idle' });
    setAmount('');
    onClose();
  }, [onClose]);

  // Handle amount input change with validation
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive integers
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
    }
  }, []);

  // Memoize derived values
  const depositAmount = useMemo(() => parseInt(amount || '0', 10), [amount]);

  const calculateNewBalance = useCallback(
    (): number => currentBalance + depositAmount,
    [currentBalance, depositAmount]
  );

  const isButtonDisabled = useMemo(() => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    return (
      !address ||
      !amount ||
      depositAmount <= 0 ||
      depositAmount > walletBalance ||
      (isMobileDevice && isMobileProcessing) ||
      isButtonClicked // Immediate debounce protection
    );
  }, [address, amount, depositAmount, walletBalance, isMobileProcessing, isButtonClicked]);

  // Function to check if inputs should be disabled
  const isInputDisabled = useCallback(() => {
    return (
      !address ||
      txStatus.state === 'buildingTransaction' ||
      txStatus.state === 'pending' ||
      txStatus.state === 'success'
    );
  }, [address, txStatus.state]);

  const handleOnStatus = useCallback(
    (status: any) => {
      console.log('Transaction status:', status.statusName, status);

      // Handle building/pending states
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

        // Store transaction hash for mobile processing
        if (isMobile) {
          processedTxHashRef.current = txHash;
          console.log('Mobile: Transaction hash stored:', txHash);
        }

        return;
      }

      if (
        status.statusName === 'success' &&
        status.statusData?.transactionReceipts?.[0]?.transactionHash
      ) {
        const txHash = status.statusData.transactionReceipts[0].transactionHash;

        // Set success state regardless of whether we've processed it
        setTxStatus({ state: 'success', txHash });

        // For mobile users, skip processing here - it will be handled when they return from wallet app
        if (isMobile) {
          console.log('Mobile: Transaction completed, waiting for user to return from wallet app');
          return;
        }

        // Desktop processing - handle immediately
        if (!hasProcessedDepositRef.current && processedTxHashRef.current !== txHash) {
          console.log('Desktop: Processing deposit for transaction:', txHash);

          // Mark as processed first to prevent race conditions
          hasProcessedDepositRef.current = true;
          processedTxHashRef.current = txHash;

          TransactionService.saveDeposit({
            amount: depositAmount,
            transaction_hash: txHash,
            from_address: address!,
            network: 'BASE',
          }).catch((error) => {
            console.error('Failed to record deposit:', error);
          });
        } else {
          console.log('Skipping duplicate deposit processing for transaction:', txHash);
        }

        if (onSuccess && !hasCalledSuccessRef.current) {
          hasCalledSuccessRef.current = true;
          onSuccess();
        }
        return;
      }

      if (status.statusName === 'error') {
        console.error('Transaction error full status:', JSON.stringify(status, null, 2));
        setTxStatus({
          state: 'error',
          message: status.statusData?.message || 'Transaction failed',
        });
      }
    },
    [depositAmount, address, onSuccess]
  );

  // Handle button click with immediate debounce
  const handleButtonClick = useCallback(() => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (isMobileDevice) {
      setIsButtonClicked(true);
      setIsMobileProcessing(true);
      console.log('Mobile: Button clicked - immediate debounce applied');
    }
  }, []);

  const callsCallback = useCallback(async () => {
    if (!depositAmount || depositAmount <= 0) {
      throw new Error('Invalid deposit amount');
    }
    if (depositAmount > walletBalance) {
      throw new Error('Deposit amount exceeds wallet balance');
    }

    // Immediate debounce for mobile - set processing state immediately
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (isMobileDevice) {
      setIsMobileProcessing(true);
      console.log('Mobile: Processing state set immediately');
    }

    const amountInWei = BigInt(depositAmount) * BigInt(10 ** 18);

    const transferInterface = new Interface(TRANSFER_ABI);
    const encodedData = transferInterface.encodeFunctionData('transfer', [
      HOT_WALLET_ADDRESS,
      amountInWei.toString(),
    ]);

    // Cast the result to Call type with proper hex type
    const transferCall: Call = {
      to: RSC.address as `0x${string}`,
      data: encodedData as `0x${string}`,
    };

    return [transferCall];
  }, [amount, depositAmount, walletBalance]);

  // If no wallet is connected, show nothing - assuming modal shouldn't open in this state
  if (!address) {
    return null;
  }

  return (
    <>
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

                    {/* Wallet RSC Balance */}
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
                          disabled={isInputDisabled()}
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
                          disabled={isInputDisabled()}
                          aria-label="Amount to deposit"
                          className={`w-full h-12 px-4 rounded-lg border border-gray-300 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition duration-200 ${isInputDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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

                    {/* Balance Display */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Current Balance:</span>
                        <div className="text-right flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <ResearchCoinIcon size={16} />
                            <span className="text-sm font-semibold text-gray-900">
                              {formatRSC({ amount: currentBalance })}
                            </span>
                            <span className="text-sm text-gray-500">RSC</span>
                          </div>
                        </div>
                      </div>

                      <div className="my-2 border-t border-gray-200" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">After Deposit:</span>
                        <div className="text-right flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <ResearchCoinIcon size={16} />
                            <span
                              className={`text-sm font-semibold ${depositAmount > 0 && depositAmount <= walletBalance ? 'text-green-600' : 'text-gray-900'}`}
                            >
                              {depositAmount > 0 && depositAmount <= walletBalance
                                ? formatRSC({ amount: calculateNewBalance() })
                                : formatRSC({ amount: currentBalance })}
                            </span>
                            <span className="text-sm text-gray-500">RSC</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Button */}
                    <Transaction
                      isSponsored={true}
                      chainId={RSC.chainId}
                      calls={callsCallback}
                      onStatus={handleOnStatus}
                    >
                      <div onClick={handleButtonClick}>
                        <TransactionButton
                          className="w-full h-12 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                          disabled={isButtonDisabled || txStatus.state === 'pending'}
                          text={(() => {
                            const isMobileDevice =
                              /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                                navigator.userAgent
                              );
                            if (isMobileDevice && (isMobileProcessing || isButtonClicked)) {
                              return 'Processing...';
                            }
                            if (txStatus.state === 'buildingTransaction') {
                              return 'Building Transaction...';
                            }
                            if (txStatus.state === 'pending') {
                              return 'Transaction Pending...';
                            }
                            return 'Deposit RSC';
                          })()}
                        />
                      </div>
                    </Transaction>

                    {/* Transaction Status Display */}
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
    </>
  );
}
