'use client';

import { NoteList } from '@/app/notebook/components/Sidebar/NoteList';
import { OrganizationSwitcher } from '@/app/notebook/components/Sidebar/OrganizationSwitcher';
import { SidebarSection } from '@/app/notebook/components/Sidebar/SidebarSection';
import { BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Button } from '@/components/ui/Button';
import { BaseMenu } from '@/components/ui/form/BaseMenu';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { FileText, Plus, Wallet, Lock } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Organization } from '@/types/organization';
import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { useNoteContent, useCreateNote } from '@/hooks/useNote';
import { getInitialContent } from '@/components/Editor/lib/data/initialContent';
import preregistrationTemplate from '@/components/Editor/lib/data/preregistrationTemplate';
import toast from 'react-hot-toast';
import { useNotebookContext } from '@/contexts/NotebookContext';

/**
 * Left sidebar component for the notebook layout
 * Displays organization information and lists of workspace and private notes
 */
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
  const { notes, isLoading: isLoadingNotes, refreshNotes, currentNote } = useNotebookContext();

  console.log('LeftSidebar state: ', {
    isLoadingOrgs,
    isLoadingNotes,
    isCreatingNote,
    isUpdatingContent,
  });
  const handleOrgSelect = useCallback(
    async (org: Organization) => {
      setSelectedOrg(org);

      try {
        startTransition(() => {
          const targetPath = `/notebook/${org.slug}`;
          router.replace(targetPath);
        });
      } catch (error) {
        console.error('Error navigating to organization:', error);
        toast.error('Failed to switch organization. Please try again.');
      }
    },
    [router, startTransition]
  );

  const handleTemplateSelect = useCallback(
    async (
      type: 'workspace' | 'private',
      template: 'research' | 'grant' | 'preregistration' | 'empty'
    ) => {
      if (!selectedOrg) return;

      try {
        // Get the appropriate template
        let contentTemplate;
        switch (template) {
          case 'research':
            contentTemplate = getInitialContent('research');
            break;
          case 'grant':
            contentTemplate = getInitialContent('grant');
            break;
          case 'preregistration':
            contentTemplate = preregistrationTemplate;
            break;
          case 'empty':
            contentTemplate = { content: [] };
            break;
          default:
            contentTemplate = getInitialContent('research'); // fallback to research template
            break;
        }

        // Create the note
        const newNote = await createNote({
          title: contentTemplate.content[0]?.content?.[0]?.text || 'Untitled',
          grouping: type.toUpperCase() as 'WORKSPACE' | 'PRIVATE',
          organizationSlug: selectedOrg.slug,
        });

        // Update the note content with the template
        await updateNoteContent({
          note: newNote.id,
          fullJson: JSON.stringify(contentTemplate),
          plainText: contentTemplate.content
            .map((block) => block.content?.map((c) => c.text).join(' '))
            .filter(Boolean)
            .join('\n'),
        });

        refreshNotes();
        router.push(`/notebook/${selectedOrg.slug}/${newNote.id}?template=${template}`);
      } catch (error) {
        console.error('Error creating note:', error);
        toast.error('Failed to create note. Please try again.', {
          style: { width: '300px' },
        });
      }
    },
    [createNote, updateNoteContent, router, selectedOrg, refreshNotes]
  );

  const renderTemplateMenu = (type: 'workspace' | 'private') => (
    <BaseMenu
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 transition-opacity"
          disabled={isCreatingNote || isUpdatingContent}
        >
          {isCreatingNote || isUpdatingContent ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          ) : (
            <Plus className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      }
      align="start"
      className="w-56 p-1.5"
    >
      <div className="text-[.65rem] font-semibold mb-1 uppercase text-neutral-500 px-2">
        Select Template
      </div>
      <BaseMenuItem
        onClick={() => handleTemplateSelect(type, 'research')}
        className="flex items-center gap-2 py-2"
        disabled={isCreatingNote || isUpdatingContent}
      >
        {isCreatingNote || isUpdatingContent ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        <div>
          <div className="font-medium text-gray-900">Research Article</div>
          <div className="text-xs text-gray-500">Standard research paper format</div>
        </div>
      </BaseMenuItem>

      {/* <BaseMenuItem
        onClick={() => handleTemplateSelect(type, 'grant')}
        className="flex items-center gap-2 py-2"
        disabled={isCreatingNote || isUpdatingContent}
      >
        {isCreatingNote || isUpdatingContent ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        <div>
          <div className="font-medium text-gray-900">Grant Proposal</div>
          <div className="text-xs text-gray-500">Structured grant application</div>
        </div>
      </BaseMenuItem> */}
      <BaseMenuItem
        onClick={() => handleTemplateSelect(type, 'preregistration')}
        className="flex items-center gap-2 py-2"
        disabled={isCreatingNote || isUpdatingContent}
      >
        {isCreatingNote || isUpdatingContent ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        <div>
          <div className="font-medium text-gray-900">Preregistration</div>
          <div className="text-xs text-gray-500">Get funding for your research</div>
        </div>
      </BaseMenuItem>
      <BaseMenuItem
        onClick={() => handleTemplateSelect(type, 'empty')}
        className="flex items-center gap-2 py-2"
        disabled={isCreatingNote || isUpdatingContent}
      >
        {isCreatingNote || isUpdatingContent ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        <div>
          <div className="font-medium text-gray-900">Empty</div>
          <div className="text-xs text-gray-500">Start with a blank page</div>
        </div>
      </BaseMenuItem>
    </BaseMenu>
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
          <SidebarSection action={renderTemplateMenu('workspace')} title="Workspace">
            {(notes && notes.length > 0) || isLoadingNotes || isLoadingOrgs ? (
              <NoteList
                type="workspace"
                notes={notes || []}
                isLoading={isLoadingNotes || isPending}
                selectedNoteId={currentNote?.id?.toString()}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-sm text-gray-500">
                <p className="mb-2">No notes yet</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTemplateSelect('workspace', 'research')}
                  disabled={isCreatingNote || isUpdatingContent}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add New Note
                </Button>
              </div>
            )}
          </SidebarSection>
        </div>

        <div className="px-2 py-3">
          <SidebarSection
            icon={Lock}
            iconPosition="after"
            action={renderTemplateMenu('private')}
            title="Private"
          >
            {(notes && notes.length > 0) || isLoadingNotes || isLoadingOrgs ? (
              <NoteList
                type="private"
                notes={notes || []}
                isLoading={isLoadingNotes || isPending}
                selectedNoteId={currentNote?.id?.toString()}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-sm text-gray-500">
                <p className="mb-2">No private notes yet</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTemplateSelect('private', 'research')}
                  disabled={isCreatingNote || isUpdatingContent}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Private Note
                </Button>
              </div>
            )}
          </SidebarSection>
        </div>
      </div>
    </div>
  );
};
