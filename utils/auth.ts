import { signOut } from 'next-auth/react';
import AnalyticsService from '@/services/analytics.service';

export async function signOutUser(callbackUrl = '/'): Promise<void> {
  AnalyticsService.clearUserSession();
  await signOut({ callbackUrl });
}
