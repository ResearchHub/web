'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams?.get('error');
    const callbackUrl = searchParams?.get('callbackUrl') || '/';

    const params = new URLSearchParams({ callbackUrl });
    if (error) params.set('error', error);

    router.replace(`/auth/signin?${params}`);
  }, [searchParams, router]);

  return null;
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
