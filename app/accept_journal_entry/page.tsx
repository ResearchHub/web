'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/contexts/UserContext';
import { NoteService } from '@/services/note.service';
import { PageLayout } from '@/app/layouts/PageLayout';

interface AcceptJournalEntryCardProps {
  error?: string | null;
  isAccepting?: boolean;
  onRetry?: () => void;
}

function AcceptJournalEntryCard({
  error,
  isAccepting = false,
  onRetry,
}: Readonly<AcceptJournalEntryCardProps>) {
  const cardContent = error ? (
    <>
      <AlertCircle className="mb-4 h-10 w-10 text-red-500" aria-hidden="true" />
      <h1 className="text-xl font-semibold text-gray-900">Unable to create draft</h1>
      <p className="mt-2 text-sm text-gray-600">{error}</p>
      <Button className="mt-6 w-full" onClick={onRetry} disabled={isAccepting}>
        Try again
      </Button>
    </>
  ) : (
    <>
      <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary-500" aria-hidden="true" />
      <h1 className="text-xl font-semibold text-gray-900">Creating draft</h1>
      <p className="mt-2 text-sm text-gray-600">
        Your Registered Report draft will be ready shortly.
      </p>
    </>
  );

  return (
    <div className="flex min-h-[calc(100vh-9rem)] w-full items-center justify-center">
      <div className="relative flex w-full max-w-md flex-col items-center overflow-hidden rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        {cardContent}
      </div>
    </div>
  );
}

function AcceptJournalEntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useUser();
  const hasStartedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const userId = searchParams.get('user_id');
  const fundraiseId = searchParams.get('fundraise_id');

  const acceptJournalEntry = useCallback(async () => {
    if (!userId || !fundraiseId) {
      setError('This journal entry link is missing required information.');
      return;
    }

    if (!user) return;

    if (user.id.toString() !== userId) {
      setError('This journal entry link belongs to a different account.');
      return;
    }

    setIsAccepting(true);
    setError(null);

    try {
      const note = await NoteService.acceptJournalEntry({
        userId,
        fundraiseId,
      });

      if (!note.organization?.slug || !note.id) {
        throw new Error('The draft was created, but the notebook location was missing.');
      }

      router.replace(`/notebook/${note.organization.slug}/${note.id}?journalEntryAccepted=true`);
    } catch (err) {
      hasStartedRef.current = false;
      setError(err instanceof Error ? err.message : 'Unable to accept this journal entry.');
    } finally {
      setIsAccepting(false);
    }
  }, [fundraiseId, router, user, userId]);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      const callbackUrl = `/accept_journal_entry?${searchParams.toString()}`;
      router.replace(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    acceptJournalEntry();
  }, [acceptJournalEntry, isLoading, router, searchParams, user]);

  return (
    <AcceptJournalEntryCard error={error} isAccepting={isAccepting} onRetry={acceptJournalEntry} />
  );
}

export default function AcceptJournalEntryPage() {
  return (
    <PageLayout rightSidebar={false} wideContent>
      <Suspense fallback={<AcceptJournalEntryCard />}>
        <AcceptJournalEntryContent />
      </Suspense>
    </PageLayout>
  );
}
