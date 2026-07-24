'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { NoteList } from '@/components/Notebook/LeftSidebar/NoteList';
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
import { NotePaperWrapper } from './NotePaperWrapper';

interface CreateOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

/**
 * Landing view for the notebook when no specific note is open. Mirrors the
 * "Notebook" dropdown: surfaces the funding-opportunity / proposal creation
 * flows alongside the user's existing files.
 */
export function NotebookHome() {
  const router = useRouter();
  const { notes, isLoading: isLoadingNotes } = useNotebookContext();

  const [isFundingOpportunityModalOpen, setIsFundingOpportunityModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  // Mirror PublishMenu / LeftSidebar: the modal picks a creation method, then we
  // hand off to the notebook page which scaffolds the document from it.
  const handleConfirmOpenGrant = (method: FundingOpportunityCreationMethod) => {
    setIsFundingOpportunityModalOpen(false);
    router.push(`/notebook?newGrant=true&grantSource=${method}`);
  };

  const handleConfirmCreateProposal = (method: ProposalCreationMethod) => {
    setIsProposalModalOpen(false);
    router.push(`/notebook?newFunding=true&proposalSource=${method}`);
  };

  const createOptions: CreateOption[] = [
    {
      id: 'funding-opportunity',
      title: 'Funding Opportunity',
      description: 'Fund specific research you care about',
      icon: <Icon name="fund" size={24} color="#2563eb" />,
      onClick: () => setIsFundingOpportunityModalOpen(true),
    },
    {
      id: 'proposal',
      title: 'Proposal',
      description: 'Crowdfund your research',
      icon: <FundingIcon size={24} color="#2563eb" />,
      onClick: () => setIsProposalModalOpen(true),
    },
    {
      id: 'preprint',
      title: 'Preprint',
      description: 'Publish your research as a preprint',
      icon: <Icon name="submit1" size={24} color="#2563eb" />,
      onClick: () => router.push('/notebook?newResearch=true'),
    },
  ];

  const hasNotes = Boolean(notes?.length);

  return (
    <NotePaperWrapper canvas={false} className="pb-12 pr-6 lg:!pr-16">
      <div className="max-w-2xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">My Notebook</h1>
          <p className="mt-1 text-gray-500">Start something new or jump back into your work.</p>
        </div>

        {/* Create */}
        <div className="mt-8 flex flex-col gap-3">
          {createOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={option.onClick}
              className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 text-left transition-colors hover:border-rhBlue-300 hover:bg-blue-50/50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                {option.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-base font-medium text-gray-900">
                  {option.title}
                  <ArrowRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-rhBlue-500" />
                </div>
                <div className="mt-0.5 text-sm text-gray-500">{option.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Files */}
        <div className="mt-10">
          <h2 className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-gray-400">
            Your files
          </h2>
          {hasNotes || isLoadingNotes ? (
            <NoteList notes={notes || []} isLoading={isLoadingNotes} />
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-400">
              No files yet. Create a funding opportunity, proposal, or preprint to get started.
            </div>
          )}
        </div>
      </div>

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
    </NotePaperWrapper>
  );
}
