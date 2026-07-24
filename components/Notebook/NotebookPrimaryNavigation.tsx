'use client';

import { NoteList } from '@/components/Notebook/LeftSidebar/NoteList';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { UserPlus } from 'lucide-react';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import Icon from '@/components/ui/icons/Icon';

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="px-4 pb-1 pt-1 text-xs font-medium uppercase tracking-wider text-gray-400">
    {children}
  </h3>
);

interface NotebookPrimaryNavigationProps {
  onNewFundingOpportunity: () => void;
  onNewProposal: () => void;
  onNewPreprint: () => void;
  onInvitePeople: () => void;
}

/**
 * Body of the notebook's primary navigation menu (the "My Notebook" dropdown on
 * desktop / full-screen sheet on mobile). Surfaces document-creation entry
 * points, the user's files, and workspace actions.
 *
 * Document-creation actions are delegated to the parent (`NotesMenu`) so it can
 * close the menu before opening a modal or navigating — the modals live there
 * because this component unmounts when the menu closes.
 */
export const NotebookPrimaryNavigation = ({
  onNewFundingOpportunity,
  onNewProposal,
  onNewPreprint,
  onInvitePeople,
}: NotebookPrimaryNavigationProps) => {
  const { selectedOrg } = useOrganizationContext();
  const { notes, isLoading: isLoadingNotes } = useNotebookContext();

  const isCurrentUserAdmin = selectedOrg?.userPermission?.accessType === 'ADMIN';

  const hasNotes = Boolean(notes?.length);

  return (
    <div className="flex flex-col py-1.5 text-sm">
      {/* Create */}
      <SectionHeading>Create</SectionHeading>
      <button
        type="button"
        onClick={onNewFundingOpportunity}
        className="mx-1 flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100"
      >
        <Icon name="fund" size={18} color="#6b7280" />
        <span className="font-medium">New funding opportunity</span>
      </button>
      <button
        type="button"
        onClick={onNewProposal}
        className="mx-1 flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100"
      >
        <FundingIcon size={18} color="#6b7280" />
        <span className="font-medium">New proposal</span>
      </button>
      <button
        type="button"
        onClick={onNewPreprint}
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
        onClick={onInvitePeople}
        disabled={!isCurrentUserAdmin}
        title={isCurrentUserAdmin ? undefined : 'Only admins can invite members'}
        className="mx-1 flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <UserPlus className="h-4 w-4 text-gray-500" />
        <span>Invite people</span>
      </button>
    </div>
  );
};
