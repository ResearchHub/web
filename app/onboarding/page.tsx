'use client';

import { OnboardingWizard } from '@/components/Onboarding/OnboardingWizard';
import { ApolloProvider } from '@/components/providers/ApolloProvider';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardingPage() {
  const { preferences } = usePreferences();
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) return;

    // If user already completed the new onboarding, redirect to feed
    if (preferences?.completedAt) {
      router.replace('/feed');
      return;
    }

    // If user is not logged in, redirect to home
    if (!user) {
      router.replace('/');
      return;
    }
  }, [preferences, user, isUserLoading, router]);

  // Show nothing while checking
  if (isUserLoading || preferences?.completedAt || !user) {
    return null;
  }

  return (
    <ApolloProvider>
      <OnboardingWizard />
    </ApolloProvider>
  );
}
