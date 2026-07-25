'use client';

import { useCallback, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check, Loader2, LockKeyhole } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { PageLayout } from '@/app/layouts/PageLayout';
import { Button } from '@/components/ui/Button';
import { BlockEditorClientWrapper } from '@/components/Editor/components/BlockEditor/components/BlockEditorClientWrapper';
import { NotePaperWrapper } from '@/components/Notebook/NotePaperWrapper';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useAcceptNoteInvite, useNoteInvite } from '@/hooks/useNote';

export default function JoinNotePage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [{ invite, isLoading: isFetching, error }, fetchInvite] = useNoteInvite();
  const [{ isLoading: isAccepting }, acceptNoteInvite] = useAcceptNoteInvite();
  const [isPending, startTransition] = useTransition();

  const inviteKey = params?.inviteKey as string;
  const note = invite?.note;

  useEffect(() => {
    if (!inviteKey) return;

    fetchInvite(inviteKey).catch(() => {
      console.log('Failed to fetch invited note. The invitation may be invalid or expired.');
    });
  }, [fetchInvite, inviteKey]);

  const openEditableNote = useCallback(() => {
    if (!note?.organization?.slug || !note?.id) return;

    startTransition(() => {
      router.push(`/notebook/${note.organization.slug}/${note.id}`);
    });
  }, [note?.id, note?.organization?.slug, router]);

  const handleAcceptInvite = useCallback(async () => {
    if (!inviteKey || !note) return;

    try {
      await acceptNoteInvite(inviteKey);
      toast.success('Note invite accepted');
      openEditableNote();
    } catch (error) {
      toast.error(
        'Unable to accept this invite. Make sure you are signed in with the invited email.'
      );
    }
  }, [acceptNoteInvite, inviteKey, note, openEditableNote]);

  const handleAuthThenAccept = () => {
    executeAuthenticatedAction(handleAcceptInvite);
  };

  if (status === 'loading' || isFetching) {
    return (
      <PageLayout rightSidebar={false} wideContent>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
          <p className="mt-4 text-sm text-gray-600">Loading note invitation...</p>
        </div>
      </PageLayout>
    );
  }

  if (error || !note) {
    return (
      <PageLayout rightSidebar={false}>
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 rounded-full bg-red-50 p-4">
            <LockKeyhole className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">Invalid Invitation</h1>
          <p className="mb-6 text-gray-600">
            This invitation link is invalid or has expired. Please ask for a new note invitation.
          </p>
          <Button onClick={() => router.push('/')}>Return to Home</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageLayout rightSidebar={false} wideContent>
        <div className="mx-auto w-full max-w-4xl px-2 pb-10 pt-4 sm:px-4">
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-sm font-medium text-primary-600">
                Invitation to claim proposal
              </p>
              <h1 className="truncate text-xl font-semibold text-gray-900">{note.title}</h1>
              <p className="mt-1 text-sm text-gray-600">
                Accept the invite to claim and edit this proposal
              </p>
            </div>

            {status === 'authenticated' ? (
              <Button
                onClick={handleAcceptInvite}
                disabled={isAccepting || isPending}
                className="w-full shrink-0 whitespace-nowrap gap-2 sm:w-auto"
              >
                {isAccepting || isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Accept Invite
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleAuthThenAccept}
                className="w-full shrink-0 whitespace-nowrap gap-2 sm:w-auto"
              >
                <Check className="h-4 w-4" />
                Sign in or Create Account
              </Button>
            )}
          </div>

          <NotePaperWrapper canvas={false} className="min-h-[70vh] p-6 pl-6 lg:!p-12">
            <BlockEditorClientWrapper
              content={note.content || ''}
              contentJson={note.contentJson}
              editable={false}
            />
          </NotePaperWrapper>
        </div>
      </PageLayout>
    </div>
  );
}
