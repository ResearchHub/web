'use client';

import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { X as XIcon, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { colors } from '@/app/styles/colors';
import { TransactionService } from '@/services/transaction.service';
import { formatRSC, formatUsdValue } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
}

export function WithdrawModal({ isOpen, onClose, availableBalance }: WithdrawModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { exchangeRate, isLoading: isLoadingRate } = useExchangeRate();

  async function handleWithdraw() {
    setErrorMessage(''); // Reset error message
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > availableBalance) {
      setErrorMessage('Insufficient balance');
      return;
    }

    try {
      setIsProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`Withdrawal of ${amount} RSC initiated successfully!`);
      onClose();
      setAmount('');
    } catch (error) {
      console.error('Withdrawal failed:', error);
      toast.error('Withdrawal failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  const handleMaxAmount = () => {
    setAmount(availableBalance.toString());
  };

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
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle className="text-2xl font-semibold text-gray-900">
                    Withdraw RSC
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors rounded-full p-1 hover:bg-gray-100"
                    aria-label="Close modal"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Network Info */}
                  <div className="bg-gray-50 rounded-xl p-4 shadow-md border border-gray-200">
                    <div className="flex items-center gap-3">
                      <img src="/base-logo.svg" alt="Base Network" className="h-6 w-6" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">Base Network</span>
                        <span className="text-xs text-gray-500">
                          Withdrawals are processed on Base L2
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Amount to Withdraw</span>
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
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className={`w-full h-12 px-4 rounded-lg border ${errorMessage ? 'border-red-500' : 'border-gray-300'} 
                          placeholder:text-gray-400 focus:border-primary-500 
                          focus:ring-2 focus:ring-primary-500 transition duration-200 shadow-sm`}
                        aria-label="Amount to withdraw"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <span className="text-gray-500">RSC</span>
                      </div>
                    </div>
                    {errorMessage && (
                      <p className="text-red-500 text-sm font-semibold">{errorMessage}</p>
                    )}
                  </div>

                  {/* Warning */}
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-700 flex-shrink-0" />
                      <p className="text-sm text-amber-700">
                        Please ensure the withdrawal address is correct. Transactions cannot be
                        reversed once confirmed.
                      </p>
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Available Balance:</span>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <ResearchCoinIcon size={16} />
                            <span className="text-sm font-semibold text-gray-900">
                              {formatRSC({ amount: availableBalance })}
                            </span>
                            <span className="text-xs text-gray-500">RSC</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            ≈ {formatUsdValue(availableBalance.toString(), exchangeRate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleWithdraw}
                    disabled={isProcessing || !amount}
                    className="w-full h-12 bg-primary-500 text-white rounded-lg font-medium
                      hover:bg-primary-600 transition-colors disabled:opacity-50 
                      disabled:cursor-not-allowed shadow-md"
                  >
                    {isProcessing ? 'Processing...' : 'Withdraw RSC'}
                  </button>
                </div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
