'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
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

import { ABOVE_MOBILE_NAV } from './mobileBarOffsets';
import {
  AgentChatPanel,
  type NoteReviewHandle,
  type PendingAgentMessage,
} from '@/components/Notebook/AgentChatPanel';
import { AssistantComposerBar } from './AssistantComposerBar';
import { AssistantToggleButton } from './AssistantToggleButton';
import { useEditorIsEmpty } from '@/hooks/useEditorIsEmpty';
import type { ChatPresetNoteKind } from '@/components/AgentChat/ChatPresets';
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
  isProposalNote,
  isPublishedRegisteredReportNote,
  isRegisteredReportNote,
  isRfpNote,
} from '@/types/note';

// Persisted (per-user) flag so the guided tour auto-runs only once — the very
// first time someone lands in the editor on a freshly-created note.
const NOTEBOOK_TOUR_FEATURE = 'notebook_tour';

// Query params the note-creation flows append when redirecting to the editor.
// Their presence means the user just created this note (vs. opening an existing
// one), which is the only moment we want to auto-launch the tour.
const NEW_NOTE_PARAMS = ['newChangelog', 'newGrant', 'newFunding', 'template'];

/** Per-browser memory of the assistant panel being put away on desktop. */
const AGENT_CHAT_COLLAPSED_KEY = 'notebook:agent-chat-collapsed';

