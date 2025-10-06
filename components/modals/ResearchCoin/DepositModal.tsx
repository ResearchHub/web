'use client';

import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { X as XIcon, Check } from 'lucide-react';
import { useAccount, useReconnect } from 'wagmi';
import { Interface } from 'ethers';
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useWalletRSCBalance } from '@/hooks/useWalletRSCBalance';
import { useDepositTransaction } from '@/components/wallet/lib';
import { Input } from '@/components/ui/form/Input';
import { RSC, TRANSFER_ABI } from '@/constants/tokens';

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

export function DepositModal({ isOpen, onClose, currentBalance, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [transactionKey, setTransactionKey] = useState(0);

  const { address, isConnected } = useAccount();
  const { reconnect } = useReconnect();
  const { balance: walletBalance } = useWalletRSCBalance();

  const reconnectAttemptedRef = useRef(false);

  const depositAmount = useMemo(() => Number.parseInt(amount || '0', 10), [amount]);
  const newBalance = useMemo(() => currentBalance + depositAmount, [currentBalance, depositAmount]);

  const {
    txStatus,
    isInitiating,
    handleInitiateTransaction,
    handleOnStatus,
    handleOnSuccess,
    handleOnError,
  } = useDepositTransaction({
    depositAmount,
    isOpen,
    onSuccess,
  });

  const isButtonDisabled = useMemo(
    () =>
      !address ||
      !amount ||
      depositAmount <= 0 ||
      depositAmount > walletBalance ||
      isInitiating ||
      txStatus.state === 'processing',
    [address, amount, depositAmount, walletBalance, isInitiating, txStatus.state]
  );

  const isInputDisabled = useMemo(
    () => !address || txStatus.state === 'processing' || txStatus.state === 'success',
    [address, txStatus.state]
  );

  // Force Transaction component to remount when modal opens
  // This helps OnchainKit properly detect transaction status on mobile
  useEffect(() => {
    if (isOpen) {
      console.log('[DepositModal] Modal opened, incrementing transaction key');
      setTransactionKey((prev) => prev + 1);
    } else {
      console.log('[DepositModal] Modal closed');
    }
  }, [isOpen]);

  // CRITICAL: Reconnect wallet and remount Transaction when returning from wallet app
  // This ensures OnchainKit has an active connection to detect transaction completion
  useEffect(() => {
    if (!isOpen || txStatus.state !== 'processing') {
      // Reset reconnect flag when modal closes or transaction completes
      reconnectAttemptedRef.current = false;
      return;
    }

    let remountTimer: NodeJS.Timeout;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('[DepositModal] 🔄 Page became visible while processing');

        // Step 1: Check and restore wallet connection if needed
        if (!isConnected && !reconnectAttemptedRef.current) {
          console.log('[DepositModal] 🔌 Wallet disconnected - attempting reconnect...');
          reconnectAttemptedRef.current = true;
          try {
            await reconnect();
            console.log('[DepositModal] ✅ Wallet reconnected successfully');
          } catch (error) {
            console.error('[DepositModal] ❌ Failed to reconnect wallet:', error);
          }
          // Wait 500ms for connection to stabilize
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          console.log('[DepositModal] ✅ Wallet still connected');
        }

        // Step 2: Remount Transaction to force status check
        console.log('[DepositModal] 🔄 Remounting Transaction to force re-check');
        setTransactionKey((prev) => prev + 1);

        // Step 3: Secondary remount after 2s for extra reliability
        remountTimer = setTimeout(() => {
          console.log('[DepositModal] 🔄 Secondary remount after 2s for extra reliability');
          setTransactionKey((prev) => prev + 1);
        }, 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (remountTimer) clearTimeout(remountTimer);
    };
  }, [isOpen, txStatus.state, isConnected, reconnect]);

  // Log transaction status changes
  useEffect(() => {
    console.log('[DepositModal] Transaction status changed:', txStatus);
  }, [txStatus]);

  // Log when initiating state changes
  useEffect(() => {
    console.log('[DepositModal] isInitiating changed:', isInitiating);
  }, [isInitiating]);

  // Log wallet connection status
  useEffect(() => {
    if (isOpen) {
      console.log('[DepositModal] Wallet connection status:', {
        isConnected,
        hasAddress: !!address,
        address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'none',
      });
    }
  }, [isOpen, isConnected, address]);

  const handleClose = useCallback(() => {
    setAmount('');
    onClose();
  }, [onClose]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
    }
  }, []);

  const callsCallback = useCallback(async (): Promise<Call[]> => {
    console.log('[DepositModal] callsCallback invoked', {
      depositAmount,
      walletBalance,
      address,
    });

    if (!depositAmount || depositAmount <= 0) {
      console.error('[DepositModal] Invalid deposit amount:', depositAmount);
      throw new Error('Invalid deposit amount');
    }
    if (depositAmount > walletBalance) {
      console.error('[DepositModal] Deposit amount exceeds wallet balance:', {
        depositAmount,
        walletBalance,
      });
      throw new Error('Deposit amount exceeds wallet balance');
    }

    const amountInWei = BigInt(depositAmount) * BigInt(10 ** 18);
    console.log('[DepositModal] Amount in wei:', amountInWei.toString());

    const transferInterface = new Interface(TRANSFER_ABI);
    const encodedData = transferInterface.encodeFunctionData('transfer', [
      HOT_WALLET_ADDRESS,
      amountInWei.toString(),
    ]);

    const calls = [
      {
        to: RSC.address as `0x${string}`,
        data: encodedData as `0x${string}`,
      },
    ];

    console.log('[DepositModal] Prepared transaction calls:', calls);
    return calls;
  }, [depositAmount, walletBalance, address]);

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

                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-700">Amount to Deposit</span>
                      <button
                        onClick={() => setAmount(Math.floor(walletBalance).toString())}
                        className="text-sm text-primary-500 font-medium hover:text-primary-600 disabled:opacity-50 disabled:text-gray-400 disabled:hover:text-gray-400"
                        disabled={isInputDisabled}
                      >
                        MAX
                      </button>
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0"
                      disabled={isInputDisabled}
                      rightElement={
                        <div className="flex items-center pr-2 pl-2">
                          <span className="text-gray-500">RSC</span>
                        </div>
                      }
                      error={
                        depositAmount > walletBalance
                          ? 'Deposit amount exceeds your wallet balance.'
                          : undefined
                      }
                    />
                  </div>

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

                  <Transaction
                    key={transactionKey}
                    isSponsored={true}
                    chainId={RSC.chainId}
                    calls={callsCallback}
                    onStatus={handleOnStatus}
                    onSuccess={handleOnSuccess}
                    onError={handleOnError}
                  >
                    <div
                      onClick={handleInitiateTransaction}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleInitiateTransaction();
                        }
                      }}
                      role="presentation"
                    >
                      <TransactionButton
                        className="w-full h-12 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        disabled={isButtonDisabled}
                        text="Deposit RSC"
                      />
                    </div>
                  </Transaction>

                  {txStatus.state === 'success' && (
                    <div className="mt-4 p-4 rounded-lg border border-green-200 bg-green-50">
                      <div className="flex items-center text-green-600 mb-2">
                        <Check className="mr-2 h-5 w-5" />
                        <span className="font-medium">Deposit successful!</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        It can take up to 10-20 minutes for the deposit to appear in your account.
                      </p>
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
