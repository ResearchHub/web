'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';

import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { NotePaperWrapper } from './NotePaperWrapper';
import { NotePaperSkeleton } from './NotePaperSkeleton';
import { NotebookHome } from './NotebookHome';
import { NotebookTour } from './NotebookTour';
import { NotebookTabs, type NotebookTab } from './NotebookTabs';
import { NotesMenu } from './NotesMenu';
import { PublishedStatusSection } from './PublishingForm/components/PublishedStatusSection';
import { PublishingForm } from '@/components/Notebook/PublishingForm';

import { AgentChatPanel, type NoteReviewHandle } from './AgentChat/AgentChatPanel';
import { noteDiffPersistableDoc } from './NoteReview/noteDiffOverlay';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useUser } from '@/contexts/UserContext';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useUpdateNote } from '@/hooks/useNote';
import { useTopBarSlot } from '@/contexts/TopBarSlotContext';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { FeatureFlag, isFeatureEnabled } from '@/utils/featureFlags';
import { LegacyNoteBanner } from '@/components/LegacyNoteBanner';
import {
  isChangelogNote,
  isPublishedRegisteredReportNote,
  isRegisteredReportNote,
} from '@/types/note';

// Persisted (per-user) flag so the guided tour auto-runs only once — the very
// first time someone lands in the editor on a freshly-created note.
const NOTEBOOK_TOUR_FEATURE = 'notebook_tour';

// Query params the note-creation flows append when redirecting to the editor.
// Their presence means the user just created this note (vs. opening an existing
// one), which is the only moment we want to auto-launch the tour.
const NEW_NOTE_PARAMS = ['newChangelog', 'newGrant', 'newFunding', 'template'];

// Friendly label for the note's work type, shown at the top-left of the doc.
function getWorkTypeLabel(
  documentType?: string | null,
  contentType?: string | null,
  isRegisteredReport?: boolean
): string | undefined {
  if (isRegisteredReport) {
    return 'Registered Report';
  }

  switch (documentType) {
    case 'GRANT':
      return 'Funding Opportunity';
    case 'PREREGISTRATION':
      return 'Proposal';
    case 'DISCUSSION':
      return 'Preprint';
  }
  if (contentType === 'funding_request') return 'Funding Opportunity';
  if (contentType === 'preregistration') return 'Proposal';
  if (contentType) return 'Preprint';
  return undefined;
}

