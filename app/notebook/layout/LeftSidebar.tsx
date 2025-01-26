'use client';

import { useState } from 'react';
import { Plus, Lock } from 'lucide-react';
import { NotebookToggle } from '@/components/shared/NotebookToggle';
import { useOrganization } from '@/hooks/useOrganization';
import { useOrganizationNotes } from '@/hooks/useOrganizationNotes';
import { Button } from '@/components/ui/Button';
import type { Organization } from '@/types/organization';
import { SidebarSection } from '@/components/Editor/components/Sidebar/SidebarSection';
import { NoteList } from '@/components/Editor/components/Sidebar/NoteList';
import { OrganizationHeader } from '@/components/Editor/components/Sidebar/OrganizationHeader';

/**
 * Left sidebar component for the notebook layout
 * Displays organization information and lists of workspace and private notes
 */
const LeftSidebar: React.FC = () => {
  const {
    organizations,
    selectedOrg,
    setSelectedOrg,
    isLoading: isLoadingOrg,
    error: orgError,
  } = useOrganization();
  const {
    workspaceNotes,
    privateNotes,
    isLoading: isLoadingNotes,
    error: notesError,
  } = useOrganizationNotes(selectedOrg);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  const handleOrgSelect = (org: Organization) => {
    setSelectedOrg(org);
    setIsOrgDropdownOpen(false);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <OrganizationHeader
        selectedOrg={selectedOrg}
        organizations={organizations}
        isLoading={isLoadingOrg}
        error={orgError}
        isDropdownOpen={isOrgDropdownOpen}
        onDropdownToggle={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
        onOrgSelect={handleOrgSelect}
      />

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Workspace Section */}
        <div className="px-2 py-3">
          <SidebarSection
            action={
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  /* Add workspace handler */
                }}
              >
                <Plus className="h-4 w-4 text-gray-500" />
              </Button>
            }
          >
            Workspace
          </SidebarSection>
          <NoteList
            notes={workspaceNotes}
            isLoading={isLoadingNotes}
            error={notesError}
            skeletonCount={3}
          />
        </div>

        {/* Private Section */}
        <div className="px-2 py-3">
          <SidebarSection
            icon={Lock}
            iconPosition="after"
            action={
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  /* Add private document handler */
                }}
              >
                <Plus className="h-4 w-4 text-gray-500" />
              </Button>
            }
          >
            Private
          </SidebarSection>
          <NoteList
            notes={privateNotes}
            isLoading={isLoadingNotes}
            error={notesError}
            skeletonCount={2}
          />
        </div>
      </div>

      {/* Fixed bottom section */}
      <div className="border-t mt-auto">
        <NotebookToggle isNotebookView={true} />
      </div>
    </div>
  );
};

export default LeftSidebar;
