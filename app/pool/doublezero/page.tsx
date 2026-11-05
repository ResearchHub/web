import { PoolReadyGate } from '../components/PoolReadyGate';
import { PoolFundProvider } from '../components/PoolFundProvider';
import { getPoolProposals } from '../lib/proposals';
import { DOUBLEZERO_CAMPAIGN } from './campaign';
import { DoubleZeroTopBar } from './components/DoubleZeroTopBar';
import { DoubleZeroHero } from './components/DoubleZeroHero';
import { DoubleZeroProof } from './components/DoubleZeroProof';
import { DoubleZeroTracks } from './components/DoubleZeroTracks';
import { DoubleZeroProposals } from './components/DoubleZeroProposals';
import { DoubleZeroClosing } from './components/DoubleZeroClosing';
import { ContributionAmplifySection } from '@/components/landing/ContributionAmplifySection';
import { FundingFAQSection } from '@/components/landing/FundingFAQSection';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

export default async function DoubleZeroPage() {
  // Fetched here rather than inside the proposals section so the cards and the
  // funding modal share one pool: a contribution can only land on a proposal
  // the visitor was shown.
  const proposals = await getPoolProposals(DOUBLEZERO_CAMPAIGN);

  return (
    <PoolReadyGate>
      <PoolFundProvider campaign={DOUBLEZERO_CAMPAIGN} proposals={proposals}>
        <DoubleZeroTopBar />
        <DoubleZeroHero />
        <DoubleZeroProof />
        <DoubleZeroTracks />
        <DoubleZeroProposals proposals={proposals} />
        <ContributionAmplifySection />
        <DoubleZeroClosing />
        <FundingFAQSection />
        <LandingPageFooter />
      </PoolFundProvider>
    </PoolReadyGate>
  );
}
