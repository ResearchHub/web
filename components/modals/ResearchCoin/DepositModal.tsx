'use client';

import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { X as XIcon, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { colors } from '@/app/styles/colors';
import { TransactionService } from '@/services/transaction.service';
import { formatRSC, formatUsdValue } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export function DepositModal({ isOpen, onClose, currentBalance }: DepositModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(1.576); // Default fallback
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await TransactionService.getLatestExchangeRate();
        if (response.results[0]?.rate) {
          setExchangeRate(response.results[0].rate);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
      }
    };

    if (isOpen) {
      fetchExchangeRate();
    }
  }, [isOpen]);

  const calculateNewBalance = (): number => {
    const deposit = parseFloat(amount || '0');
    return currentBalance + deposit;
  };

  async function handleDeposit() {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setIsProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Deposit successful!');
      onClose();
      setAmount('');
    } catch (error) {
      console.error('Deposit failed:', error);
      toast.error('Deposit failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
                    Deposit RSC
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors rounded-full p-1 hover:bg-gray-100"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Network Info */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-md">
                    <div className="flex items-center gap-3">
                      <img src="/base-logo.svg" alt="Base Network" className="h-6 w-6" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">Base Network</span>
                        <span className="text-xs text-gray-500">
                          Deposits are processed on Base L2
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <span className="text-[15px] text-gray-700">Amount to Deposit</span>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-12 px-4 rounded-lg border border-gray-300 
                          placeholder:text-gray-400 focus:border-primary-500 
                          focus:ring-2 focus:ring-primary-500 transition duration-200"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <span className="text-gray-500">RSC</span>
                      </div>
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Balance:</span>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <ResearchCoinIcon size={16} />
                            <span className="text-sm font-semibold text-gray-900">
                              {formatRSC({ amount: currentBalance })}
                            </span>
                            <span className="text-sm text-gray-500">RSC</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            ≈ {formatUsdValue(currentBalance.toString(), exchangeRate)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {amount && parseFloat(amount) > 0 && (
                      <>
                        <div className="my-2 border-t border-gray-200" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">After Deposit:</span>
                          <div className="text-right flex items-center gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-green-600">
                                  {formatRSC({ amount: calculateNewBalance() })}
                                </span>
                                <ResearchCoinIcon size={16} />
                                <span className="text-sm text-gray-500">RSC</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                ≈ {formatUsdValue(calculateNewBalance().toString(), exchangeRate)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleDeposit}
                    disabled={isProcessing || !amount}
                    className="w-full h-12 bg-primary-500 text-white rounded-lg font-medium
                      hover:bg-primary-600 transition-colors disabled:opacity-50 
                      disabled:cursor-not-allowed shadow-md"
                  >
                    {isProcessing ? 'Processing...' : 'Deposit RSC'}
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
