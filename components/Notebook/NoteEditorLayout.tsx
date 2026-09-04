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

import { ABOVE_MOBILE_NAV } from './mobileChromeOffsets';
import { AgentChatPanel, type NoteReviewHandle } from './AgentChat/AgentChatPanel';
import { noteDiffPersistableDoc } from './NoteReview/noteDiffOverlay';
import { NoteReviewControls } from './NoteReview/NoteReviewControls';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useUser } from '@/contexts/UserContext';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useAgentChatWidth } from '@/hooks/useAgentChatWidth';
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
      return 'Request for Proposal';
    case 'PREREGISTRATION':
      return 'Proposal';
    case 'DISCUSSION':
      return 'Preprint';
  }
  if (contentType === 'funding_request') return 'Request for Proposal';
  if (contentType === 'preregistration') return 'Proposal';
  if (contentType) return 'Preprint';
  return undefined;
}

interface NoteEditorLayoutProps {
  /**
   * Fires when the assistant docks or undocks. Docking is decided here — it
   * depends on the viewport, the access gate and the note — but the page
   * container above has to widen in step, or its centring margins strand a
   * band of empty space beside the shrunken document.
   */
  readonly onAgentChatDockedChange?: (docked: boolean) => void;
}

export function NoteEditorLayout({ onAgentChatDockedChange }: NoteEditorLayoutProps = {}) {
  const {
    currentNote: note,
    isLoadingNote,
    noteError,
    setEditor,
    updateNoteTitle,
    saveDetailsSoon,
    activeNoteId,
    editor,
  } = useNotebookContext();

  const { selectedOrg } = useOrganizationContext();
  const { user, isLoading: isLoadingUser } = useUser();
  const { lgAndUp, xlAndUp } = useScreenSize();
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

  const {
    width: agentChatWidth,
    isResizing: isAgentChatResizing,
    startResize: startAgentChatResize,
    nudgeWidth: nudgeAgentChatWidth,
  } = useAgentChatWidth();

  const isChangelog = isChangelogNote(note);
  const isChangelogAccessDenied = isChangelog && !user?.isModerator;

  const isHubEditorOrModerator = Boolean(user?.moderator) || (user?.editorOfHubs?.length ?? 0) > 0;
  const showAgentChat =
    isHubEditorOrModerator &&
    !agentChatUnavailable &&
    // Changelogs are moderator-only: the page renders Note Not Found in place
    // of the document, so the assistant must not mount over it.
    !isChangelogAccessDenied &&
    Boolean(activeNoteId) &&
    Boolean(note) &&
    !noteError &&
    isLegacyNote === false;

  // Docking splits the viewport: the panel takes its own column and the
  // document gives up the same gutter. Below xl there isn't enough room left
  // to keep the document readable, so the panel covers it as a sheet instead.
  const isAgentChatDocked = showAgentChat && isAgentChatOpen && xlAndUp === true;
  const isUndockedChatOpen = showAgentChat && isAgentChatOpen && !isAgentChatDocked;

  useEffect(() => {
    onAgentChatDockedChange?.(isAgentChatDocked);
  }, [isAgentChatDocked, onAgentChatDockedChange]);

  // Unmounting with the panel open would otherwise leave the container wide.
  useEffect(() => () => onAgentChatDockedChange?.(false), [onAgentChatDockedChange]);

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
    saveTitle: (title) => saveDetailsSoon({ title }),
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
          // Matching side padding centres the text: the left gutter can't
          // shrink below 64px (it hosts the editor's drag handle), so the
          // right side rises to meet it rather than the reverse.
          'p-0 lg:!p-8 lg:!px-16',
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
    <div
      // The docked panel is fixed to the viewport's right edge; reserving the
      // same width here is what turns an overlay into a split view. Animated
      // inline rather than by class so the gutter and the panel's own slide
      // stay in step, and so a drag isn't chased by a lagging transition.
      style={{
        paddingRight: isAgentChatDocked ? agentChatWidth : undefined,
        transition: isAgentChatResizing ? undefined : 'padding-right 200ms ease-out',
      }}
      className="w-full"
    >
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
                    data-testid="notebook-add-details"
                    variant="outlined"
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

      {/* Floating over the document — but only while the document is visible.
          Docked, the panel sits beside it and the controls shift by the panel's
          width; undocked, the panel covers the document and carries its own
          copy of these controls, so this one stands down. */}
      {agentReview && (!showTabs || activeTab === 'document') && !isUndockedChatOpen && (
        <div
          style={{ paddingRight: isAgentChatDocked ? agentChatWidth : undefined }}
          className={cn(
            'pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4',
            // Clear of the button that reopens the panel, which shares this
            // corner while the panel is closed.
            isAgentChatOpen
              ? ABOVE_MOBILE_NAV.bottom6
              : cn(ABOVE_MOBILE_NAV.bottom24, 'lg:!bottom-6')
          )}
        >
          <NoteReviewControls
            changeCount={agentReview.changeCount}
            onAccept={agentReview.accept}
            onReject={agentReview.reject}
          />
        </div>
      )}

      {/*
       * Floats in the bottom-right corner, on the side the panel docks to.
       * Below `tablet` it clears the 64px MobileBottomNav. It hides once open —
       * the panel would cover it, and its close button is the way back.
       */}
      {showAgentChat && activeNoteId && !isAgentChatOpen && (
        <button
          type="button"
          onClick={() => setIsAgentChatOpen(true)}
          aria-expanded={false}
          className={cn(
            'group fixed right-6 z-40 flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600 py-2.5 pl-3.5 pr-4 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-shadow hover:shadow-xl hover:shadow-primary-500/35',
            ABOVE_MOBILE_NAV.bottom6
          )}
        >
          {/* Highlight band that sweeps across on hover. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent motion-safe:group-hover:animate-shimmer"
          />
          <Sparkles className="relative h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="relative whitespace-nowrap">Research assistant</span>
        </button>
      )}

      {showAgentChat && activeNoteId && (
        <AgentChatPanel
          noteId={activeNoteId}
          open={isAgentChatOpen}
          onClose={() => setIsAgentChatOpen(false)}
          onUnavailable={handleAgentChatUnavailable}
          onPersistEditorState={handlePersistEditorState}
          onReviewChange={setAgentReview}
          docked={isAgentChatDocked}
          width={agentChatWidth}
          isResizing={isAgentChatResizing}
          onResizeStart={startAgentChatResize}
          onResizeNudge={nudgeAgentChatWidth}
        />
      )}
    </div>
  );
}
