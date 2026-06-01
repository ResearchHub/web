'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';

import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { NotePaperWrapper } from './NotePaperWrapper';
import { NotePaperSkeleton } from './NotePaperSkeleton';
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
import { FeatureFlag, isFeatureEnabled } from '@/utils/featureFlags';
import { LegacyNoteBanner } from '@/components/LegacyNoteBanner';

// Friendly label for the note's work type, shown at the top-left of the doc.
function getWorkTypeLabel(
  documentType?: string | null,
  contentType?: string | null
): string | undefined {
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
  } = useNotebookContext();

  const { selectedOrg } = useOrganizationContext();
  const { lgAndUp } = useScreenSize();
  const isDesktop = lgAndUp;

  const topBarSlot = useTopBarSlot();
  const setLeftSlot = topBarSlot?.setLeftSlot;

  const [isLegacyNote, setIsLegacyNote] = useState<boolean | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<NotebookTab>('document');
  const [isTourOpen, setIsTourOpen] = useState(false);
  const tourAutoStarted = useRef(false);

  // Surface the "Notebook" notes dropdown in the shared TopBar's left area.
  useEffect(() => {
    if (!setLeftSlot) return;
    setLeftSlot(<NotesMenu />);
    return () => setLeftSlot(null);
  }, [setLeftSlot]);

  // Auto-start the tour once per page load on desktop.
  useEffect(() => {
    if (isDesktop !== true || tourAutoStarted.current) return;
    tourAutoStarted.current = true;
    const timer = setTimeout(() => setIsTourOpen(true), 1000);
    return () => clearTimeout(timer);
  }, [isDesktop]);

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
  });

  const showTabs = Boolean(note) && !isLegacyNote;
  const workTypeLabel = getWorkTypeLabel(note?.documentType, note?.post?.contentType);

  const renderEditor = () => {
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
      return (
        <NotePaperWrapper canvas={false}>
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="max-w-md text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {selectedOrg?.name ? `Welcome to ${selectedOrg.name}` : 'Welcome'}
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-gray-600 mb-4">
                  Please select a note from the menu to view or edit its contents.
                </p>
                <p className="text-sm text-gray-500">
                  You can also create a new note from the &quot;Notebook&quot; menu.
                </p>
              </div>
            </div>
          </div>
        </NotePaperWrapper>
      );
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
          onUpdate={isLegacyNote ? undefined : updateNote}
          editable={!(isLegacyNote && isFeatureEnabled(FeatureFlag.LegacyNoteBanner))}
          setEditor={setEditor}
        />
      </NotePaperWrapper>
    );
  };

  if (isDesktop === null) return null;

  return (
    <div className="mx-auto w-full max-w-4xl">
      {showTabs && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <NotebookTabs active={activeTab} onChange={setActiveTab} />
          <div className="flex items-center gap-2">
            {isDesktop && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsTourOpen(true)}
                aria-label="Start notebook tour"
                className="text-gray-400 hover:text-gray-600"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            )}
            {activeTab === 'document' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setActiveTab('details')}
                className="gap-1.5"
              >
                Review &amp; publish
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className={cn(showTabs && activeTab !== 'document' && 'hidden')}>{renderEditor()}</div>
      {showTabs && (
        <div className={cn(activeTab !== 'details' && 'hidden')}>
          <PublishingForm />
        </div>
      )}

      {isDesktop && <NotebookTour run={isTourOpen} onClose={() => setIsTourOpen(false)} />}
    </div>
  );
}