export function NoteEditorLayout() {
  const {
    currentNote: note,
    isLoadingNote,
    noteError,
    setEditor,
    updateNoteTitle,
    activeNoteId,
    editor,
  } = useNotebookContext();

  const { selectedOrg } = useOrganizationContext();
  const { user, isLoading: isLoadingUser } = useUser();
  const { lgAndUp } = useScreenSize();
  const isDesktop = lgAndUp;

  const topBarSlot = useTopBarSlot();
  const setLeftSlot = topBarSlot?.setLeftSlot;
  const searchParams = useSearchParams();

  const {
    isDismissed: isTourDismissed,
    dismissFeature: dismissTour,
    dismissStatus: tourDismissStatus,
  } = useDismissableFeature(NOTEBOOK_TOUR_FEATURE);

  const [isLegacyNote, setIsLegacyNote] = useState<boolean | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<NotebookTab>(() =>
    searchParams?.get('tab') === 'details' ? 'details' : 'document'
  );

  // ---- AI assistant chat (gated to hub editors and moderators) ----
  const [isAgentChatOpen, setIsAgentChatOpen] = useState(false);
  // Flipped when the server denies access (the gate can change server-side);
  // hides the entry point while this note is open.
  const [agentChatUnavailable, setAgentChatUnavailable] = useState(false);
  // Active in-note review of an assistant version: the panel drives the
  // overlay, this layout renders the accept/restore controls over the note.
  const [agentReview, setAgentReview] = useState<NoteReviewHandle | null>(null);

  const handleAgentChatUnavailable = useCallback(() => {
    setAgentChatUnavailable(true);
    setIsAgentChatOpen(false);
  }, []);

  // The server's denial is note/hub-scoped and this layout survives note
  // navigation — re-arm the entry point on the next note so a denial in one
  // hub doesn't permanently hide the assistant in hubs the user does edit.
  useEffect(() => {
    setAgentChatUnavailable(false);
  }, [activeNoteId]);

  const isHubEditorOrModerator = Boolean(user?.moderator) || (user?.editorOfHubs?.length ?? 0) > 0;
  const showAgentChat =
    isHubEditorOrModerator &&
    !agentChatUnavailable &&
    Boolean(activeNoteId) &&
    Boolean(note) &&
    !noteError &&
    isLegacyNote === false;
  const previousNoteId = useRef(activeNoteId);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const tourAutoStarted = useRef(false);

  const isNewlyCreatedNote = NEW_NOTE_PARAMS.some((param) => searchParams?.has(param));

  useEffect(() => {
    if (previousNoteId.current !== activeNoteId) {
      setActiveTab('document');
      previousNoteId.current = activeNoteId;
    }
  }, [activeNoteId]);

  // Surface the "Notebook" notes dropdown in the shared TopBar's left area.
  useEffect(() => {
    if (!setLeftSlot) return;
    setLeftSlot(<NotesMenu />);
    return () => setLeftSlot(null);
  }, [setLeftSlot]);

  // Auto-start the tour exactly once, the first time a user opens a note they
  // just created. We wait until the note is fully set up (loaded + editor
  // mounted) so the highlight target already has its final size/position —
  // opening earlier anchors to the skeleton and the popover jumps when the real
  // content swaps in.
  const isNoteReady = !isLoadingNote && Boolean(note) && isLegacyNote === false && Boolean(editor);
  useEffect(() => {
    if (isDesktop !== true || tourAutoStarted.current) return;
    if (tourDismissStatus !== 'checked' || isTourDismissed) return;
    if (!isNewlyCreatedNote) return;
    if (!isNoteReady) return;
    tourAutoStarted.current = true;
    setIsTourOpen(true);
    dismissTour();
  }, [isDesktop, isNoteReady, tourDismissStatus, isTourDismissed, isNewlyCreatedNote, dismissTour]);

  useEffect(() => {
    if (isLoadingNote) return;
    if (!note || noteError) {
      setIsLegacyNote(false);
      return;
    }
    setIsLegacyNote(!note.contentJson && isFeatureEnabled(FeatureFlag.LegacyNoteBanner));
  }, [note, noteError, isLoadingNote]);

  const [, updateNote, saveNoteNow] = useUpdateNote(note?.id, {
    onTitleUpdate: updateNoteTitle,
    registeredReportProposalId: note?.proposalId,
    // While an assistant review is open the editor holds a merged document;
    // saves must persist it without the struck (pending-removal) ranges.
    docToPersist: (editorInstance) =>
      noteDiffPersistableDoc(editorInstance) ?? editorInstance.state.doc,
  });

  // The panel asks for the editor's current document to be persisted as the
  // newest server version: the user chose "Keep mine" over an assistant
  // version, or a reload applied an assistant version that newer saves had
  // buried. Applying content programmatically emits no editor update, so
  // without this save the editor and the server would silently diverge and
  // the choice would vanish on the next load. The save runs immediately (a
  // debounced one could be cancelled by navigation before it fires) and the
  // result tells the panel whether the choice actually became durable.
  const handlePersistEditorState = useCallback(async () => {
    if (!editor || editor.isDestroyed) return false;
    return saveNoteNow(editor);
  }, [editor, saveNoteNow]);

  const isChangelog = isChangelogNote(note);
  const isChangelogAccessDenied = isChangelog && !user?.isModerator;
  const showTabs = Boolean(note) && !isLegacyNote && !isChangelogAccessDenied;
  const isPublishedRegisteredReport = isPublishedRegisteredReportNote(note);
  const isEditorReadOnly =
    isPublishedRegisteredReport || (isLegacyNote && isFeatureEnabled(FeatureFlag.LegacyNoteBanner));
  const workTypeLabel = isChangelog
    ? 'ChangeLog'
    : getWorkTypeLabel(note?.documentType, note?.post?.contentType, isRegisteredReportNote(note));

  const renderEditor = () => {
    // No note is targeted (notebook home) — render the landing view directly so
    // the document skeleton doesn't flash before the empty state resolves.
    if (!activeNoteId) {
      return <NotebookHome />;
    }

    if ((isChangelog && isLoadingUser) || isLoadingNote || isLegacyNote === undefined) {
      return <NotePaperSkeleton />;
    }

    if ((noteError && activeNoteId) || isChangelogAccessDenied) {
      return (
        <NotePaperWrapper canvas={false}>
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="max-w-md text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Note Not Found</h2>
              <p className="text-gray-600">
                The note you&apos;re looking for doesn&apos;t exist or you don&apos;t have
                permission to view it.
              </p>
            </div>
          </div>
        </NotePaperWrapper>
      );
    }

    if (!note) {
      return <NotebookHome />;
    }

    return (
      <NotePaperWrapper
        canvas={false}
        className={cn(
          'p-0 lg:!p-8 lg:!pl-16',
          isLegacyNote && 'opacity-70 blur-sm pointer-events-none select-none'
        )}
        showBanner={
          isLegacyNote && selectedOrg ? (
            <LegacyNoteBanner orgSlug={selectedOrg.slug} noteId={note.id.toString()} />
          ) : undefined
        }
      >
        {/* Work type + draft status pinned to the document's top-left corner. */}
        <div className="mb-5 flex items-center gap-2 pt-2 lg:!pt-0 pl-4 lg:!pl-0 lg:-ml-12 lg:-mt-3">
          {workTypeLabel && (
            <span className="text-sm font-medium text-gray-700">{workTypeLabel}</span>
          )}
          <PublishedStatusSection />
        </div>
        <BlockEditor
          content={note.content}
          contentJson={note.contentJson}
          isLoading={false}
          onUpdate={isEditorReadOnly ? undefined : updateNote}
          editable={!isEditorReadOnly}
          setEditor={setEditor}
        />
      </NotePaperWrapper>
    );
  };

  if (isDesktop === null) return null;

  return (
    <div className="mx-auto w-full max-w-4xl">
      {showTabs && (
        <div className="mb-4">
          {isPublishedRegisteredReport && (
            <div className="mx-auto mb-2 w-fit rounded-md bg-yellow-100 px-3 py-1.5 text-sm font-medium text-yellow-700">
              This Registered Report has been published and can no longer be edited.
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <NotebookTabs active={activeTab} onChange={setActiveTab} />
            <div className="flex items-center gap-2">
              {activeTab === 'document' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setActiveTab('details')}
                  className="gap-1.5"
                >
                  {isPublishedRegisteredReport ? 'View details' : 'Add details'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={cn(showTabs && activeTab !== 'document' && 'hidden')}>{renderEditor()}</div>
      {showTabs && (
        <div className={cn(activeTab !== 'details' && 'hidden')}>
          <PublishingForm readOnly={isPublishedRegisteredReport} />
        </div>
      )}

      {/* Floating over the document, clear of the assistant panel when it's open. */}
      {agentReview && (!showTabs || activeTab === 'document') && (
        <div
          className={cn(
            'pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4',
            // Clear of the assistant panel while it's open, and of the button
            // that reopens it — which shares this corner — while it's closed.
            isAgentChatOpen ? 'bottom-6 sm:!right-[400px]' : 'bottom-24 lg:!bottom-6'
          )}
        >
          <div className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full border border-gray-200 bg-white/95 py-2 pl-4 pr-2 shadow-lg backdrop-blur">
            <p className="text-xs text-gray-700">
              <span className="font-medium">
                {agentReview.changeCount === 1
                  ? '1 assistant change'
                  : `${agentReview.changeCount} assistant changes`}
              </span>
              <span className="hidden sm:!inline">
                {' '}
                — Accept keeps the assistant’s edits, Reject keeps yours
              </span>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                size="sm"
                className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600"
                onClick={agentReview.accept}
              >
                Accept
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-full"
                onClick={agentReview.reject}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {isDesktop && <NotebookTour run={isTourOpen} onClose={() => setIsTourOpen(false)} />}

      {showAgentChat && activeNoteId && (
        <>
          {!isAgentChatOpen && (
            <button
              type="button"
              onClick={() => setIsAgentChatOpen(true)}
              className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-primary-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-colors hover:bg-primary-600"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Assistant
            </button>
          )}
          <AgentChatPanel
            noteId={activeNoteId}
            open={isAgentChatOpen}
            onClose={() => setIsAgentChatOpen(false)}
            onUnavailable={handleAgentChatUnavailable}
            onPersistEditorState={handlePersistEditorState}
            onReviewChange={setAgentReview}
          />
        </>
      )}
    </div>
  );
}
