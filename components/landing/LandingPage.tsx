'use client';

import { LandingPageLayout } from './LandingPageLayout';
import { LandingPageHero } from './LandingPageHero';
import { StatsSection } from './StatsSection';
import { FeaturesSection } from './FeaturesSection';
import { InstitutionsSection } from './InstitutionsSection';

export function LandingPage() {
  return (
    <LandingPageLayout>
      <LandingPageHero />
      <StatsSection />
      <FeaturesSection />
      <InstitutionsSection />
      {/* Additional sections will be added here */}
    </LandingPageLayout>
  );
}