function readAgentChatCollapsed(): boolean {
  try {
    return window.localStorage.getItem(AGENT_CHAT_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

function writeAgentChatCollapsed(collapsed: boolean) {
  try {
    if (collapsed) window.localStorage.setItem(AGENT_CHAT_COLLAPSED_KEY, '1');
    else window.localStorage.removeItem(AGENT_CHAT_COLLAPSED_KEY);
  } catch {
    // Storage can be unavailable (private mode, blocked); the panel then
    // simply opens again next time.
  }
}

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
  const { mdAndUp, lgAndUp, xlAndUp } = useScreenSize();
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

  // ---- AI assistant chat ----
  const [isAgentChatOpen, setIsAgentChatOpen] = useState(false);
  // Flipped when the server denies access (the gate can change server-side);
  // hides the entry point while this note is open.
  const [agentChatUnavailable, setAgentChatUnavailable] = useState(false);
  // Active in-note review of an assistant version: the panel drives the
  // overlay, this layout renders the accept/restore controls over the note.
  const [agentReview, setAgentReview] = useState<NoteReviewHandle | null>(null);
  // A message composed in the bar over the document, waiting for the panel
  // to open and send it.
  const [pendingAgentMessage, setPendingAgentMessage] = useState<PendingAgentMessage | null>(null);
  const pendingMessageSeqRef = useRef(0);
  // The bar folds into a badge once the person starts typing in the document
  // and unfolds when they ask for it. Until they choose, phones start folded
  // (the full bar would cover most of the screen) and larger viewports open.
  const [composerFoldChoice, setComposerFoldChoice] = useState<boolean | null>(null);
  const isComposerCollapsed = composerFoldChoice ?? mdAndUp !== true;
  useEffect(() => {
    setComposerFoldChoice(null);
  }, [activeNoteId]);
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const dom = editor.view.dom;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const typing =
        event.key.length === 1 ||
        event.key === 'Enter' ||
        event.key === 'Backspace' ||
        event.key === 'Delete';
      if (typing) setComposerFoldChoice(true);
    };
    dom.addEventListener('keydown', handleKeyDown);
    return () => dom.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

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

  // Desktop opens the assistant with every note: docked beside the document,
  // it hides nothing the reader was looking at. Below the docking breakpoint
  // it would cover the note, so it waits for the pill. A close is remembered
  // per browser, so someone who put it away is not handed it back on the
  // next note; the pill re-opens it and clears that memory.
  const autoOpenedForNoteRef = useRef<typeof activeNoteId | null>(null);
  useEffect(() => {
    if (lgAndUp !== true || !activeNoteId) return;
    if (autoOpenedForNoteRef.current === activeNoteId) return;
    autoOpenedForNoteRef.current = activeNoteId;
    if (readAgentChatCollapsed()) return;
    setIsAgentChatOpen(true);
  }, [activeNoteId, lgAndUp]);

  const openAgentChat = useCallback(() => {
    writeAgentChatCollapsed(false);
    setIsAgentChatOpen(true);
  }, []);
  const closeAgentChat = useCallback(() => {
    writeAgentChatCollapsed(true);
    setIsAgentChatOpen(false);
    setPendingAgentMessage(null);
  }, []);

  const handleBarSubmit = useCallback(
    (text: string) => {
      setPendingAgentMessage({ id: ++pendingMessageSeqRef.current, text });
      openAgentChat();
    },
    [openAgentChat]
  );
  const handlePendingMessageHandled = useCallback((id: number) => {
    setPendingAgentMessage((prev) => (prev && prev.id === id ? null : prev));
  }, []);

  const noteIsEmpty = useEditorIsEmpty(editor);
  const noteKind: ChatPresetNoteKind = isRfpNote(note)
    ? 'rfp'
    : isProposalNote(note)
      ? 'proposal'
      : 'other';

  const {
    width: agentChatWidth,
    isResizing: isAgentChatResizing,
    startResize: startAgentChatResize,
    nudgeWidth: nudgeAgentChatWidth,
  } = useAgentChatWidth();

  const isChangelog = isChangelogNote(note);
  const isChangelogAccessDenied = isChangelog && !user?.isModerator;

  const showAgentChat =
    Boolean(user) &&
    !agentChatUnavailable &&
    // Changelogs are moderator-only: the page renders Note Not Found in place
    // of the document, so the assistant must not mount over it.
    !isChangelogAccessDenied &&
    Boolean(activeNoteId) &&
    Boolean(note) &&
    !noteError &&
    isLegacyNote === false;

  // Docking splits the viewport: the panel takes its own column and the
  // document gives up the same gutter. Below lg (1024px) there isn't enough
  // room left to keep the document readable, so the panel opens as a drawer
  // over it instead.
  const isAgentChatDocked = showAgentChat && isAgentChatOpen && lgAndUp === true;
  const isUndockedChatOpen = showAgentChat && isAgentChatOpen && !isAgentChatDocked;

  useEffect(() => {
    onAgentChatDockedChange?.(isAgentChatDocked);
  }, [isAgentChatDocked, onAgentChatDockedChange]);

  // The drawer closes on Escape too, unless something inside already claimed
  // the key (a menu, a modal that portals outside the panel).
  useEffect(() => {
    if (!isUndockedChatOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      closeAgentChat();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isUndockedChatOpen, closeAgentChat]);

  // Unmounting with the panel open would otherwise leave the container wide.
  useEffect(() => () => onAgentChatDockedChange?.(false), [onAgentChatDockedChange]);

  const previousNoteId = useRef(activeNoteId);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const tourAutoStarted = useRef(false);

  const isNewlyCreatedNote = NEW_NOTE_PARAMS.some((param) => searchParams?.has(param));

  useEffect(() => {
    if (previousNoteId.current !== activeNoteId) {
      setActiveTab('document');
      setPendingAgentMessage(null);
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
  // The composer over the document: there while the panel is closed, so the
  // conversation has one input at a time; the panel's own takes over once open.
  const isComposerBarVisible =
    showAgentChat &&
    Boolean(activeNoteId) &&
    !isUndockedChatOpen &&
    !isAgentChatOpen &&
    (!showTabs || activeTab === 'document');
  // The toggle sits in the document's bottom-right corner, on the bar's row.
  // On a viewport under xl the column is narrow, so the bar draws in from
  // both sides and the two never meet; phones instead lift the toggle above
  // the bar, since there is no width to spare.
  const composerBarInset = xlAndUp !== true ? 'px-4 tablet:!px-[6.5rem]' : 'px-4';
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
              {activeTab === 'document' && (
                <Button
                  data-testid="notebook-next-publish"
                  size="sm"
                  onClick={() => setActiveTab('details')}
                  className="gap-1.5"
                >
                  {isPublishedRegisteredReport ? 'View details' : 'Next: Publish'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        <div className={cn(showTabs && activeTab !== 'document' && 'hidden')}>{renderEditor()}</div>
        {/*
         * The composer over the document, with the panel's opening moves as
         * chips. In the note's own column rather than fixed to the viewport, so
         * it shares the paper's edges exactly and follows them as the panel
         * docks; sticky, so it stays in reach down a long note. Measured from
         * the scroll area, which on phones already stops above the bottom nav.
         */}
        {isComposerBarVisible && (
          <div className={cn('pointer-events-none sticky bottom-6 z-40 mt-4', composerBarInset)}>
            {/* A soft fade under the bar, so the document's last lines read
                through the chips instead of colliding with them. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -bottom-6 -top-10 bg-gradient-to-t from-white via-white/80 to-transparent"
            />
            <AssistantComposerBar
              className="pointer-events-auto relative mx-auto w-full max-w-[720px]"
              noteIsEmpty={noteIsEmpty}
              noteKind={noteKind}
              hasSelectedRfp={Boolean(note?.selectedGrant)}
              onSubmit={handleBarSubmit}
              collapsed={isComposerCollapsed}
              onExpand={() => setComposerFoldChoice(false)}
            />
          </div>
        )}
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
            // Above the composer bar while it shares the bottom of the document.
            isComposerBarVisible ? ABOVE_MOBILE_NAV.bottom40 : ABOVE_MOBILE_NAV.bottom6
          )}
        >
          <NoteReviewControls
            changeCount={agentReview.changeCount}
            onAccept={agentReview.accept}
            onReject={agentReview.reject}
          />
        </div>
      )}

      {/* The assistant's switch in the document's bottom-right corner, shown
          while the panel is closed; on phones it climbs above the composer bar
          whenever that is unfolded, since the bar then spans the width. */}
      {showAgentChat && activeNoteId && !isAgentChatOpen && (
        <AssistantToggleButton
          onClick={openAgentChat}
          className={
            isComposerBarVisible && mdAndUp !== true && !isComposerCollapsed
              ? ABOVE_MOBILE_NAV.aboveComposer
              : ABOVE_MOBILE_NAV.bottom6
          }
          style={{
            right: isAgentChatDocked ? agentChatWidth + 24 : 24,
            transition: isAgentChatResizing ? undefined : 'right 200ms ease-out',
          }}
        />
      )}

      {/* Drawer backdrop: dims the note and closes on tap, as the app's other
          drawers do. Docked, the panel is part of the page and needs none. */}
      {isUndockedChatOpen && (
        <div
          aria-hidden="true"
          onClick={closeAgentChat}
          className="fixed inset-0 z-[105] bg-gray-900/25"
        />
      )}

      {showAgentChat && activeNoteId && (
        <AgentChatPanel
          noteId={activeNoteId}
          open={isAgentChatOpen}
          onClose={closeAgentChat}
          onUnavailable={handleAgentChatUnavailable}
          onPersistEditorState={handlePersistEditorState}
          onReviewChange={setAgentReview}
          pendingMessage={pendingAgentMessage}
          onPendingMessageHandled={handlePendingMessageHandled}
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
