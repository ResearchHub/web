'use client';

import { NoteList } from '@/components/Notebook/LeftSidebar/NoteList';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { FilePlus, Loader2, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useNoteContent, useCreateNote } from '@/hooks/useNote';
import { OrganizationSettingsModal } from '@/components/modals/OrganizationSettingsModal';
import { getInitialContent } from '@/components/Editor/lib/data/initialContent';
import {
  getDocumentTitle,
  getTemplatePlainText,
} from '@/components/Editor/lib/utils/documentTitle';
import toast from 'react-hot-toast';
import { useNotebookContext } from '@/contexts/NotebookContext';
import grantTemplate from '@/components/Editor/lib/data/grantTemplate';
import proposalTemplate from '@/components/Editor/lib/data/proposalTemplate';
import { NoteCreationModal, NoteCreationType } from '@/components/Notebook/NoteCreationModal';
import { importDocumentToTiptap } from '@/components/Editor/lib/convert';

type TemplateId = 'preregistration' | 'grant' | 'research';

// Map our internal template ids onto the Django document_type strings the
// publishing form and downstream APIs key off of. Mirrors the mapping used in
// `app/notebook/[orgSlug]/page.tsx`.
const TEMPLATE_TO_DOCUMENT_TYPE: Record<TemplateId, string> = {
  preregistration: 'PREREGISTRATION',
  grant: 'GRANT',
  research: 'DISCUSSION',
};

const EMPTY_TEMPLATE = {
  type: 'doc' as const,
  content: [
    {
      type: 'heading',
      attrs: { textAlign: 'left', level: 1 },
      content: [{ type: 'text', text: 'Untitled' }],
    },
    {
      type: 'paragraph',
      attrs: { class: null, textAlign: 'left' },
    },
  ],
};

const getTemplateContent = (templateId: TemplateId) => {
  switch (templateId) {
    case 'grant':
      return grantTemplate;
    case 'preregistration':
      return proposalTemplate;
    case 'research':
    default:
      return getInitialContent('research');
  }
};

export const LeftSidebar = () => {
  const router = useRouter();

  const [{ isLoading: isCreatingNote }, createNote] = useCreateNote();
  const [{ isLoading: isUpdatingContent }, updateNoteContent] = useNoteContent();
  const { selectedOrg } = useOrganizationContext();
  const { notes, isLoading: isLoadingNotes, refreshNotes } = useNotebookContext();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // Distinct from createNote/updateNote loading because the conversion call
  // happens before either of those fire — we want the modal to show "Importing"
  // for the full duration including the network round-trip.
  const [isImporting, setIsImporting] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const isCurrentUserAdmin = selectedOrg?.userPermission?.accessType === 'ADMIN';

  const createNoteWithContent = useCallback(
    async ({
      template,
      templateContent,
      documentType,
    }: {
      template: TemplateId | 'empty';
      templateContent: ReturnType<typeof getTemplateContent> | typeof EMPTY_TEMPLATE;
      documentType?: string;
    }) => {
      if (!selectedOrg) return;

      try {
        const newNote = await createNote({
          title: getDocumentTitle(templateContent) || 'Untitled',
          grouping: 'WORKSPACE',
          organizationSlug: selectedOrg.slug,
          documentType,
        });

        await updateNoteContent({
          note: newNote.id,
          fullJson: JSON.stringify(templateContent),
          plainText: getTemplatePlainText(templateContent),
        });

        refreshNotes();
        setIsCreateModalOpen(false);
        router.push(`/notebook/${selectedOrg.slug}/${newNote.id}?template=${template}`);
      } catch (error) {
        console.error('Error creating note:', error);
        toast.error('Failed to create note. Please try again.', {
          style: { width: '300px' },
        });
      }
    },
    [createNote, updateNoteContent, refreshNotes, router, selectedOrg]
  );

  const handleCreateFromTemplate = useCallback(
    async (type: TemplateId) => {
      await createNoteWithContent({
        template: type,
        templateContent: getTemplateContent(type),
        documentType: TEMPLATE_TO_DOCUMENT_TYPE[type],
      });
    },
    [createNoteWithContent]
  );

  const handleCreateBlank = useCallback(async () => {
    await createNoteWithContent({ template: 'empty', templateContent: EMPTY_TEMPLATE });
  }, [createNoteWithContent]);

  const handleCreateFromUpload = useCallback(
    async ({ file, type }: { file: File; type: NoteCreationType }) => {
      if (!selectedOrg) return;
      setIsImporting(true);
      try {
        const result = await importDocumentToTiptap(file);
        const documentType =
          type === 'other' ? undefined : TEMPLATE_TO_DOCUMENT_TYPE[type as TemplateId];

        const newNote = await createNote({
          title: result.title,
          grouping: 'WORKSPACE',
          organizationSlug: selectedOrg.slug,
          documentType,
        });

        await updateNoteContent({
          note: newNote.id,
          fullSrc: result.html,
          fullJson: JSON.stringify(result.json),
          plainText: result.plainText,
        });

        refreshNotes();
        setIsCreateModalOpen(false);
        // No ?template= query — the import gave us real content, not a scaffold.
        router.push(`/notebook/${selectedOrg.slug}/${newNote.id}`);
      } catch (error) {
        console.error('Error importing document:', error);
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to import document. Please try a different file.';
        toast.error(message, { style: { width: '320px' } });
      } finally {
        setIsImporting(false);
      }
    },
    [createNote, updateNoteContent, refreshNotes, router, selectedOrg]
  );

  const isProcessing = isCreatingNote || isUpdatingContent || isImporting;
  const hasNotes = notes?.some((n) => n.access === 'WORKSPACE' || n.access === 'SHARED');

  return (
    <div className="flex flex-col py-1.5 text-sm">
      {/* New note */}
      <button
        type="button"
        onClick={() => setIsCreateModalOpen(true)}
        disabled={isProcessing}
        className="mx-1 flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        ) : (
          <FilePlus className="h-4 w-4 text-gray-500" />
        )}
        <span className="font-medium">New note</span>
      </button>

      <div className="my-1.5 border-t border-gray-200" />

      {/* Notes */}
      <div className="max-h-[320px] overflow-y-auto px-1">
        {hasNotes || isLoadingNotes ? (
          <NoteList notes={notes || []} isLoading={isLoadingNotes} />
        ) : (
          <div className="px-3 py-6 text-center text-sm text-gray-400">No notes yet</div>
        )}
      </div>

      <div className="my-1.5 border-t border-gray-200" />

      {/* Invite */}
      <button
        type="button"
        onClick={() => setIsSettingsModalOpen(true)}
        disabled={!isCurrentUserAdmin}
        title={isCurrentUserAdmin ? undefined : 'Only admins can invite members'}
        className="mx-1 flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <UserPlus className="h-4 w-4 text-gray-500" />
        <span>Invite people</span>
      </button>

      <NoteCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          if (!isProcessing) setIsCreateModalOpen(false);
        }}
        onCreateFromTemplate={handleCreateFromTemplate}
        onCreateBlank={handleCreateBlank}
        onCreateFromUpload={handleCreateFromUpload}
        isProcessing={isProcessing}
      />

      {selectedOrg && isCurrentUserAdmin && (
        <OrganizationSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}
    </div>
  );
};
