import { getReferralMetadata } from '@/lib/metadata-helpers';
import { ReferralReadyGate } from './components/ReferralReadyGate';
import { ReferralTopBar } from './components/ReferralTopBar';
import { ReferralHero } from './components/ReferralHero';
import { ReferralShareCard } from './components/ReferralShareCard';
import { ReferralHowItWorks } from './components/ReferralHowItWorks';
import { ReferralImpact } from './components/ReferralImpact';
import { ReferralNetworkList } from './components/ReferralNetworkList';
import { ReferralCalculator } from './components/ReferralCalculator';
import { ReferralFAQ } from './components/ReferralFAQ';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

export const metadata = getReferralMetadata({
  url: '/referral',
  isJoinPage: false,
});

const ReferralPage = () => {
  return (
    <ReferralReadyGate>
      <ReferralTopBar />
      <ReferralHero />
      <ReferralShareCard />
      <ReferralHowItWorks />
      <ReferralImpact />
      <ReferralNetworkList />
      <ReferralCalculator />
      <ReferralFAQ />
      <LandingPageFooter />
    </ReferralReadyGate>
  );
};

export default ReferralPage;
