'use client';

import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { X as XIcon, Check, AlertCircle } from 'lucide-react';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useAccount } from 'wagmi';
import { useWalletRSCBalance } from '@/hooks/useWalletRSCBalance';
import { useDeviceType } from '@/hooks/useDeviceType';
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
  const isMobile = useDeviceType() === 'mobile';
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'failed'
  >('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [showMobileGuidance, setShowMobileGuidance] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTxStatus({ state: 'idle' });
      setAmount('');
      hasCalledSuccessRef.current = false;
      hasProcessedDepositRef.current = false;
      processedTxHashRef.current = null;
      setConnectionStatus('idle');
      setRetryCount(0);
      setShowMobileGuidance(false);
    }
  }, [isOpen]);

  // Monitor mobile connection
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const updateConnection = () => {
      if (!navigator.onLine) return setConnectionStatus('failed');
      setConnectionStatus(address ? 'connected' : 'idle');
    };

    updateConnection();
    window.addEventListener('online', () => setConnectionStatus('connected'));
    window.addEventListener('offline', () => setConnectionStatus('failed'));

    return () => {
      window.removeEventListener('online', () => setConnectionStatus('connected'));
      window.removeEventListener('offline', () => setConnectionStatus('failed'));
    };
  }, [isMobile, isOpen, address]);

  // Handle mobile wallet app return detection
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && txStatus.state === 'pending') {
        // User returned from wallet app, check if transaction completed
        console.log('Mobile: User returned from wallet app, checking transaction status');
        setConnectionStatus('connected');
        setShowMobileGuidance(false);
      }
    };

    const handleFocus = () => {
      if (txStatus.state === 'pending') {
        console.log('Mobile: Window focused, user likely returned from wallet app');
        setConnectionStatus('connected');
        setShowMobileGuidance(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isMobile, isOpen, txStatus.state]);

  // Mobile wallet timeout guidance
  useEffect(() => {
    if (!isMobile || !isOpen || txStatus.state !== 'pending') return;

    const timeout = setTimeout(() => {
      if (txStatus.state === 'pending') {
        console.log('Mobile: Transaction pending for 30s, showing guidance');
        setShowMobileGuidance(true);
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(timeout);
  }, [isMobile, isOpen, txStatus.state]);

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

  const isButtonDisabled = useMemo(
    () => !address || !amount || depositAmount <= 0 || depositAmount > walletBalance,
    [address, amount, depositAmount, walletBalance]
  );

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
      console.log('Transaction status:', status.statusName, isMobile ? '(mobile)' : '', status);

      // Update connection status for mobile
      if (isMobile) {
        if (status.statusName === 'buildingTransaction') setConnectionStatus('connecting');
        if (status.statusName === 'transactionPending') setConnectionStatus('connected');
      }

      // Handle transaction states
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
        setTxStatus({ state: 'pending', txHash: status.statusData.transactionHashList[0] });
        return;
      }

      if (
        status.statusName === 'success' &&
        status.statusData?.transactionReceipts?.[0]?.transactionHash
      ) {
        const txHash = status.statusData.transactionReceipts[0].transactionHash;
        setTxStatus({ state: 'success', txHash });

        // Process deposit with mobile retry logic
        if (!hasProcessedDepositRef.current && processedTxHashRef.current !== txHash) {
          hasProcessedDepositRef.current = true;
          processedTxHashRef.current = txHash;

          const saveDeposit = async (attempt = 0) => {
            try {
              await TransactionService.saveDeposit({
                amount: depositAmount,
                transaction_hash: txHash,
                from_address: address!,
                network: 'BASE',
              });
              if (isMobile) setConnectionStatus('connected');
            } catch (error) {
              console.error('Failed to record deposit:', error);
              if (isMobile && attempt < 3) {
                setRetryCount(attempt + 1);
                setTimeout(() => saveDeposit(attempt + 1), 2000 * Math.pow(2, attempt));
              } else if (isMobile) {
                setConnectionStatus('failed');
              }
            }
          };

          saveDeposit();
        }

        if (onSuccess && !hasCalledSuccessRef.current) {
          hasCalledSuccessRef.current = true;
          onSuccess();
        }
        return;
      }

      if (status.statusName === 'error') {
        const errorMessage = status.statusData?.message || 'Transaction failed';
        if (isMobile) setConnectionStatus('failed');

        setTxStatus({
          state: 'error',
          message: isMobile
            ? `Transaction failed. Please check your connection and try again. (${errorMessage})`
            : errorMessage,
        });
      }
    },
    [depositAmount, address, onSuccess, isMobile]
  );

  const callsCallback = useCallback(async () => {
    // Mobile connection validation
    if (isMobile && (connectionStatus === 'failed' || !navigator.onLine)) {
      throw new Error('Connection failed. Please check your internet connection and try again.');
    }

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
  }, [depositAmount, walletBalance, isMobile, connectionStatus]);

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

                    {/* Mobile Connection Status */}
                    {isMobile && connectionStatus !== 'idle' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              connectionStatus === 'connected'
                                ? 'bg-green-500'
                                : connectionStatus === 'connecting'
                                  ? 'bg-yellow-500 animate-pulse'
                                  : connectionStatus === 'failed'
                                    ? 'bg-red-500'
                                    : 'bg-gray-400'
                            }`}
                          />
                          <span className="text-sm text-blue-700">
                            {connectionStatus === 'connected'
                              ? 'Connected to wallet'
                              : connectionStatus === 'connecting'
                                ? 'Connecting to wallet...'
                                : connectionStatus === 'failed'
                                  ? 'Connection failed - Please try again'
                                  : 'Checking connection...'}
                          </span>
                        </div>
                        {retryCount > 0 && (
                          <p className="text-xs text-blue-600 mt-1">
                            Retry attempt: {retryCount}/3
                          </p>
                        )}
                      </div>
                    )}

                    {/* Mobile Wallet App Guidance */}
                    {isMobile && showMobileGuidance && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-amber-800 mb-2">
                              Stuck in Coinbase Wallet?
                            </h4>
                            <div className="text-sm text-amber-700 space-y-1">
                              <p>If you're still in the Coinbase Wallet app:</p>
                              <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>Complete the transaction in your wallet</li>
                                <li>Return to this browser tab</li>
                                <li>The deposit will be processed automatically</li>
                              </ol>
                              <p className="mt-2 text-xs text-amber-600">
                                Don't worry - your transaction is safe and will be recorded once you
                                return.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transaction Button */}
                    <Transaction
                      isSponsored={true}
                      chainId={RSC.chainId}
                      calls={callsCallback}
                      onStatus={handleOnStatus}
                    >
                      <TransactionButton
                        className="w-full h-12 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        disabled={
                          isButtonDisabled ||
                          txStatus.state === 'pending' ||
                          (isMobile && connectionStatus === 'failed')
                        }
                        text={
                          isMobile && connectionStatus === 'failed'
                            ? 'Connection Failed - Try Again'
                            : txStatus.state === 'buildingTransaction'
                              ? 'Building Transaction...'
                              : txStatus.state === 'pending'
                                ? 'Transaction Pending...'
                                : 'Deposit RSC'
                        }
                      />
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
