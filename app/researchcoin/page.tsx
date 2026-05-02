'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { PageLayout } from '../layouts/PageLayout';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';
import { WalletOverview } from '@/components/ResearchCoin/WalletOverview';
import { StakingOverview } from '@/components/ResearchCoin/StakingOverview';
import { TransactionFeed } from '@/components/ResearchCoin/TransactionFeed';
import { PendingDepositFeed } from '@/components/ResearchCoin/PendingDepositFeed';
import { ExportFilterModal } from '@/components/modals/ResearchCoin/ExportFilterModal';
import { useSession } from 'next-auth/react';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { usePendingDeposits } from '@/hooks/usePendingDeposits';
import { useUser } from '@/contexts/UserContext';
import { useVerification } from '@/contexts/VerificationContext';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { CalloutBanner } from '@/components/banners/CalloutBanner';
import { AuthService } from '@/services/auth.service';
import './researchcoin-wallet.css';

export default function ResearchCoinPage() {
  const { status } = useSession();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { exchangeRate } = useExchangeRate();
  const { showUSD } = useCurrencyPreference();
  const { user, refreshUser } = useUser();
  const { openVerificationModal } = useVerification();
  const router = useRouter();
  const [isMfaEnabled, setIsMfaEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    let cancelled = false;
    AuthService.getMfaStatus()
      .then((s) => {
        if (!cancelled) setIsMfaEnabled(!!s?.mfa_enabled);
      })
      .catch(() => {
        if (!cancelled) setIsMfaEnabled(null);
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  const transactionFeedRef = useRef<{ refresh: () => Promise<void> }>(null);
  const refreshTransactions = () => {
    transactionFeedRef.current?.refresh();
  };

  usePendingDeposits({
    onDepositResolved: () => {
      refreshUser({ silent: true });
      refreshTransactions();
    },
  });

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  return (
    <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
      <div className="w-full">
        <div className="">
          <div className="">
            <h1 className="sr-only">My Wallet</h1>
          </div>
          <div className="flex">
            <div className="flex-1">
              {/* Banners — show MFA banner if user has funds and no MFA;
                  otherwise fall back to verification banner. Never both. */}
              {(() => {
                if (status !== 'authenticated' || !user) return null;
                const hasFunds = (user.balance ?? 0) + (user.lockedBalance ?? 0) > 0;
                if (hasFunds && isMfaEnabled === false) {
                  return (
                    <CalloutBanner
                      tone="amber"
                      icon={<ShieldCheck className="h-5 w-5" />}
                      title="Secure your account with two-factor authentication"
                      description="Protect your funds and account access now"
                      ctaLabel="Enable 2FA"
                      onCtaClick={() => router.push('/settings')}
                    />
                  );
                }
                if (!user.isVerified) {
                  return (
                    <CalloutBanner
                      tone="blue"
                      icon={<VerifiedBadge size="lg" />}
                      title="Verify your profile for enhanced benefits"
                      description="Unlock faster withdrawals, exclusive features, and peer review opportunities"
                      ctaLabel="Verify Now"
                      onCtaClick={() => openVerificationModal()}
                    />
                  );
                }
                return null;
              })()}

              {status === 'authenticated' && (
                <>
                  <WalletOverview onTransactionSuccess={refreshTransactions} />
                  <StakingOverview />
                </>
              )}

              {status === 'authenticated' && <PendingDepositFeed />}

              <TransactionFeed
                ref={transactionFeedRef}
                onExport={handleExport}
                exchangeRate={exchangeRate}
                showUSD={showUSD}
                isExporting={isExporting}
              />

              {isExportModalOpen && (
                <ExportFilterModal
                  isOpen={isExportModalOpen}
                  onClose={() => setIsExportModalOpen(false)}
                  onExportStateChange={setIsExporting}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
