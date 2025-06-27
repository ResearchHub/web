'use client';

import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useCallback, useMemo, useState, useEffect } from 'react';
import { X as XIcon, Check, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useAccount } from 'wagmi';
import { useWithdrawRSC } from '@/hooks/useWithdrawRSC';
import { cn } from '@/utils/styles';

// Network configuration based on environment
const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const NETWORK_NAME = IS_PRODUCTION ? 'Base' : 'Base Sepolia';
const NETWORK_DESCRIPTION = IS_PRODUCTION
  ? 'Withdrawals are processed on Base L2'
  : 'Withdrawals are processed on Base Sepolia testnet';
const BLOCK_EXPLORER_URL = IS_PRODUCTION ? 'https://basescan.org' : 'https://sepolia.basescan.org';

// Minimum withdrawal amount in RSC
const MIN_WITHDRAWAL_AMOUNT = 150;

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess?: () => void;
}

export function WithdrawModal({
  isOpen,
  onClose,
  availableBalance,
  onSuccess,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState<string>('');
  const { address } = useAccount();
  const [{ txStatus, isLoading, fee, isFeeLoading, feeError }, withdrawRSC] = useWithdrawRSC();

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
    }
  }, [isOpen]);

  // Handle amount input change with validation
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive integers
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
    }
  }, []);

  // Memoize derived values
  const withdrawAmount = useMemo(() => parseInt(amount || '0', 10), [amount]);

  // Calculate the amount the user will actually receive
  const amountUserWillReceive = useMemo((): number => {
    if (!fee) return 0;
    return Math.max(0, withdrawAmount - fee);
  }, [withdrawAmount, fee]);

  // Check if the withdrawal amount is below minimum
  const isBelowMinimum = useMemo(
    () => withdrawAmount > 0 && withdrawAmount < MIN_WITHDRAWAL_AMOUNT,
    [withdrawAmount]
  );

  // Calculate total amount needed (withdrawal amount)
  const calculateTotalWithFee = useCallback((): number => {
    return withdrawAmount;
  }, [withdrawAmount]);

  const calculateNewBalance = useCallback((): number => {
    return Math.max(0, availableBalance - calculateTotalWithFee());
  }, [availableBalance, calculateTotalWithFee]);

  // Check if user has enough balance for withdrawal
  const hasInsufficientBalance = useMemo(
    () => withdrawAmount > 0 && withdrawAmount > availableBalance,
    [withdrawAmount, availableBalance]
  );

  // Determine if withdraw button should be disabled
  const isButtonDisabled = useMemo(
    () =>
      !amount ||
      withdrawAmount <= 0 ||
      txStatus.state === 'pending' ||
      isFeeLoading ||
      !fee ||
      hasInsufficientBalance ||
      isBelowMinimum ||
      amountUserWillReceive <= 0,
    [
      amount,
      withdrawAmount,
      txStatus.state,
      isFeeLoading,
      fee,
      hasInsufficientBalance,
      isBelowMinimum,
      amountUserWillReceive,
    ]
  );

  // Function to check if inputs should be disabled
  const isInputDisabled = useCallback(() => {
    return !address || txStatus.state === 'pending' || txStatus.state === 'success';
  }, [address, txStatus.state]);

  const handleMaxAmount = useCallback(() => {
    if (isInputDisabled() || !fee) return;
    const maxWithdrawAmount = Math.floor(availableBalance);
    setAmount(maxWithdrawAmount > 0 ? maxWithdrawAmount.toString() : '0');
  }, [availableBalance, isInputDisabled, fee]);

  const handleWithdraw = useCallback(async () => {
    if (!address || !amount || isButtonDisabled || !fee) {
      return;
    }

    const result = await withdrawRSC({
      to_address: address,
      agreed_to_terms: true,
      amount: amount,
      network: 'BASE',
    });

    // Call onSuccess callback when withdrawal is successful
    if (result && txStatus.state === 'success' && onSuccess) {
      onSuccess();
    }
  }, [address, amount, isButtonDisabled, withdrawRSC, txStatus.state, onSuccess, fee]);

  // If no wallet is connected, show nothing
  if (!address) {
    return null;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                    Withdraw RSC
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors rounded-full p-1 hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* 24-hour withdrawal limit banner */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-3 rounded mb-4 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  You can only withdraw once every 24 hours.
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

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[15px] text-gray-700">Amount to Withdraw</span>
                      <button
                        onClick={handleMaxAmount}
                        disabled={isInputDisabled()}
                        className="text-sm text-primary-500 font-medium hover:text-primary-600 disabled:opacity-50 disabled:text-gray-400 disabled:hover:text-gray-400"
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
                        aria-label="Amount to withdraw"
                        className={cn(
                          'w-full h-12 px-4 rounded-lg border border-gray-300 placeholder:text-gray-400',
                          'focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition duration-200',
                          isInputDisabled() && 'bg-gray-100 cursor-not-allowed'
                        )}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <span className="text-gray-500">RSC</span>
                      </div>
                    </div>
                    {isBelowMinimum && (
                      <p className="text-sm text-red-600" role="alert">
                        Minimum withdrawal amount is {MIN_WITHDRAWAL_AMOUNT} RSC.
                      </p>
                    )}
                    {hasInsufficientBalance && (
                      <p className="text-sm text-red-600" role="alert">
                        Withdrawal amount exceeds your available balance.
                      </p>
                    )}
                  </div>

                  {/* Fee Display */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    {isFeeLoading ? (
                      <p className="text-sm text-gray-700 flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Calculating network fee...
                      </p>
                    ) : feeError ? (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Unable to fetch fee: {feeError}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />A network fee of{' '}
                          {fee} RSC will be deducted from your withdrawal amount.
                        </p>

                        {/* Added "You will receive" row */}
                        {withdrawAmount > 0 && fee && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">
                                You will receive:
                              </span>
                              <div className="flex items-center gap-1">
                                <ResearchCoinIcon size={16} />
                                <span className="text-sm font-semibold text-gray-900">
                                  {formatRSC({ amount: amountUserWillReceive })}
                                </span>
                                <span className="text-sm text-gray-500">RSC</span>
                              </div>
                            </div>
                            {amountUserWillReceive <= 0 && withdrawAmount > 0 && (
                              <p className="text-xs text-red-600 mt-1">
                                Withdrawal amount must be greater than the network fee.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Withdrawal Address Display */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-[15px] text-gray-700">Withdrawal Address</span>
                    </div>
                    <div className="text-[14px] font-mono text-gray-800 break-all text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      {address}
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Balance:</span>
                      <div className="text-right flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <ResearchCoinIcon size={16} />
                          <span className="text-sm font-semibold text-gray-900">
                            {formatRSC({ amount: availableBalance })}
                          </span>
                          <span className="text-sm text-gray-500">RSC</span>
                        </div>
                      </div>
                    </div>

                    <div className="my-2 border-t border-gray-200" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">After Withdrawal:</span>
                      <div className="text-right flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <ResearchCoinIcon size={16} />
                          <span
                            className={cn(
                              'text-sm font-semibold',
                              withdrawAmount > 0 ? 'text-red-600' : 'text-gray-900'
                            )}
                          >
                            {withdrawAmount > 0
                              ? formatRSC({ amount: calculateNewBalance() })
                              : formatRSC({ amount: availableBalance })}
                          </span>
                          <span className="text-sm text-gray-500">RSC</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {txStatus.state === 'success' ? (
                    <a
                      href={`${BLOCK_EXPLORER_URL}/tx/${txStatus.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-12 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center justify-center shadow-md"
                    >
                      View Transaction
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  ) : (
                    <button
                      onClick={handleWithdraw}
                      disabled={isButtonDisabled}
                      className={cn(
                        'w-full h-12 bg-primary-500 text-white rounded-lg font-medium',
                        'hover:bg-primary-600 transition-colors shadow-md',
                        isButtonDisabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {isFeeLoading
                        ? 'Loading fee...'
                        : txStatus.state === 'pending'
                          ? 'Processing...'
                          : 'Withdraw RSC'}
                    </button>
                  )}

                  {/* Transaction Status Display */}
                  {txStatus.state !== 'idle' && (
                    <div className="mt-4 p-4 rounded-lg border">
                      {txStatus.state === 'pending' && (
                        <div className="flex items-center text-amber-600">
                          <Loader2 className="animate-spin mr-2 h-5 w-5" />
                          <span>Withdrawal in progress...</span>
                        </div>
                      )}

                      {txStatus.state === 'success' && (
                        <div className="flex items-center text-green-600">
                          <Check className="mr-2 h-5 w-5" />
                          <span className="font-medium">Withdrawal successful!</span>
                        </div>
                      )}

                      {txStatus.state === 'error' && (
                        <div className="space-y-2">
                          <div className="flex items-center text-red-600">
                            <AlertCircle className="mr-2 h-5 w-5" />
                            <span className="font-medium">Withdrawal failed</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 p-3">{txStatus.message}</p>
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
