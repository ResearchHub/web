'use client';

import { LandingPageLayout } from './LandingPageLayout';
import { LandingPageHero } from './LandingPageHero';
import { StatsSection } from './StatsSection';

export function LandingPage() {
  return (
    <LandingPageLayout>
      <LandingPageHero />
      <StatsSection />
      {/* Additional sections will be added here */}
    </LandingPageLayout>
  );
}
