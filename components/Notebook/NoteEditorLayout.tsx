'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';

import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { NotePaperWrapper } from './NotePaperWrapper';
import { NotePaperSkeleton } from './NotePaperSkeleton';
import { NotebookHome } from './NotebookHome';
import { NotebookTour } from './NotebookTour';
import { NotebookTabs, type NotebookTab } from './NotebookTabs';
import { NotesMenu } from './NotesMenu';
import { PublishedStatusSection } from './PublishingForm/components/PublishedStatusSection';
import { PublishingForm } from '@/components/Notebook/PublishingForm';

import { NotebookChatPanel } from './ChatPanel/NotebookChatPanel';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useUser } from '@/contexts/UserContext';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useNotebookChat, type NotebookChatTurnSummary } from '@/hooks/useNotebookChat';
import { useNotebookAssistantFlag } from '@/hooks/useNotebookAssistantFlag';
import { useUpdateNote } from '@/hooks/useNote';
import { useTopBarSlot } from '@/contexts/TopBarSlotContext';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { FeatureFlag, isFeatureEnabled } from '@/utils/featureFlags';
import { LegacyNoteBanner } from '@/components/LegacyNoteBanner';
import { isPublishedRegisteredReportNote, isRegisteredReportNote } from '@/types/note';

// Persisted (per-user) flag so the guided tour auto-runs only once — the very
// first time someone lands in the editor on a freshly-created note.
const NOTEBOOK_TOUR_FEATURE = 'notebook_tour';

// Query params the note-creation flows append when redirecting to the editor.
// Their presence means the user just created this note (vs. opening an existing
// one), which is the only moment we want to auto-launch the tour.
const NEW_NOTE_PARAMS = ['newGrant', 'newFunding', 'template'];

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
    refreshCurrentNote,
  } = useNotebookContext();

  const { selectedOrg } = useOrganizationContext();
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

  const [, updateNote] = useUpdateNote(note?.id, {
    onTitleUpdate: updateNoteTitle,
    registeredReportProposalId: note?.proposalId,
  });

  // The notebook assistant chat. Mirrors the backend's rollout gate (hub
  // editors and moderators), narrowed further by an opt-in flag so the
  // feature stays hidden from that group while it is being trialled. The hook
  // lives here rather than in the panel so a running turn keeps polling — and
  // the note refreshes with the agent's edits — even while the panel is closed.
  const { user } = useUser();
  const isAssistantFlagEnabled = useNotebookAssistantFlag();
  const canUseAssistant =
    isAssistantFlagEnabled && (!!user?.isModerator || !!user?.authorProfile?.isHubEditor);
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Sticky: once the chat has been opened, keep its state (and any running
  // turn's polling) alive across open/close toggles.
  const [chatActivated, setChatActivated] = useState(false);
  const openChat = useCallback(() => {
    setIsChatOpen(true);
    setChatActivated(true);
  }, []);
  const closeChat = useCallback(() => setIsChatOpen(false), []);

  // Read at settle time rather than captured, so the callback identity stays
  // stable while the open note's version moves under it.
  const noteVersionIdRef = useRef(note?.versionId);
  noteVersionIdRef.current = note?.versionId;

  const handleTurnSettled = useCallback(
    ({ editedNoteVersionId }: NotebookChatTurnSummary) => {
      // The turn saved nothing, or saved the version already on screen — a
      // refetch would only remount the editor and cost the user their cursor.
      if (editedNoteVersionId === null) return;
      if (noteVersionIdRef.current === editedNoteVersionId) return;
      void refreshCurrentNote();
    },
    [refreshCurrentNote]
  );

  const [chatState, chatActions] = useNotebookChat(activeNoteId, {
    enabled: canUseAssistant && chatActivated,
    onTurnSettled: handleTurnSettled,
  });

  const showTabs = Boolean(note) && !isLegacyNote;
  const isPublishedRegisteredReport = isPublishedRegisteredReportNote(note);
  const isEditorReadOnly =
    isPublishedRegisteredReport || (isLegacyNote && isFeatureEnabled(FeatureFlag.LegacyNoteBanner));
  const workTypeLabel = getWorkTypeLabel(
    note?.documentType,
    note?.post?.contentType,
    isRegisteredReportNote(note)
  );

  const renderEditor = () => {
    // No note is targeted (notebook home) — render the landing view directly so
    // the document skeleton doesn't flash before the empty state resolves.
    if (!activeNoteId) {
      return <NotebookHome />;
    }

    if (isLoadingNote || isLegacyNote === undefined) {
      return <NotePaperSkeleton />;
    }

    if (noteError && activeNoteId) {
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
        {/* Keyed on the loaded version so content arriving for a note that is
            already open — the assistant saving an edit — mounts a fresh
            editor. Replacing the document in a live editor tears down Tiptap's
            node views underneath React and throws an insertBefore error. */}
        <BlockEditor
          key={note.versionId}
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

  const isChatDocked = isChatOpen && isDesktop && canUseAssistant;

  return (
    <div className={cn('mx-auto w-full', isChatDocked ? 'flex justify-center gap-6' : 'max-w-4xl')}>
      <div className={cn('w-full', isChatDocked && 'min-w-0 max-w-4xl')}>
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
                {canUseAssistant && (
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={isChatOpen ? closeChat : openChat}
                    className={cn(
                      'gap-1.5',
                      isChatOpen && 'border-primary-300 bg-primary-50 text-primary-700'
                    )}
                  >
                    <Sparkles className="h-4 w-4" />
                    Assistant
                  </Button>
                )}
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

        {isDesktop && <NotebookTour run={isTourOpen} onClose={() => setIsTourOpen(false)} />}
      </div>

      {isChatDocked && (
        <div className="w-[340px] shrink-0">
          {/* Sticky offsets resolve against the layout's scroll container,
              which already starts below the top bar — hence top-4 rather than
              an offset including the bar. The height leaves room for that
              container's own top padding so the composer stays on screen. */}
          <div className="sticky top-4 h-[calc(100vh-var(--top-bar-height)-4rem)]">
            <NotebookChatPanel chat={chatState} actions={chatActions} onClose={closeChat} />
          </div>
        </div>
      )}

      {!isDesktop && canUseAssistant && (
        <SwipeableDrawer
          isOpen={isChatOpen}
          onClose={closeChat}
          height="85vh"
          showCloseButton={false}
        >
          <NotebookChatPanel
            chat={chatState}
            actions={chatActions}
            onClose={closeChat}
            className="flex-1 rounded-none border-0 shadow-none"
          />
        </SwipeableDrawer>
      )}
    </div>
  );
}
