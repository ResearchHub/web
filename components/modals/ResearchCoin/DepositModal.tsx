'use client';

import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { X as XIcon, Check, AlertCircle } from 'lucide-react';
import { formatRSC, formatUsdValue } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useAccount } from 'wagmi';
import { useWalletRSCBalance } from '@/hooks/useWalletRSCBalance';
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { Interface } from 'ethers';
import { DepositService } from '@/services/deposit.service';
import { Button } from '@/components/ui/Button';
import { RSC, TRANSFER_ABI } from '@/constants/tokens';

const HOT_WALLET_ADDRESS_ENV = process.env.NEXT_PUBLIC_WEB3_WALLET_ADDRESS;
if (!HOT_WALLET_ADDRESS_ENV || HOT_WALLET_ADDRESS_ENV.trim() === '') {
  throw new Error('Missing environment variable: NEXT_PUBLIC_WEB3_WALLET_ADDRESS');
}
const HOT_WALLET_ADDRESS = HOT_WALLET_ADDRESS_ENV as `0x${string}`;

// Network configuration based on environment
const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';
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
}

// Define transaction status type
type TransactionStatus =
  | { state: 'idle' }
  | { state: 'pending' }
  | { state: 'success'; txHash: string }
  | { state: 'error'; message: string };

export function DepositModal({ isOpen, onClose, currentBalance }: DepositModalProps) {
  const [amount, setAmount] = useState<string>('');
  const { exchangeRate } = useExchangeRate();
  const { address } = useAccount();
  const { balance: walletBalance } = useWalletRSCBalance();
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
  const depositAmount = useMemo(() => parseFloat(amount || '0'), [amount]);

  const calculateNewBalance = useCallback(
    (): number => currentBalance + depositAmount,
    [currentBalance, depositAmount]
  );

  const isButtonDisabled = useMemo(
    () => !amount || depositAmount <= 0 || depositAmount > walletBalance,
    [amount, depositAmount, walletBalance]
  );

  const handleOnStatus = useCallback(
    (status: any) => {
      console.log('Transaction status:', status);

      if (status.statusName === 'waiting') {
        setTxStatus({ state: 'pending' });
      } else if (status.statusName === 'transactionLegacyExecuted') {
        const txHash = status.statusData.transactionHashList[0];
        setTxStatus({ state: 'success', txHash });

        // Still save the deposit record in the background
        DepositService.saveDeposit({
          amount: depositAmount,
          transaction_hash: txHash,
          from_address: address!,
          network: 'BASE',
        }).catch((error) => {
          console.error('Failed to record deposit:', error);
        });
      } else if (status.statusName === 'error') {
        // Log the entire status object to see its complete structure
        console.error('Transaction error full status:', JSON.stringify(status, null, 2));
        setTxStatus({
          state: 'error',
          message: status.statusData.message,
        });
      }
    },
    [depositAmount, address]
  );

  const callsCallback = useCallback(async () => {
    if (!depositAmount || depositAmount <= 0) {
      throw new Error('Invalid deposit amount');
    }
    if (depositAmount > walletBalance) {
      throw new Error('Deposit amount exceeds wallet balance');
    }
    const amountInWei = (parseFloat(amount) * 1e18).toFixed(0);

    const transferInterface = new Interface(TRANSFER_ABI);
    const encodedData = transferInterface.encodeFunctionData('transfer', [
      HOT_WALLET_ADDRESS,
      amountInWei,
    ]);

    // Cast the result to Call type with proper hex type
    const transferCall: Call = {
      to: RSC.address as `0x${string}`,
      data: encodedData as `0x${string}`,
    };

    return [transferCall];
  }, [amount, depositAmount, walletBalance]);

  // Function to reset the form
  const handleReset = useCallback(() => {
    setAmount('');
    setTxStatus({ state: 'idle' });
  }, []);

  // Add a reset function for transaction errors
  const handleResetError = useCallback(() => {
    setTxStatus({ state: 'idle' });
  }, []);

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
                          onClick={() => setAmount(walletBalance.toString())}
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
                          disabled={!address}
                          aria-label="Amount to deposit"
                          className={`w-full h-12 px-4 rounded-lg border border-gray-300 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition duration-200 ${!address ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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

                      {depositAmount > 0 && depositAmount <= walletBalance && (
                        <>
                          <div className="my-2 border-t border-gray-200" />
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">After Deposit:</span>
                            <div className="text-right flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <ResearchCoinIcon size={16} />
                                <span className="text-sm font-semibold text-green-600">
                                  {formatRSC({ amount: calculateNewBalance() })}
                                </span>
                                <span className="text-sm text-gray-500">RSC</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Transaction Button */}
                    <Transaction
                      chainId={RSC.chainId}
                      calls={callsCallback}
                      onStatus={handleOnStatus}
                    >
                      <TransactionButton
                        className="w-full h-12 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        disabled={isButtonDisabled || txStatus.state === 'pending'}
                        text={txStatus.state === 'pending' ? 'Processing...' : 'Deposit RSC'}
                      />
                    </Transaction>

                    {/* Transaction Status Display */}
                    {txStatus.state !== 'idle' && (
                      <div className="mt-4 p-4 rounded-lg border">
                        {txStatus.state === 'pending' && (
                          <div className="flex items-center text-amber-600">
                            <div className="animate-spin mr-2 h-5 w-5 border-2 border-amber-600 border-t-transparent rounded-full"></div>
                            <span>Transaction in progress...</span>
                          </div>
                        )}

                        {txStatus.state === 'success' && (
                          <div className="space-y-2">
                            <div className="flex items-center text-green-600">
                              <Check className="mr-2 h-5 w-5" />
                              <span className="font-medium">Deposit successful!</span>
                            </div>
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
