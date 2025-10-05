'use client';

import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { X as XIcon, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Interface } from 'ethers';
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useWalletRSCBalance } from '@/hooks/useWalletRSCBalance';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useDepositTransaction } from '@/components/wallet/lib';
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

  const { address } = useAccount();
  const { balance: walletBalance } = useWalletRSCBalance();
  const isMobile = useIsMobile();

  const depositAmount = useMemo(() => Number.parseInt(amount || '0', 10), [amount]);
  const newBalance = useMemo(() => currentBalance + depositAmount, [currentBalance, depositAmount]);

  const { txStatus, setTxStatus, isInitiating, handleInitiateTransaction, handleOnStatus } =
    useDepositTransaction({
      depositAmount,
      isMobile,
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
      txStatus.state === 'buildingTransaction' ||
      txStatus.state === 'pending',
    [address, amount, depositAmount, walletBalance, isInitiating, txStatus.state]
  );

  const isInputDisabled = useMemo(
    () =>
      !address ||
      txStatus.state === 'buildingTransaction' ||
      txStatus.state === 'pending' ||
      txStatus.state === 'success',
    [address, txStatus.state]
  );

  const handleClose = useCallback(() => {
    setTxStatus({ state: 'idle' });
    setAmount('');
    onClose();
  }, [onClose, setTxStatus]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
    }
  }, []);

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

                  {txStatus.state !== 'success' && txStatus.state !== 'error' && (
                    <Transaction
                      isSponsored={true}
                      chainId={RSC.chainId}
                      calls={callsCallback}
                      onStatus={handleOnStatus}
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
                          pendingOverride={
                            isMobile
                              ? {
                                  text: (
                                    <span className="flex items-center justify-center gap-2">
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                      <span>Processing...</span>
                                    </span>
                                  ),
                                }
                              : undefined
                          }
                        />
                      </div>
                    </Transaction>
                  )}

                  {txStatus.state === 'success' && txStatus.txHash && (
                    <div className="space-y-3">
                      <a
                        href={`https://${IS_PRODUCTION ? 'basescan.org' : 'sepolia.basescan.org'}/tx/${txStatus.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full h-12 bg-indigo-600 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                      >
                        View transaction
                      </a>
                      <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                        <div className="flex items-center text-green-600 mb-2">
                          <Check className="mr-2 h-5 w-5" />
                          <span className="font-medium">Deposit successful!</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          It can take up to 10-20 minutes for the deposit to appear in your account.
                        </p>
                      </div>
                    </div>
                  )}

                  {txStatus.state === 'error' && (
                    <div className="mt-4 p-4 rounded-lg border border-red-200 bg-red-50">
                      <div className="flex items-center text-red-600 mb-2">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        <span className="font-medium">Deposit failed</span>
                      </div>
                      <p className="text-sm text-gray-600">{txStatus.message}</p>
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
