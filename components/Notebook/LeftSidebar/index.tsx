'use client';

import { NoteList } from '@/components/Notebook/LeftSidebar/NoteList';
import { OrganizationSwitcher } from '@/components/Notebook/LeftSidebar/OrganizationSwitcher';
import { SidebarSection } from '@/components/Notebook/LeftSidebar/SidebarSection';
import { Button } from '@/components/ui/Button';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { Plus, Lock, Loader2, FileText, type LucideIcon } from 'lucide-react';
import { Organization } from '@/types/organization';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { useNoteContent, useCreateNote } from '@/hooks/useNote';
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

type Grouping = 'workspace' | 'private';

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

  const [isPending, startTransition] = useTransition();
  const [{ isLoading: isCreatingNote }, createNote] = useCreateNote();
  const [{ isLoading: isUpdatingContent }, updateNoteContent] = useNoteContent();
  const {
    organizations,
    selectedOrg,
    setSelectedOrg,
    isLoading: isLoadingOrgs,
  } = useOrganizationContext();
  const { notes, isLoading: isLoadingNotes, refreshNotes } = useNotebookContext();

  // Which section's "+" was clicked, or null when the modal is closed.
  const [activeModalGrouping, setActiveModalGrouping] = useState<Grouping | null>(null);
  // Distinct from createNote/updateNote loading because the conversion call
  // happens before either of those fire — we want the modal to show "Importing"
  // for the full duration including the network round-trip.
  const [isImporting, setIsImporting] = useState(false);

  const handleOrgSelect = useCallback(
    async (org: Organization) => {
      setSelectedOrg(org);

      try {
        startTransition(() => {
          router.replace(`/notebook/${org.slug}`);
        });
      } catch (error) {
        console.error('Error navigating to organization:', error);
        toast.error('Failed to switch organization. Please try again.');
      }
    },
    [router, setSelectedOrg]
  );

  const createNoteWithContent = useCallback(
    async ({
      grouping,
      template,
      templateContent,
      documentType,
    }: {
      grouping: Grouping;
      template: TemplateId | 'empty';
      templateContent: ReturnType<typeof getTemplateContent> | typeof EMPTY_TEMPLATE;
      documentType?: string;
    }) => {
      if (!selectedOrg) return;

      try {
        const newNote = await createNote({
          title: getDocumentTitle(templateContent) || 'Untitled',
          grouping: grouping.toUpperCase() as 'WORKSPACE' | 'PRIVATE',
          organizationSlug: selectedOrg.slug,
          documentType,
        });

        await updateNoteContent({
          note: newNote.id,
          fullJson: JSON.stringify(templateContent),
          plainText: getTemplatePlainText(templateContent),
        });

        refreshNotes();
        setActiveModalGrouping(null);
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
    async (grouping: Grouping, type: TemplateId) => {
      await createNoteWithContent({
        grouping,
        template: type,
        templateContent: getTemplateContent(type),
        documentType: TEMPLATE_TO_DOCUMENT_TYPE[type],
      });
    },
    [createNoteWithContent]
  );

  const handleCreateBlank = useCallback(
    async (grouping: Grouping) => {
      await createNoteWithContent({
        grouping,
        template: 'empty',
        templateContent: EMPTY_TEMPLATE,
      });
    },
    [createNoteWithContent]
  );

  const handleCreateFromUpload = useCallback(
    async (grouping: Grouping, { file, type }: { file: File; type: NoteCreationType }) => {
      if (!selectedOrg) return;
      setIsImporting(true);
      try {
        const result = await importDocumentToTiptap(file);
        const documentType =
          type === 'other' ? undefined : TEMPLATE_TO_DOCUMENT_TYPE[type as TemplateId];

        const newNote = await createNote({
          title: result.title,
          grouping: grouping.toUpperCase() as 'WORKSPACE' | 'PRIVATE',
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
        setActiveModalGrouping(null);
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

  const hasWorkspaceNotes = notes?.some((n) => n.access === 'WORKSPACE' || n.access === 'SHARED');
  const hasPrivateNotes = notes?.some((n) => n.access === 'PRIVATE');

  const openModalFor = (grouping: Grouping) => () => setActiveModalGrouping(grouping);

  const renderAddButton = (grouping: Grouping, triggerLabel?: string) =>
    triggerLabel ? (
      <Button
        variant="ghost"
        size="sm"
        disabled={isProcessing}
        onClick={openModalFor(grouping)}
        className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700"
      >
        <Plus className="h-3.5 w-3.5" />
        {triggerLabel}
      </Button>
    ) : (
      <Button
        variant="ghost"
        size="icon"
        className="w-6 h-6 transition-opacity"
        disabled={isProcessing}
        onClick={openModalFor(grouping)}
        aria-label={`Add new ${grouping} note`}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        ) : (
          <Plus className="h-4 w-4 text-gray-500" />
        )}
      </Button>
    );

  const renderEmptyState = ({
    icon: StateIcon,
    title,
    subtitle,
    buttonLabel,
    grouping,
  }: {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    buttonLabel: string;
    grouping: Grouping;
  }) => (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2.5">
        <StateIcon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5 mb-3">{subtitle}</p>
      {renderAddButton(grouping, buttonLabel)}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      <OrganizationSwitcher
        organizations={organizations}
        selectedOrg={selectedOrg}
        onOrgSelect={handleOrgSelect}
        isLoading={isLoadingOrgs || isPending}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-3">
          <SidebarSection
            title="Workspace"
            icon={FileText}
            iconPosition="after"
            action={renderAddButton('workspace')}
          >
            {hasWorkspaceNotes || isLoadingNotes || isLoadingOrgs ? (
              <NoteList
                type="workspace"
                notes={notes || []}
                isLoading={isLoadingNotes || isPending}
              />
            ) : (
              renderEmptyState({
                icon: FileText,
                title: 'No notes yet',
                subtitle: 'Create your first note to get started',
                buttonLabel: 'Add New Note',
                grouping: 'workspace',
              })
            )}
          </SidebarSection>
        </div>

        <div className="px-2 py-3">
          <SidebarSection
            title="Private"
            icon={Lock}
            iconPosition="after"
            action={renderAddButton('private')}
          >
            {hasPrivateNotes || isLoadingNotes || isLoadingOrgs ? (
              <NoteList
                type="private"
                notes={notes || []}
                isLoading={isLoadingNotes || isPending}
              />
            ) : (
              renderEmptyState({
                icon: Lock,
                title: 'No private notes yet',
                subtitle: 'Private notes are only visible to you',
                buttonLabel: 'Add Private Note',
                grouping: 'private',
              })
            )}
          </SidebarSection>
        </div>
      </div>

      <NoteCreationModal
        isOpen={activeModalGrouping !== null}
        onClose={() => {
          if (!isProcessing) setActiveModalGrouping(null);
        }}
        grouping={activeModalGrouping ?? 'workspace'}
        onCreateFromTemplate={(type) =>
          handleCreateFromTemplate(activeModalGrouping ?? 'workspace', type)
        }
        onCreateBlank={() => handleCreateBlank(activeModalGrouping ?? 'workspace')}
        onCreateFromUpload={(params) =>
          handleCreateFromUpload(activeModalGrouping ?? 'workspace', params)
        }
        isProcessing={isProcessing}
      />
    </div>
  );
};
