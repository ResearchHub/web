'use client';

import { ReferralHeader } from './ReferralHeader';
import { ReferralLinkCard } from './ReferralLinkCard';
import { HowItWorksSection } from './HowItWorksSection';
import { ReferralImpactSection } from './ReferralImpactSection';
import { ReferredUsersList } from './ReferredUsersList';
import { ReferralCalculator } from '.';

export function ReferralDashboard() {
  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <ReferralHeader />

        <ReferralLinkCard />

        <HowItWorksSection />

        <ReferralImpactSection />

        <ReferredUsersList />

        <ReferralCalculator />
      </main>
    </div>
  );
}
