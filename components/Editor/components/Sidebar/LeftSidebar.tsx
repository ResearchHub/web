'use client';

import { Plus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SidebarSection } from './SidebarSection';
import { NoteList } from './NoteList';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useOrganizationNotes } from '@/hooks/useOrganizationNotes';
import { useParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { Organization } from '@/types/organization';

/**
 * Left sidebar component for the notebook layout
 * Displays organization information and lists of workspace and private notes
 */
const LeftSidebar = () => {
  const router = useRouter();
  const { selectedOrg, organizations, isLoading: isLoadingOrgs } = useOrganizationContext();
  const params = useParams();
  const currentOrgSlug = params?.orgSlug as string;

  const { notes, isLoading: isLoadingNotes } = useOrganizationNotes(selectedOrg, {
    currentOrgSlug,
  });

  const handleOrgSelect = useCallback(
    async (org: Organization) => {
      await router.push(`/notebook/${org.slug}`);
    },
    [router]
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
          <NoteList type="workspace" notes={notes} isLoading={isLoadingNotes} />
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
          <NoteList type="private" notes={notes} isLoading={isLoadingNotes} />
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
