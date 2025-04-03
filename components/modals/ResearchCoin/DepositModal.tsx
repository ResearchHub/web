'use client';

import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment, useCallback, useState } from 'react';
import { X as XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { formatRSC } from '@/utils/number';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useAccount, useBalance } from 'wagmi';
import { DepositService } from '@/services/deposit.service';
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { WalletModal } from 'components/modals/WalletModal';
import type { Token } from '@coinbase/onchainkit/token';
import { Interface } from 'ethers';

const BASE_RSC_ADDRESS_ENV = process.env.NEXT_PUBLIC_WEB3_BASE_RSC_ADDRESS;
if (!BASE_RSC_ADDRESS_ENV || BASE_RSC_ADDRESS_ENV.trim() === '') {
  throw new Error('Missing environment variable: NEXT_PUBLIC_WEB3_BASE_RSC_ADDRESS');
}
const BASE_RSC_ADDRESS = BASE_RSC_ADDRESS_ENV as `0x${string}`;

const CHAIN_ID = process.env.NODE_ENV !== 'production' ? 84532 : 8453;
const RSC: Token = {
  name: 'ResearchCoin',
  address: BASE_RSC_ADDRESS,
  symbol: 'RSC',
  decimals: 18,
  image: '/RSC.webp',
  chainId: CHAIN_ID,
};

const ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const HOT_WALLET_ADDRESS_ENV = process.env.NEXT_PUBLIC_WEB3_WALLET_ADDRESS;
if (!HOT_WALLET_ADDRESS_ENV || HOT_WALLET_ADDRESS_ENV.trim() === '') {
  throw new Error('Missing environment variable: NEXT_PUBLIC_WEB3_WALLET_ADDRESS');
}
const HOT_WALLET_ADDRESS = HOT_WALLET_ADDRESS_ENV as `0x${string}`;

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export function DepositModal({ isOpen, onClose, currentBalance }: DepositModalProps) {
  const [amount, setAmount] = useState<string>('');
  const { exchangeRate } = useExchangeRate();
  const { address } = useAccount();

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const handleOpenWalletModal = () => setIsWalletModalOpen(true);
  const handleCloseWalletModal = () => setIsWalletModalOpen(false);

  const { data: rscBalanceData } = useBalance({
    address,
    token: RSC.address || undefined,
    chainId: RSC.chainId,
  });

  const walletBalance = rscBalanceData ? parseFloat(rscBalanceData.formatted) : 0;
  const depositAmount = parseFloat(amount || '0');

  const calculateNewBalance = (): number => currentBalance + depositAmount;

  const handleOnStatus = useCallback(
    (status: any) => {
      console.log('Transaction status:', status);
      if (status.statusName === 'transactionLegacyExecuted') {
        const txHash = status.statusData.transactionHashList[0];
        DepositService.saveDeposit({
          amount: depositAmount,
          transaction_hash: txHash,
          from_address: address!,
          network: 'BASE',
        })
          .then(() => toast.success('Deposit recorded successfully!'))
          .catch((error) => {
            console.error('Failed to record deposit:', error);
            toast.error('Deposit succeeded but failed to record deposit.');
          });
        onClose();
        setAmount('');
      } else if (status.statusName === 'error') {
        toast.error('Deposit failed. Please try again.');
      }
    },
    [onClose, depositAmount, address]
  );

  const callsCallback = useCallback(async () => {
    if (!depositAmount || depositAmount <= 0) {
      throw new Error('Invalid deposit amount');
    }
    if (depositAmount > walletBalance) {
      throw new Error('Deposit amount exceeds wallet balance');
    }
    const amountInWei = (parseFloat(amount) * 1e18).toFixed(0);

    const transferInterface = new Interface(ABI);
    const encodedData = transferInterface.encodeFunctionData('transfer', [
      HOT_WALLET_ADDRESS,
      amountInWei,
    ]);

    type Call = {
      to: `0x${string}`;
      data?: `0x${string}`;
      value?: bigint;
    };

    // Cast the result to Call type with proper hex type
    const transferCall: Call = {
      to: BASE_RSC_ADDRESS,
      data: encodedData as `0x${string}`,
    };

    return [transferCall];
  }, [amount, depositAmount, walletBalance]);

  const isButtonDisabled = !amount || depositAmount <= 0 || depositAmount > walletBalance;

  return (
    <>
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
                          <span className="text-sm font-medium text-gray-900">
                            {process.env.NODE_ENV !== 'production' ? 'Base Sepolia' : 'Base'}{' '}
                            Network
                          </span>
                          <span className="text-xs text-gray-500">
                            Deposits are processed on{' '}
                            {process.env.NODE_ENV !== 'production' ? 'Base Sepolia' : 'Base'}{' '}
                            {process.env.NODE_ENV !== 'production' ? 'Testnet' : 'L2'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Wallet RSC Balance */}
                    {rscBalanceData && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Wallet Balance:</span>
                          <div className="flex items-center gap-2">
                            <ResearchCoinIcon size={16} />
                            <span className="text-sm font-semibold text-gray-900">
                              {parseFloat(rscBalanceData.formatted).toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500">RSC</span>
                          </div>
                        </div>
                      </div>
                    )}

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
                          disabled={!address}
                          className={`w-full h-12 px-4 rounded-lg border border-gray-300 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition duration-200 ${!address ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <span className="text-gray-500">RSC</span>
                        </div>
                      </div>
                      {depositAmount > walletBalance && (
                        <p className="text-sm text-red-600">
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
                            <span className="text-sm font-semibold">
                              {formatRSC({ amount: calculateNewBalance() })}
                            </span>
                            <span className="text-sm text-gray-500">RSC</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Button or Wallet Modal Trigger */}
                    {address ? (
                      <Transaction
                        chainId={RSC.chainId}
                        calls={callsCallback}
                        onStatus={handleOnStatus}
                      >
                        <TransactionButton
                          className="w-full h-12 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                          disabled={isButtonDisabled}
                          text="Deposit"
                        />
                      </Transaction>
                    ) : (
                      <div className="w-full flex items-center justify-center">
                        <Button
                          className="w-full h-12 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                          onClick={handleOpenWalletModal}
                        >
                          Connect Wallet
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogPanel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <WalletModal isOpen={isWalletModalOpen} onClose={handleCloseWalletModal} />
    </>
  );
}
