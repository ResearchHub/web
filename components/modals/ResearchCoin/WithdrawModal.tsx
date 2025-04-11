'use client';

import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useCallback, useMemo, useState, useEffect } from 'react';
import { X as XIcon, Check, AlertCircle, AlertTriangle } from 'lucide-react';
import { formatRSC, formatUsdValue } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useAccount } from 'wagmi';
import { WithdrawalService } from '@/services/withdrawal.service';

// Network configuration based on environment
const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';
const NETWORK_NAME = IS_PRODUCTION ? 'Base' : 'Base Sepolia';
const NETWORK_DESCRIPTION = IS_PRODUCTION
  ? 'Withdrawals are processed on Base L2'
  : 'Withdrawals are processed on Base Sepolia testnet';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
}

// Define transaction status type
type TransactionStatus =
  | { state: 'idle' }
  | { state: 'pending' }
  | { state: 'success'; txHash: string }
  | { state: 'error'; message: string };

export function WithdrawModal({ isOpen, onClose, availableBalance }: WithdrawModalProps) {
  const [amount, setAmount] = useState<string>('');
  const { exchangeRate } = useExchangeRate();
  const { address } = useAccount();
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ state: 'idle' });

  // Reset transaction status when modal is closed
  useEffect(() => {
    setTxStatus({ state: 'idle' });
    setAmount('');
  }, [isOpen]);

  // Handle custom close with state reset
  const handleClose = useCallback(() => {
    setTxStatus({ state: 'idle' });
    setAmount('');
    onClose();
  }, [onClose]);

  // Handle amount input change with validation
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow numbers and a single decimal point
    if (value === '' || /^(\d+)?(\.\d*)?$/.test(value)) {
      setAmount(value);
    }
  }, []);

  // Memoize derived values
  const withdrawAmount = useMemo(() => parseFloat(amount || '0'), [amount]);

  const calculateNewBalance = useCallback(
    (): number => availableBalance - withdrawAmount,
    [availableBalance, withdrawAmount]
  );

  const isButtonDisabled = useMemo(
    () => !amount || withdrawAmount <= 0 || withdrawAmount > availableBalance,
    [amount, withdrawAmount, availableBalance]
  );

  const handleMaxAmount = useCallback(() => {
    setAmount(availableBalance.toString());
  }, [availableBalance]);

  const handleWithdraw = useCallback(async () => {
    if (!address || !amount || isButtonDisabled) {
      return;
    }

    try {
      setTxStatus({ state: 'pending' });

      const response = await WithdrawalService.withdrawRSC({
        amount: withdrawAmount,
        to_address: address,
      });

      setTxStatus({
        state: 'success',
        txHash: response.transaction_hash,
      });
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setTxStatus({
        state: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }, [address, amount, withdrawAmount, isButtonDisabled]);

  // If no wallet is connected, show nothing
  if (!address) {
    return null;
  }

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
                    Withdraw RSC
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

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[15px] text-gray-700">Amount to Withdraw</span>
                      <button
                        onClick={handleMaxAmount}
                        className="text-sm text-primary-500 font-medium hover:text-primary-600"
                      >
                        MAX
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0.00"
                        aria-label="Amount to withdraw"
                        className={`w-full h-12 px-4 rounded-lg border border-gray-300 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition duration-200`}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <span className="text-gray-500">RSC</span>
                      </div>
                    </div>
                    {withdrawAmount > availableBalance && (
                      <p className="text-sm text-red-600" role="alert">
                        Withdrawal amount exceeds your available balance.
                      </p>
                    )}
                  </div>

                  {/* Withdrawal Address Display */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-[15px] text-gray-700">Withdrawal Address</span>
                    </div>
                    <div className="text-[14px] font-mono text-gray-800 break-all text-center">
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
                            className={`text-sm font-semibold ${withdrawAmount > 0 && withdrawAmount <= availableBalance ? 'text-red-600' : 'text-gray-900'}`}
                          >
                            {withdrawAmount > 0 && withdrawAmount <= availableBalance
                              ? formatRSC({ amount: calculateNewBalance() })
                              : formatRSC({ amount: availableBalance })}
                          </span>
                          <span className="text-sm text-gray-500">RSC</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleWithdraw}
                    disabled={isButtonDisabled || txStatus.state === 'pending'}
                    className="w-full h-12 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {txStatus.state === 'pending' ? 'Processing...' : 'Withdraw RSC'}
                  </button>

                  {/* Transaction Status Display */}
                  {txStatus.state !== 'idle' && (
                    <div className="mt-4 p-4 rounded-lg border">
                      {txStatus.state === 'pending' && (
                        <div className="flex items-center text-amber-600">
                          <div className="animate-spin mr-2 h-5 w-5 border-2 border-amber-600 border-t-transparent rounded-full"></div>
                          <span>Withdrawal in progress...</span>
                        </div>
                      )}

                      {txStatus.state === 'success' && (
                        <div className="space-y-2">
                          <div className="flex items-center text-green-600">
                            <Check className="mr-2 h-5 w-5" />
                            <span className="font-medium">Withdrawal successful!</span>
                          </div>
                        </div>
                      )}

                      {txStatus.state === 'error' && (
                        <div className="space-y-2">
                          <div className="flex items-center text-red-600">
                            <AlertCircle className="mr-2 h-5 w-5" />
                            <span className="font-medium">Withdrawal failed</span>
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
