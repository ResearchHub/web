'use client';

import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { UserService } from '@/services/user.service';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Component that checks if the user should be redirected to the onboarding page.
 * This component should be placed in layouts or pages where you want to enforce onboarding.
 */
export function OnboardingRedirect() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check once the user data is loaded
    if (isLoading) return;

    // If the user should be redirected to onboarding and they're not already on the onboarding page
    if (UserService.shouldRedirectToOnboarding(user) && pathname !== '/onboarding') {
      // Redirect to onboarding page
      router.push('/onboarding');
    }
  }, [user, isLoading, router, pathname]);

  // This component doesn't render anything, it just performs the redirect
  return null;
}
