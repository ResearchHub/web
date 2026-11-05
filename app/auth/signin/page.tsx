'use client';

import { useSearchParams } from 'next/navigation';
import AuthContent from '@/components/Auth/AuthContent';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const authError = searchParams?.get('error');
  const error =
    authError === 'OAuthCallback'
      ? 'Unable to sign in. Please try again. For X, confirm your email address and allow email access.'
      : authError;
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const isFailedXConnect =
    status === 'authenticated' && !!authError && callbackUrl.includes('x_connected=true');

  const getSafeCallbackUrl = () => {
    const url = new URL(callbackUrl, window.location.origin);
    url.searchParams.delete('x_connected');
    return url.origin === window.location.origin ? url.href : '/';
  };

  useEffect(() => {
    if (isFailedXConnect) {
      toast.error('Unable to connect X. It may already be linked to a different account.');
      router.replace(getSafeCallbackUrl());
    }
  }, [isFailedXConnect]);

  if ((authError && status === 'loading') || isFailedXConnect) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 max-w-md">
        <Image
          src="/RSC.webp"
          alt="ResearchHub Logo"
          width={48}
          height={48}
          className="mx-auto mb-4"
        />
        <h2 className="text-xl font-bold tracking-tight text-gray-900">
          Welcome to ResearchHub{' '}
          <span role="img" aria-label="wave">
            👋
          </span>
        </h2>
        <p className="mt-2 text-lg text-gray-700">
          We are an open-science platform that enables discussions, peer-reviews, publications and
          more.
        </p>
      </div>

      <div className="bg-white w-full max-w-md rounded-lg shadow-sm border border-gray-200 p-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <AuthContent
          initialError={error}
          onSuccess={() => router.push(getSafeCallbackUrl())}
          showHeader={false}
        />
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          By signing in, you agree to our{' '}
          <a href="/terms" className="font-medium text-primary-600 hover:text-primary-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="font-medium text-primary-600 hover:text-primary-500">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
