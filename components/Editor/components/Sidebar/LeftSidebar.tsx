'use client';

import { Plus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SidebarSection } from './SidebarSection';
import { NoteList } from './NoteList';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useOrganizationNotesContext } from '@/contexts/OrganizationNotesContext';
import { useRouter, useParams } from 'next/navigation';
import { useCallback } from 'react';
import type { Organization } from '@/types/organization';
import { NoteService } from '@/services/note.service';

/**
 * Left sidebar component for the notebook layout
 * Displays organization information and lists of workspace and private notes
 */
const LeftSidebar = () => {
  const router = useRouter();
  const params = useParams();
  const currentOrgSlug = params?.orgSlug as string;
  const { selectedOrg, organizations, isLoading: isLoadingOrgs } = useOrganizationContext();
  const { notes, isLoading: isLoadingNotes } = useOrganizationNotesContext();

  const handleOrgSelect = useCallback(
    async (org: Organization) => {
      // If we're already on this org's page, no need to navigate
      if (org.slug === currentOrgSlug) {
        return;
      }

      try {
        // Pre-fetch notes for the new organization
        const notesData = await NoteService.getOrganizationNotes(org.slug);
        const firstNote = notesData.results[0];
        // If there's at least one note for the new org, navigate to that note.
        const targetPath = firstNote
          ? `/notebook/${org.slug}/${firstNote.id}`
          : `/notebook/${org.slug}`;
        await router.push(targetPath);
      } catch (error) {
        console.error('Error fetching notes for organization switch:', error);
        // Fallback: navigate to the organization page without a note id
        await router.push(`/notebook/${org.slug}`);
      }
    },
    [router, currentOrgSlug]
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col sticky top-0 left-0">
      <div className="flex-none border-b border-gray-200">
        <OrganizationSwitcher
          organizations={organizations}
          selectedOrg={selectedOrg}
          onOrgSelect={handleOrgSelect}
          isLoading={isLoadingOrgs}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-3">
          <SidebarSection
            action={
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus className="h-4 w-4 text-gray-500" />
              </Button>
            }
          >
            Workspace
          </SidebarSection>
          <NoteList notes={notes} type="workspace" isLoading={isLoadingNotes} />
        </div>

        <div className="px-2 py-3">
          <SidebarSection
            icon={Lock}
            iconPosition="after"
            action={
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus className="h-4 w-4 text-gray-500" />
              </Button>
            }
          >
            Private
          </SidebarSection>
          <NoteList notes={notes} type="private" isLoading={isLoadingNotes} />
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
