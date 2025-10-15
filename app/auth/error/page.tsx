'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams?.get('error');
    let callbackUrl = searchParams?.get('callbackUrl');

    // Try to retrieve from sessionStorage if not in URL
    if (!callbackUrl || callbackUrl.trim() === '') {
      callbackUrl = sessionStorage.getItem('oauth_callback_url') || '/';
    }

    // Always clean up sessionStorage
    sessionStorage.removeItem('oauth_callback_url');

    // Build signin URL with error and callbackUrl
    const params = new URLSearchParams();
    if (error) params.set('error', error);
    params.set('callbackUrl', callbackUrl);

    router.replace(`/auth/signin?${params}`);
  }, [searchParams, router]);

  return null;
}

export default function ErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  );
}
