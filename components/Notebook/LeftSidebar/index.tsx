'use client';

import { NoteList } from '@/components/Notebook/LeftSidebar/NoteList';
import { OrganizationSwitcher } from '@/components/Notebook/LeftSidebar/OrganizationSwitcher';
import { SidebarSection } from '@/components/Notebook/LeftSidebar/SidebarSection';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Button } from '@/components/ui/Button';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { Plus, Lock, Loader2, File, FileText, type LucideIcon } from 'lucide-react';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import Icon from '@/components/ui/icons/Icon';
import { Organization } from '@/types/organization';
import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';
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

const TEMPLATE_ITEMS = [
  {
    id: 'preregistration' as const,
    title: 'Proposal',
    description: 'Crowdfund your research',
    icon: <FundingIcon size={24} color="#2563eb" />,
  },
  {
    id: 'grant' as const,
    title: 'Funding Opportunity',
    description: 'Fund specific research you care about',
    icon: <Icon name="fund" size={24} color="#2563eb" />,
  },
  {
    id: 'research' as const,
    title: 'Preprint',
    description: 'Publish your research as a preprint',
    icon: <Icon name="submit1" size={24} color="#2563eb" />,
  },
  {
    id: 'empty' as const,
    title: 'Empty',
    description: 'Start with a blank page',
    icon: <File className="h-6 w-6 text-blue-600" />,
  },
];

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
    [router, startTransition]
  );

  const handleTemplateSelect = useCallback(
    async (
      type: 'workspace' | 'private',
      template: 'research' | 'grant' | 'preregistration' | 'empty'
    ) => {
      if (!selectedOrg) return;

      try {
        let contentTemplate;
        switch (template) {
          case 'research':
            contentTemplate = getInitialContent('research');
            break;
          case 'grant':
            contentTemplate = grantTemplate;
            break;
          case 'preregistration':
            contentTemplate = proposalTemplate;
            break;
          case 'empty':
            contentTemplate = {
              type: 'doc',
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
            break;
          default:
            contentTemplate = getInitialContent('research');
            break;
        }

        const newNote = await createNote({
          title: getDocumentTitle(contentTemplate) || 'Untitled',
          grouping: type.toUpperCase() as 'WORKSPACE' | 'PRIVATE',
          organizationSlug: selectedOrg.slug,
        });

        await updateNoteContent({
          note: newNote.id,
          fullJson: JSON.stringify(contentTemplate),
          plainText: getTemplatePlainText(contentTemplate),
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

  const isProcessing = isCreatingNote || isUpdatingContent;

  const hasWorkspaceNotes = notes?.some((n) => n.access === 'WORKSPACE' || n.access === 'SHARED');
  const hasPrivateNotes = notes?.some((n) => n.access === 'PRIVATE');

  const renderTemplateMenu = (type: 'workspace' | 'private', triggerLabel?: string) => (
    <BaseMenu
      trigger={
        triggerLabel ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={isProcessing}
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
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            ) : (
              <Plus className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        )
      }
      align="start"
      className="w-[340px] p-2"
    >
      <div className="space-y-4 pt-2">
        <div>
          <div className="px-3 mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Select Template
            </h3>
          </div>
          <div className="space-y-2">
            {TEMPLATE_ITEMS.map((item) => (
              <BaseMenuItem
                key={item.id}
                onClick={() => handleTemplateSelect(type, item.id)}
                className="w-full px-2"
                disabled={isProcessing}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      {isProcessing ? (
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      ) : (
                        item.icon
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-md font-medium tracking-[0.02em] text-gray-900">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">{item.description}</div>
                  </div>
                </div>
              </BaseMenuItem>
            ))}
          </div>
        </div>
      </div>
    </BaseMenu>
  );

  const renderEmptyState = ({
    icon: StateIcon,
    title,
    subtitle,
    buttonLabel,
    type,
  }: {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    buttonLabel: string;
    type: 'workspace' | 'private';
  }) => (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2.5">
        <StateIcon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5 mb-3">{subtitle}</p>
      {renderTemplateMenu(type, buttonLabel)}
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
            action={renderTemplateMenu('workspace')}
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
                type: 'workspace',
              })
            )}
          </SidebarSection>
        </div>

        <div className="px-2 py-3">
          <SidebarSection
            title="Private"
            icon={Lock}
            iconPosition="after"
            action={renderTemplateMenu('private')}
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
                type: 'private',
              })
            )}
          </SidebarSection>
        </div>
      </div>
    </div>
  );
};
