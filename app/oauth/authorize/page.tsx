'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useOAuthConsent } from '@/hooks/useOAuthConsent';

function OAuthConsent() {
  const searchParams = useSearchParams();
  const { request, error, isSubmitting, decide } = useOAuthConsent(searchParams.toString());

  if (error) {
    return (
      <>
        <h1 className="text-xl font-bold text-gray-900 text-center">Can’t connect this app</h1>
        <p className="mt-3 text-sm text-gray-600 text-center">{error}</p>
      </>
    );
  }

  if (!request) {
    return <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />;
  }

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 text-center">
        {request.clientName} wants to access your ResearchHub account
      </h1>
      <p className="mt-6 text-sm text-gray-700">This will allow it to:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-900">
        {request.scopes.map((scope) => (
          <li key={scope.name}>{scope.description}</li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-gray-600">
        You’ll be sent back to{' '}
        <span className="font-medium text-gray-900">{request.redirectHost}</span>.
      </p>
      {request.loopbackRedirect && (
        <div className="mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            This app runs on your own computer. Only allow access if you just started connecting it
            to ResearchHub.
          </p>
        </div>
      )}
      <div className="mt-6 flex gap-3">
        <Button
          variant="outlined"
          className="flex-1"
          disabled={isSubmitting}
          onClick={() => decide(false)}
        >
          Deny
        </Button>
        <Button className="flex-1" disabled={isSubmitting} onClick={() => decide(true)}>
          Allow
        </Button>
      </div>
    </>
  );
}

export default function OAuthAuthorizePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white w-full max-w-md rounded-lg shadow-sm border border-gray-200 p-8">
        <Image
          src="/RSC.webp"
          alt="ResearchHub Logo"
          width={40}
          height={40}
          className="mx-auto mb-4"
        />
        <Suspense>
          <OAuthConsent />
        </Suspense>
      </div>
    </div>
  );
}
