'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Check, Files, PenLine, HelpCircle } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { PostService, ProposalForModal } from '@/services/post.service';
import { GrantService } from '@/services/grant.service';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const ProposalSkeleton = () => (
  <div className="space-y-2 min-w-[550px]">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-3 rounded-xl border-2 border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="h-4 w-16 bg-gray-200 rounded-full animate-pulse mb-1.5"></div>
            <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
        </div>
      </div>
    ))}
  </div>
);

function formatCompactAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${Math.round(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd).toLocaleString()}`;
}

interface ApplyToGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseSelected: (proposal: ProposalForModal) => void;
  grantId: string;
  grantTitle?: string;
  grantAmountUsd?: number;
}

export const ApplyToGrantModal: React.FC<ApplyToGrantModalProps> = ({
  isOpen,
  onClose,
  onUseSelected,
  grantId,
  grantTitle,
  grantAmountUsd,
}) => {
  const [proposals, setProposals] = useState<ProposalForModal[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [draftNewSelected, setDraftNewSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const selectedProposal = proposals.find((p) => p.id === selectedProposalId);

  const handleSelectDraftNew = () => {
    setDraftNewSelected(true);
    setSelectedProposalId(null);
  };

  const handleSelectProposal = (id: string) => {
    setSelectedProposalId(id);
    setDraftNewSelected(false);
  };

  const handleDraftNew = () => {
    onClose();
    router.push('/notebook?newFunding=true');
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedProposalId(null);
      setDraftNewSelected(false);
      if (user?.id) {
        fetchProposals();
      }
    }
  }, [isOpen, user?.id]);

  // Fetch proposals
  const fetchProposals = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const proposals = await PostService.getProposalsByUser(user.id);
      setProposals(proposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      // Show error state or fallback
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle applying to grant with selected proposal
  const handleApplyToGrant = async () => {
    if (!selectedProposal) return;

    setSubmitting(true);
    try {
      await GrantService.applyToGrant(grantId, selectedProposal.postId);
      toast.success('Successfully applied to RFP!');
      onClose();
      onUseSelected(selectedProposal);
    } catch (error) {
      console.error('Error applying to RFP:', error);
      toast.error('Failed to apply to RFP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const headerTitle = (
    <div className="flex flex-col gap-1">
      <span className="text-lg font-medium text-gray-900">Apply to Funding</span>
      {grantTitle && (
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-gray-500 truncate">{grantTitle}</span>
          {grantAmountUsd != null && grantAmountUsd > 0 && (
            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md tabular-nums text-primary-800 bg-primary-200/70 flex-shrink-0">
              {formatCompactAmount(grantAmountUsd)}
            </span>
          )}
        </div>
      )}
    </div>
  );

  const canApply = selectedProposal && !draftNewSelected;

  const footerContent = (
    <Button
      variant="default"
      onClick={draftNewSelected ? handleDraftNew : handleApplyToGrant}
      disabled={draftNewSelected ? submitting : !canApply || submitting}
      className={`w-full ${draftNewSelected ? 'bg-gray-900 hover:bg-black text-white' : ''}`}
      size="lg"
    >
      {draftNewSelected ? (
        <>
          <PenLine size={16} className="mr-2" />
          Start drafting
        </>
      ) : (
        <>
          <Check size={16} className="mr-2" />
          {submitting ? 'Applying...' : 'Apply with selected proposal'}
        </>
      )}
    </Button>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={headerTitle}
      maxWidth="max-w-[600px]"
      padding="p-6"
      footer={footerContent}
    >
      <div className="space-y-3 min-w-[550px]">
        {/* Section title */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Choose how to apply</h3>
          <Tooltip
            content="Proposals are an ideal format for applying to funding. Share your research plan and funding needs upfront."
            position="bottom"
            width="w-72"
          >
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 cursor-help border-b border-dashed border-gray-400">
              <HelpCircle className="w-3 h-3" />
              What is a proposal?
            </span>
          </Tooltip>
        </div>

        {/* Scrollable options list */}
        <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
          {/* Draft new proposal — always first */}
          <div
            onClick={handleSelectDraftNew}
            className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              draftNewSelected
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                <Plus size={20} className="text-gray-500" />
              </div>
              <span className="text-sm font-medium text-gray-900 flex-1">Draft a new proposal</span>
              <input
                type="radio"
                name="proposal-option"
                checked={draftNewSelected}
                onChange={handleSelectDraftNew}
                className="w-4 h-4 flex-shrink-0 text-blue-600 bg-gray-100 border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Existing proposals */}
          {loading ? (
            <ProposalSkeleton />
          ) : proposals.length > 0 ? (
            proposals.map((proposal) => {
              const isSelected = proposal.id === selectedProposalId && !draftNewSelected;
              const isDraft = proposal.status === 'draft';
              const isSelectable = !isDraft;

              return (
                <div
                  key={proposal.id}
                  onClick={() => isSelectable && handleSelectProposal(proposal.id)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    isDraft
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      : isSelected
                        ? 'border-blue-300 bg-blue-50 cursor-pointer'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {isDraft ? (
                          <Badge variant="default" size="sm">
                            Draft
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            Published
                          </Badge>
                        )}
                        {proposal.createdDate && (
                          <>
                            <span className="text-gray-300">&middot;</span>
                            <span className="text-[11px] text-gray-400">
                              {formatDate(proposal.createdDate)}
                            </span>
                          </>
                        )}
                      </div>
                      <h4
                        className={`text-sm font-medium leading-snug ${isDraft ? 'text-gray-500' : 'text-gray-900'}`}
                      >
                        {proposal.title}
                      </h4>
                    </div>
                    <input
                      type="radio"
                      name="proposal-option"
                      value={proposal.id}
                      checked={isSelected}
                      onChange={() => isSelectable && handleSelectProposal(proposal.id)}
                      disabled={isDraft}
                      className={`w-4 h-4 flex-shrink-0 focus:ring-2 ${
                        isDraft
                          ? 'text-gray-400 bg-gray-200 border-gray-300 cursor-not-allowed'
                          : 'text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Files className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Your proposals will appear here</p>
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
};
