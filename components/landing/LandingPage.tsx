'use client';

import { LandingPageLayout } from './LandingPageLayout';
import { LandingPageHero } from './LandingPageHero';
import { StatsSection } from './StatsSection';
import { FeaturesSection } from './FeaturesSection';

export function LandingPage() {
  return (
    <LandingPageLayout>
      <LandingPageHero />
      <StatsSection />
      <FeaturesSection />
      {/* Additional sections will be added here */}
    </LandingPageLayout>
  );
}
