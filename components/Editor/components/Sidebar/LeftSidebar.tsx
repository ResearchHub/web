'use client';

import { Plus, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SidebarSection } from './SidebarSection';
import { NoteList } from './NoteList';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useOrganizationNotesContext } from '@/contexts/OrganizationNotesContext';
import { useRouter, useParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { Organization } from '@/types/organization';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { FileText, Wallet } from 'lucide-react';
import { useCreateNote, useNoteContent } from '@/hooks/useNote';
import { getInitialContent } from '@/components/Editor/lib/data/initialContent';
import preregistrationTemplate from '@/components/Editor/lib/data/preregistrationTemplate';
import toast from 'react-hot-toast';

/**
 * Left sidebar component for the notebook layout
 * Displays organization information and lists of workspace and private notes
 */
const LeftSidebar = () => {
  const router = useRouter();
  const params = useParams();
  const currentOrgSlug = params?.orgSlug as string;
  const noteId = params?.noteId as string;
  const { selectedOrg, organizations, isLoading: isLoadingOrgs } = useOrganizationContext();
  const { notes, isLoading: isLoadingNotes, refresh: refreshNotes } = useOrganizationNotesContext();
  const [{ isLoading: isCreatingNote }, createNote] = useCreateNote();
  const [{ isLoading: isUpdatingContent }, updateNoteContent] = useNoteContent();
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  const handleOrgSelect = useCallback(
    async (org: Organization) => {
      // If we're already on this org's page, no need to navigate
      if (org.slug === currentOrgSlug) {
        return;
      }

      // If we have notes for the current org, navigate to the first note
      // Otherwise, just navigate to the org's page
      const targetPath =
        notes.length > 0 ? `/notebook/${org.slug}/${notes[0].id}` : `/notebook/${org.slug}`;

      await router.push(targetPath);
    },
    [router, currentOrgSlug, notes]
  );

  const handleTemplateSelect = useCallback(
    async (type: 'workspace' | 'private', template: 'research' | 'grant' | 'preregistration') => {
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

        router.push(`/notebook/${selectedOrg.slug}/${newNote.id}?template=${template}`);

        refreshNotes();
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
      onOpenChange={setIsTemplateMenuOpen}
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
      <BaseMenuItem
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
      </BaseMenuItem>
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
    </BaseMenu>
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col sticky top-0 left-0">
      <div className="flex-none">
        <OrganizationSwitcher
          organizations={organizations}
          selectedOrg={selectedOrg}
          onOrgSelect={handleOrgSelect}
          isLoading={isLoadingOrgs}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-3">
          <SidebarSection action={renderTemplateMenu('workspace')} title="Workspace">
            <NoteList
              type="workspace"
              notes={notes}
              isLoading={isLoadingNotes}
              selectedNoteId={noteId}
            />
          </SidebarSection>
        </div>

        <div className="px-2 py-3">
          <SidebarSection
            icon={Lock}
            iconPosition="after"
            action={renderTemplateMenu('private')}
            title="Private"
          >
            <NoteList
              type="private"
              notes={notes}
              isLoading={isLoadingNotes}
              selectedNoteId={noteId}
            />
          </SidebarSection>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
