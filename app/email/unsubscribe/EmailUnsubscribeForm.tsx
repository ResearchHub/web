'use client';

import Link from 'next/link';
import { CircleCheck, LoaderCircle, MailX, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { EmailSubscriptionService } from '@/services/emailSubscription.service';

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

interface EmailUnsubscribeFormProps {
  code: string;
}

export function EmailUnsubscribeForm({ code }: Readonly<EmailUnsubscribeFormProps>) {
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const hasCode = code.length > 0;

  const handleUnsubscribe = async () => {
    if (!hasCode || submissionState === 'submitting') {
      return;
    }

    setSubmissionState('submitting');
    setErrorMessage('');

    try {
      await EmailSubscriptionService.unsubscribe(code);
      setSubmissionState('success');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to unsubscribe right now. Please try again.'
      );
      setSubmissionState('error');
    }
  };

  const isSuccess = submissionState === 'success';
  const isSubmitting = submissionState === 'submitting';

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-primary-50 to-transparent"
        aria-hidden="true"
      />

      <section className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-xl shadow-gray-200/50 sm:px-10 sm:py-10">
        <Link
          href="/"
          referrerPolicy="no-referrer"
          className="mx-auto mb-8 block w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-4"
          aria-label="ResearchHub home"
        >
          <Logo size={32} />
        </Link>

        <div className="text-center" aria-live="polite">
          <div
            className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${
              isSuccess ? 'bg-green-50 text-green-600' : 'bg-primary-50 text-primary-600'
            }`}
          >
            {isSuccess ? (
              <CircleCheck className="h-7 w-7" aria-hidden="true" />
            ) : (
              <MailX className="h-7 w-7" aria-hidden="true" />
            )}
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {isSuccess ? "You're unsubscribed" : 'Unsubscribe from ResearchHub emails?'}
          </h1>

          {isSuccess && (
            <p className="mt-3 text-sm leading-6 text-gray-600">
              You won't receive notification emails from ResearchHub.
            </p>
          )}

          {!hasCode && (
            <div
              className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900"
              role="alert"
            >
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p>This unsubscribe link is incomplete. Please use the link from your email.</p>
            </div>
          )}

          {submissionState === 'error' && (
            <div
              className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-left text-sm text-red-800"
              role="alert"
            >
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p>{errorMessage}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            {!isSuccess && (
              <Button
                type="button"
                size="lg"
                className="w-full"
                disabled={!hasCode || isSubmitting}
                onClick={handleUnsubscribe}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                    Unsubscribing…
                  </>
                ) : (
                  'Unsubscribe'
                )}
              </Button>
            )}

            <Link
              href="/"
              referrerPolicy="no-referrer"
              className="inline-flex h-12 items-center justify-center rounded-lg px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              {isSuccess ? 'Return to ResearchHub' : 'Keep me subscribed'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
