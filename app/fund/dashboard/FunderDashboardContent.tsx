'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FundsGiven } from '@/components/Funding/dashboard/FundsGiven';
import { useUser } from '@/contexts/UserContext';

export function FunderDashboardContent() {
  const router = useRouter();
  const { user, isLoading: isLoadingUser } = useUser();

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.replace('/');
    }
  }, [isLoadingUser, router, user]);

  if (isLoadingUser || !user) return null;

  const firstName = user.firstName?.trim();

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          {firstName ? `Welcome back, ${firstName}.` : 'Welcome back.'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Here&apos;s where your funding stands today.</p>
      </div>
      <FundsGiven userId={user.id} isModerator={!!user.isModerator} />
    </>
  );
}
