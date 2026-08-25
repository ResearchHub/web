import { PoolReadyGate } from '../components/PoolReadyGate';
import { PoolFundProvider } from '../components/PoolFundProvider';
import { getPoolProposals } from '../lib/proposals';
import { SUBSTATION_CAMPAIGN } from './campaign';
import { SubstationTopBar } from './components/SubstationTopBar';
import { SubstationHero } from './components/SubstationHero';
import { SubstationDebate } from './components/SubstationDebate';
import { SubstationExperimentsList } from './components/SubstationExperimentsList';
import { SubstationMemes } from './components/SubstationMemes';
import { ContributionAmplifySection } from '@/components/landing/ContributionAmplifySection';
import { FundingFAQSection } from '@/components/landing/FundingFAQSection';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

export default async function SubstationPage() {
  // Fetched here rather than inside the experiments section so the carousel and
  // the funding modal share one pool: a contribution can only land on a
  // proposal the visitor was shown.
  const proposals = await getPoolProposals(SUBSTATION_CAMPAIGN);

  return (
    <PoolReadyGate>
      <PoolFundProvider campaign={SUBSTATION_CAMPAIGN} proposals={proposals}>
        <SubstationTopBar />
        <SubstationHero />
        <SubstationDebate />
        <SubstationExperimentsList proposals={proposals} />
        <ContributionAmplifySection />
        <SubstationMemes />
        <FundingFAQSection />
        <LandingPageFooter />
      </PoolFundProvider>
    </PoolReadyGate>
  );
}
