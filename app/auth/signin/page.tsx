'use client';

import { useSearchParams } from 'next/navigation';
import AuthContent from '@/components/Auth/AuthContent';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Suspense } from 'react';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <Image
          src="/images/logo.png"
          alt="ResearchHub Logo"
          width={48}
          height={48}
          className="mx-auto mb-4"
        />
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome to ResearchHub</h2>
        <p className="mt-2 text-sm text-gray-600">
          Join the community of researchers and academics
        </p>
      </div>

      <div className="bg-white w-full max-w-md rounded-lg shadow-sm border border-gray-200 p-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <AuthContent initialError={error} onSuccess={() => router.push('/')} showHeader={false} />
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
