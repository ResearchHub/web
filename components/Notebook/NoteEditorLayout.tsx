'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/styles';

import { Button } from '@/components/ui/Button';
import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { NotePaperWrapper } from './NotePaperWrapper';
import { NotePaperSkeleton } from './NotePaperSkeleton';
import { TopBarDesktop } from './TopBarDesktop';
import { TopBarMobile } from './TopBarMobile';
import { RightSidebar } from './RightSidebar';

import { useSidebar } from '@/contexts/SidebarContext';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useUpdateNote } from '@/hooks/useNote';
import { FeatureFlag, isFeatureEnabled } from '@/utils/featureFlags';
import { LegacyNoteBanner } from '@/components/LegacyNoteBanner';

function SidebarCloseHeader({
  onClose,
  className,
}: Readonly<{ onClose: () => void; className?: string }>) {
  return (
    <div className={cn('h-16 flex justify-start items-center p-4', className)}>
      <Button
        onClick={onClose}
        className="p-2 rounded-md hover:bg-gray-100"
        variant="ghost"
        size="icon"
      >
        <div className="flex">
          <ChevronRight className="h-5 w-5" />
          <ChevronRight className="h-5 w-5 -ml-3" />
        </div>
      </Button>
    </div>
  );
}

interface NoteEditorLayoutProps {
  defaultArticleType?: string;
  onClose?: () => void;
}

export function NoteEditorLayout({ defaultArticleType, onClose }: Readonly<NoteEditorLayoutProps>) {
  const isModal = Boolean(onClose);

  const {
    currentNote: note,
    isLoadingNote,
    noteError,
    setEditor,
    updateNoteTitle,
    activeNoteId,
  } = useNotebookContext();

  const { isRightSidebarOpen, closeRightSidebar, openRightSidebar } = useSidebar();

  const { selectedOrg } = useOrganizationContext();
  const { xlAndUp, lgAndUp } = useScreenSize();
  const isDesktop = lgAndUp;

  const [isLegacyNote, setIsLegacyNote] = useState<boolean | undefined>(undefined);

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

  const shouldShowRightSidebar = Boolean(note) && !isLegacyNote;

  useEffect(() => {
    if (!shouldShowRightSidebar) return;
    if (xlAndUp) {
      openRightSidebar();
    } else {
      closeRightSidebar();
    }
  }, [xlAndUp, shouldShowRightSidebar, openRightSidebar, closeRightSidebar]);

  const renderTopBar = () =>
    isDesktop ? <TopBarDesktop onClose={onClose} /> : <TopBarMobile onClose={onClose} />;

  const renderEditor = () => {
    // Still resolving legacy-note status
    if (isLoadingNote || isLegacyNote === undefined) {
      return <NotePaperSkeleton />;
    }

    // Error loading a specific note
    if (noteError && activeNoteId) {
      return (
        <NotePaperWrapper>
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

    // No note selected → welcome state
    if (!note) {
      return (
        <NotePaperWrapper>
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="max-w-md text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {selectedOrg?.name ? `Welcome to ${selectedOrg.name}` : 'Welcome'}
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-gray-600 mb-4">
                  Please select a note from the sidebar to view or edit its contents.
                </p>
                <p className="text-sm text-gray-500">
                  You can also create a new note by clicking the "New Note" button in the sidebar.
                </p>
              </div>
            </div>
          </div>
        </NotePaperWrapper>
      );
    }

    return (
      <NotePaperWrapper
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

  const renderSidebar = () => (
    <RightSidebar defaultArticleType={defaultArticleType} isModal={isModal} />
  );

  if (isDesktop === null) return null;

  const hasDesktopSidebar = isDesktop && shouldShowRightSidebar;
  const gridColumns = !hasDesktopSidebar
    ? 'minmax(0, 1fr)'
    : isRightSidebarOpen
      ? 'minmax(0, 1fr) 300px'
      : 'minmax(0, 1fr) 0px';

  return (
    <div className="flex flex-col h-full relative">
      {renderTopBar()}

      <div
        className="flex-1 min-h-0 grid"
        style={{
          gridTemplateColumns: gridColumns,
          transition: hasDesktopSidebar ? 'grid-template-columns 200ms ease-in-out' : undefined,
        }}
      >
        <div className="overflow-auto">{renderEditor()}</div>
        {isDesktop && shouldShowRightSidebar && (
          <div className="border-l border-gray-200 h-full overflow-hidden">{renderSidebar()}</div>
        )}
      </div>

      {!isDesktop && !isModal && (
        <Transition show={isRightSidebarOpen} as={Fragment}>
          <Dialog onClose={closeRightSidebar} className="relative z-50">
            <Transition.Child
              as={Fragment}
              enter="transition-opacity duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/[0.15]" aria-hidden="true" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex h-full justify-end">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition duration-200 ease-in-out"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition duration-200 ease-in-out"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="w-full lg:w-72 h-full bg-white shadow-xl overflow-y-auto">
                    <SidebarCloseHeader
                      onClose={closeRightSidebar}
                      className="sticky top-0 bg-white z-10"
                    />
                    <div className="h-[calc(100vh-64px)] overflow-y-auto">{renderSidebar()}</div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}

      {!isDesktop && isModal && (
        <Transition show={isRightSidebarOpen} as={Fragment}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="absolute inset-0 bg-black/[0.15] z-30"
              onClick={closeRightSidebar}
              aria-hidden="true"
            />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transform transition duration-200 ease-in-out"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition duration-200 ease-in-out"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <div className="absolute right-0 top-0 bottom-0 w-full bg-white shadow-xl z-40 flex flex-col overflow-hidden">
              <SidebarCloseHeader
                onClose={closeRightSidebar}
                className="border-b border-gray-200 flex-shrink-0"
              />
              <div className="flex-1 overflow-y-auto">{renderSidebar()}</div>
            </div>
          </Transition.Child>
        </Transition>
      )}
    </div>
  );
}
