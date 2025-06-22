'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ModeratorsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to audit page by default
    router.replace('/moderators/audit');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading moderation dashboard...</p>
      </div>
    </div>
  );
}
