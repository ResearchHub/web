'use client';

import { ArrowDownToLine } from 'lucide-react';
import { useState } from 'react';
import { WalletDefault } from '@coinbase/onchainkit/wallet';
import { FundCard } from '@coinbase/onchainkit/fund';
import { Button } from '@/components/ui/Button';
import {
  Swap,
  SwapAmountInput,
  SwapButton,
  SwapMessage,
  SwapToast,
} from '@coinbase/onchainkit/swap';
import type { Token } from '@coinbase/onchainkit/token';
import { DepositModal } from '../modals/ResearchCoin/DepositModal';

const RSC: Token = {
  name: 'ResearchCoin',
  address: '0xfbb75a59193a3525a8825bebe7d4b56899e2f7e1',
  symbol: 'RSC',
  decimals: 18,
  image: '/RSC.webp',
  chainId: 8453,
};

const USDC: Token = {
  name: 'USD Coin',
  address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  symbol: 'USDC',
  decimals: 6,
  image: '/USDC.webp',
  chainId: 8453,
};

type TabKey = 'connectWallet' | 'buyCrypto' | 'buyRSC' | 'depositRSC';

const depositABI = [
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

const depositCalls = [
  {
    address: RSC.address,
    abi: depositABI,
    functionName: 'transfer',
    args: ['0x0a581a77ef96cc04bad090ddf4a17a5aa9fae45f', '1000000000000000000'],
  },
];

export function BuyRSCSection() {
  const [activeTab, setActiveTab] = useState<TabKey>('connectWallet');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  return (
    <div className="rounded-md shadow-sm">
      {/* Tab Navigation */}
      <div className="flex justify-center">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('connectWallet')}
            className={`whitespace-nowrap py-4 px-1 font-medium text-sm ${
              activeTab === 'connectWallet'
                ? 'text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            1. Connect Wallet
          </button>
          <button
            onClick={() => setActiveTab('buyCrypto')}
            className={`whitespace-nowrap py-4 px-1 font-medium text-sm ${
              activeTab === 'buyCrypto' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            2. Buy Crypto
          </button>
          <button
            onClick={() => setActiveTab('buyRSC')}
            className={`whitespace-nowrap py-4 px-1 font-medium text-sm ${
              activeTab === 'buyRSC' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            3. Buy RSC
          </button>
          <button
            onClick={() => setActiveTab('depositRSC')}
            className={`whitespace-nowrap py-4 px-1 font-medium text-sm ${
              activeTab === 'depositRSC' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            4. Deposit RSC
          </button>
        </nav>
      </div>
      <div>
        {activeTab === 'connectWallet' && (
          <div className="flex flex-col items-center justify-center space-y-4 px-10 py-10">
            <WalletDefault />
          </div>
        )}
        {activeTab === 'buyCrypto' && (
          <div className="flex flex-col items-center justify-center space-y-4 px-10 py-10">
            <FundCard assetSymbol="USDC" country="US" currency="USD" />
          </div>
        )}
        {activeTab === 'buyRSC' && (
          <div className="flex flex-col items-center justify-center space-y-4 px-10 py-10">
            <Swap isSponsored={true} title="">
              <SwapAmountInput label="Pay" swappableTokens={[USDC]} token={USDC} type="from" />
              <SwapAmountInput label="Receive" swappableTokens={[RSC]} token={RSC} type="to" />
              <SwapButton />
              <SwapMessage />
              <SwapToast />
            </Swap>
          </div>
        )}
        {activeTab === 'depositRSC' && (
          <div className="flex flex-col items-center justify-center space-y-4 px-10 py-10">
            <Button
              onClick={() => setIsDepositModalOpen(true)}
              variant="default"
              size="lg"
              className="gap-2"
            >
              <ArrowDownToLine className="h-5 w-5" />
              Deposit
            </Button>
          </div>
        )}
      </div>
      {isDepositModalOpen && (
        <DepositModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          currentBalance={0}
        />
      )}
    </div>
  );
}
