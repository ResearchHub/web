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

export function LandingPage() {
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
