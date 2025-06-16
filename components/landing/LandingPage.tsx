'use client';

import { LandingPageLayout } from './LandingPageLayout';
import { LandingPageHero } from './LandingPageHero';
import { StatsSection } from './StatsSection';
import { FeaturesSection } from './FeaturesSection';
import { InstitutionsSection } from './InstitutionsSection';
import { ResearchCoinSection } from './ResearchCoinSection';
import { RSCPriceSection } from './RSCPriceSection';
import { FAQSection } from './FAQSection';
import { LandingPageFooter } from './LandingPageFooter';
import { useUser } from '@/contexts/UserContext';
import { handleTradingRedirect } from '@/utils/navigation';

export function LandingPage() {
  const { user } = useUser();

  // If user is logged in, redirect to trending page. There is a server side redirect in the app/page.tsx file, but this is a client side redirect to avoid the flash of content.
  handleTradingRedirect(!!user);

  return (
    <LandingPageLayout>
      <LandingPageHero />
      <StatsSection />
      <FeaturesSection />
      <InstitutionsSection />
      <ResearchCoinSection />
      <RSCPriceSection />
      <FAQSection />
      <LandingPageFooter />
      {/* Additional sections will be added here */}
    </LandingPageLayout>
  );
}
