'use client';

import { ArrowDownToLine } from 'lucide-react';
import { useCallback, useState } from 'react';
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
import { cn } from '@/utils/styles';

// Hard-coded token info here for now
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

/**
 * A component that guides users through the process of buying and depositing RSC
 */
export const BuyRSCSection = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('connectWallet');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // Use callbacks for event handlers
  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
  }, []);

  const handleOpenDepositModal = useCallback(() => {
    setIsDepositModalOpen(true);
  }, []);

  const handleCloseDepositModal = useCallback(() => {
    setIsDepositModalOpen(false);
  }, []);

  // Render a tab button with appropriate styling
  const renderTabButton = (tab: TabKey, label: string) => (
    <button
      onClick={() => handleTabChange(tab)}
      className={cn(
        'whitespace-nowrap py-4 px-1 font-medium text-sm',
        activeTab === tab
          ? 'text-primary-600 border-b-2 border-primary-600'
          : 'text-gray-500 hover:text-gray-700'
      )}
      aria-selected={activeTab === tab}
      role="tab"
    >
      {label}
    </button>
  );

  // Render tab content with consistent wrapper
  const renderTabContent = (content: React.ReactNode) => (
    <div className="flex flex-col items-center justify-center space-y-4 px-10 py-10">{content}</div>
  );

  return (
    <div className="rounded-md shadow-sm">
      {/* Tab Navigation */}
      <div className="flex justify-center">
        <nav className="flex space-x-8" role="tablist" aria-label="Buy RSC steps">
          {renderTabButton('connectWallet', '1. Connect Wallet')}
          {renderTabButton('buyCrypto', '2. Buy Crypto')}
          {renderTabButton('buyRSC', '3. Buy RSC')}
          {renderTabButton('depositRSC', '4. Deposit RSC')}
        </nav>
      </div>

      <div role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'connectWallet' && renderTabContent(<WalletDefault />)}

        {activeTab === 'buyCrypto' &&
          renderTabContent(<FundCard assetSymbol="USDC" country="US" currency="USD" />)}

        {activeTab === 'buyRSC' &&
          renderTabContent(
            <Swap isSponsored={true} title="">
              <SwapAmountInput label="Pay" swappableTokens={[USDC]} token={USDC} type="from" />
              <SwapAmountInput label="Receive" swappableTokens={[RSC]} token={RSC} type="to" />
              <SwapButton />
              <SwapMessage />
              <SwapToast />
            </Swap>
          )}

        {activeTab === 'depositRSC' &&
          renderTabContent(
            <Button onClick={handleOpenDepositModal} variant="default" size="lg" className="gap-2">
              <ArrowDownToLine className="h-5 w-5" />
              Deposit
            </Button>
          )}
      </div>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={handleCloseDepositModal}
        currentBalance={0}
      />
    </div>
  );
};
