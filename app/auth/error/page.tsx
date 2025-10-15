'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams?.get('error');
    const urlCallback = searchParams?.get('callbackUrl');

    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const storedCallback = getCookie('oauth_callback');
    if (storedCallback) document.cookie = 'oauth_callback=; path=/; max-age=0';

    const callbackUrl = urlCallback?.trim() || storedCallback || '/';
    const params = new URLSearchParams({ callbackUrl });
    if (error) params.set('error', error);

    router.replace(`/auth/signin?${params}`);
  }, [searchParams, router]);

  return null;
}

export default function ErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
