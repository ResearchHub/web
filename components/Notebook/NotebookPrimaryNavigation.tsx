'use client';

import { NoteList } from '@/components/Notebook/LeftSidebar/NoteList';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { OrganizationSettingsModal } from '@/components/modals/OrganizationSettingsModal';
import { useNotebookContext } from '@/contexts/NotebookContext';
import {
  OpenFundingOpportunityModal,
  type FundingOpportunityCreationMethod,
} from '@/components/Funding/OpenFundingOpportunityModal';
import {
  OpenProposalModal,
  type ProposalCreationMethod,
} from '@/components/Funding/OpenProposalModal';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import Icon from '@/components/ui/icons/Icon';

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="px-4 pb-1 pt-1 text-xs font-medium uppercase tracking-wider text-gray-400">
    {children}
  </h3>
);

/**
 * Body of the notebook's primary navigation menu (the "My Notebook" dropdown on
 * desktop / full-screen sheet on mobile). Surfaces document-creation entry
 * points, the user's files, and workspace actions.
 */
export const NotebookPrimaryNavigation = () => {
  const router = useRouter();

  const { selectedOrg } = useOrganizationContext();
  const { notes, isLoading: isLoadingNotes } = useNotebookContext();

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFundingOpportunityModalOpen, setIsFundingOpportunityModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  const isCurrentUserAdmin = selectedOrg?.userPermission?.accessType === 'ADMIN';

  // Mirror PublishMenu: the modal picks a creation method, then we hand off to
  // the notebook page which scaffolds the document from that method.
  const handleConfirmOpenGrant = (method: FundingOpportunityCreationMethod) => {
    setIsFundingOpportunityModalOpen(false);
    router.push(`/notebook?newGrant=true&grantSource=${method}`);
  };

  const handleConfirmCreateProposal = (method: ProposalCreationMethod) => {
    setIsProposalModalOpen(false);
    router.push(`/notebook?newFunding=true&proposalSource=${method}`);
  };

  const hasNotes = notes?.some((n) => n.access === 'WORKSPACE' || n.access === 'SHARED');

  return (
    <div className="flex flex-col py-1.5 text-sm">
      {/* Create */}
      <SectionHeading>Create</SectionHeading>
      <button
        type="button"
        onClick={() => setIsFundingOpportunityModalOpen(true)}
        className="mx-1 flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100"
      >
        <Icon name="fund" size={18} color="#6b7280" />
        <span className="font-medium">New funding opportunity</span>
      </button>
      <button
        type="button"
        onClick={() => setIsProposalModalOpen(true)}
        className="mx-1 flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100"
      >
        <FundingIcon size={18} color="#6b7280" />
        <span className="font-medium">New proposal</span>
      </button>
      <button
        type="button"
        onClick={() => router.push('/notebook?newResearch=true')}
        className="mx-1 flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100"
      >
        <Icon name="submit1" size={18} color="#6b7280" />
        <span className="font-medium">New preprint</span>
      </button>

      <div className="my-1.5 border-t border-gray-200" />

      {/* Files */}
      <SectionHeading>Files</SectionHeading>
      <div className="overflow-y-auto px-1 sm:max-h-[320px]">
        {hasNotes || isLoadingNotes ? (
          <NoteList notes={notes || []} isLoading={isLoadingNotes} />
        ) : (
          <div className="px-3 py-6 text-center text-sm text-gray-400">No notes yet</div>
        )}
      </div>

      <div className="my-1.5 border-t border-gray-200" />

      {/* Workspace */}
      <SectionHeading>Workspace</SectionHeading>
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

      <OpenFundingOpportunityModal
        isOpen={isFundingOpportunityModalOpen}
        onClose={() => setIsFundingOpportunityModalOpen(false)}
        onConfirm={handleConfirmOpenGrant}
        minimal
      />

      <OpenProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onConfirm={handleConfirmCreateProposal}
        minimal
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
