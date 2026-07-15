'use client';

import { useState, useEffect, useRef } from 'react';
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

import { useNotebookContext } from '@/contexts/NotebookContext';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useUpdateNote } from '@/hooks/useNote';
import { useTopBarSlot } from '@/contexts/TopBarSlotContext';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { FeatureFlag, isFeatureEnabled } from '@/utils/featureFlags';
import { LegacyNoteBanner } from '@/components/LegacyNoteBanner';
import { isPublishedRegisteredReportNote, isRegisteredReportNote } from '@/types/note';
import { normalizeRegisteredReportProposalId } from '@/utils/registeredReportPrefill';

// Persisted (per-user) flag so the guided tour auto-runs only once — the very
// first time someone lands in the editor on a freshly-created note.
const NOTEBOOK_TOUR_FEATURE = 'notebook_tour';

// Query params the note-creation flows append when redirecting to the editor.
// Their presence means the user just created this note (vs. opening an existing
// one), which is the only moment we want to auto-launch the tour.
const NEW_NOTE_PARAMS = ['newResearch', 'newGrant', 'newFunding', 'template'];

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
    case 'REGISTERED_REPORT':
      return 'Registered Report';
    case 'DISCUSSION':
      return 'Preprint';
  }
  if (contentType === 'funding_request') return 'Funding Opportunity';
  if (contentType === 'preregistration') return 'Proposal';
  if (contentType) return 'Preprint';
  return undefined;
}

function PublishedRegisteredReportNotice() {
  return (
    <div className="rounded-md bg-yellow-100 px-3 py-1.5 text-sm font-medium text-yellow-700">
      This Registered Report has been published and can no longer be edited.
    </div>
  );
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
  const [isTourOpen, setIsTourOpen] = useState(false);
  const tourAutoStarted = useRef(false);

  const isNewlyCreatedNote = NEW_NOTE_PARAMS.some((param) => searchParams?.has(param));

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

  const registeredReportProposalId = normalizeRegisteredReportProposalId(
    note?.proposalId ?? note?.registeredReportPrefill?.proposalId
  );

  const [, updateNote] = useUpdateNote(note?.id, {
    onTitleUpdate: updateNoteTitle,
    registeredReportProposalId,
  });

  const isCurrentNote = note?.id.toString() === activeNoteId;
  const showTabs = isCurrentNote && !isLegacyNote;
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

    if (!isCurrentNote) {
      return <NotePaperSkeleton />;
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
        <div className="mb-5 flex items-center gap-2 lg:-ml-12 lg:-mt-3">
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
            <div className="mb-2 flex justify-center">
              <PublishedRegisteredReportNotice />
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

      {isDesktop && <NotebookTour run={isTourOpen} onClose={() => setIsTourOpen(false)} />}
    </div>
  );
}
