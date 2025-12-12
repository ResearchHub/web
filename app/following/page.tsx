'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Feed from '@/components/Feed/Feed';
import { FeedTab } from '@/hooks/useFeed';

export default function FollowingFeed() {
  const { status } = useSession();
  const router = useRouter();
  const defaultTab: FeedTab = 'following';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/auth/signin?callbackUrl=${encodeURIComponent('/following')}`);
    }
  }, [status, router]);

  // Show nothing while checking auth or redirecting
  if (status !== 'authenticated') {
    return null;
  }

  return <Feed defaultTab={defaultTab} />;
}
