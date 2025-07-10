'use client';

import { OnboardingWizard } from '@/components/Onboarding/OnboardingWizard';
import { ApolloProvider } from '@/components/providers/ApolloProvider';

export default function OnboardingPage() {
  return (
    <ApolloProvider>
      <OnboardingWizard />
    </ApolloProvider>
  );
}
