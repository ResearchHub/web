'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Confetti from 'react-confetti';
import { AlertCircle, Loader2, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/contexts/UserContext';
import { NoteService } from '@/services/note.service';
import { PageLayout } from '@/app/layouts/PageLayout';

function AcceptJournalEntryCard({
  error,
  notebookPath,
  isAccepting = false,
  onRetry,
  onOpenNotebook,
}: {
  error?: string | null;
  notebookPath?: string | null;
  isAccepting?: boolean;
  onRetry?: () => void;
  onOpenNotebook?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardDimensions, setCardDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!notebookPath || !cardRef.current) return;

    const updateDimensions = () => {
      if (!cardRef.current) return;
      setCardDimensions({
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [notebookPath]);

  return (
    <div className="flex min-h-[calc(100vh-9rem)] w-full items-center justify-center">
      <div
        ref={cardRef}
        className="relative flex w-full max-w-md flex-col items-center overflow-hidden rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm"
      >
        {notebookPath && cardDimensions.width > 0 && (
          <Confetti
            width={cardDimensions.width}
            height={cardDimensions.height}
            gravity={0.2}
            recycle={false}
            numberOfPieces={120}
            colors={['#f97316', '#3971ff']}
          />
        )}

        {error ? (
          <>
            <AlertCircle className="mb-4 h-10 w-10 text-red-500" aria-hidden="true" />
            <h1 className="text-xl font-semibold text-gray-900">Unable to create draft</h1>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <Button className="mt-6 w-full" onClick={onRetry} disabled={isAccepting}>
              Try again
            </Button>
          </>
        ) : notebookPath ? (
          <>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <PartyPopper className="h-9 w-9 text-primary-500" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Registered Report draft created</h1>
            <p className="mt-2 px-4 text-base text-gray-500">
              Your funded proposal is now ready as a private notebook draft. You can edit it before
              publishing the Registered Report.
            </p>
            <Button className="mt-6 w-full" onClick={onOpenNotebook}>
              Open notebook draft
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
        )}
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
  const [notebookPath, setNotebookPath] = useState<string | null>(null);

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
    setNotebookPath(null);

    try {
      const note = await NoteService.acceptJournalEntry({
        userId,
        fundraiseId,
      });

      if (!note.organization?.slug || !note.id) {
        throw new Error('The draft was created, but the notebook location was missing.');
      }

      setNotebookPath(`/notebook/${note.organization.slug}/${note.id}`);
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

  const openNotebook = useCallback(() => {
    if (!notebookPath) return;
    router.push(notebookPath);
  }, [notebookPath, router]);

  return (
    <AcceptJournalEntryCard
      error={error}
      notebookPath={notebookPath}
      isAccepting={isAccepting}
      onRetry={acceptJournalEntry}
      onOpenNotebook={openNotebook}
    />
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
