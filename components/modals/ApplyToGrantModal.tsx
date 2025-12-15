'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  List,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  Info,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { PostService, ProposalForModal } from '@/services/post.service';
import { GrantService } from '@/services/grant.service';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Loading skeleton component for proposals
const ProposalSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-4 rounded-xl border-2 border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse flex-shrink-0 mt-0.5"></div>
            <div className="flex-1">
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

interface ApplyToGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseSelected: (proposal: ProposalForModal) => void;
  grantId: string;
}

export const ApplyToGrantModal: React.FC<ApplyToGrantModalProps> = ({
  isOpen,
  onClose,
  onUseSelected,
  grantId,
}) => {
  const [showProposalList, setShowProposalList] = useState(false);
  const [proposals, setProposals] = useState<ProposalForModal[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const selectedProposal = proposals.find((p) => p.id === selectedProposalId);

  // Handle navigation to draft new proposal
  const handleDraftNew = () => {
    onClose(); // Close the modal first
    router.push('/notebook?newFunding=true');
  };

  // Reset internal state when modal is opened or closed
  useEffect(() => {
    if (isOpen) {
      setShowProposalList(false);
      setSelectedProposalId(null);
      // Fetch proposals when modal opens to avoid latency
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

  // Handle selecting existing proposals
  const handleSelectExisting = () => {
    setShowProposalList(true);
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

  const backButton = showProposalList ? (
    <Button
      onClick={() => setShowProposalList(false)}
      variant="ghost"
      size="icon"
      className="text-gray-400 hover:text-gray-500"
      aria-label="Back"
    >
      <ChevronLeft className="h-5 w-5" />
    </Button>
  ) : undefined;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={showProposalList ? 'Select Proposal' : 'Apply to RFP'}
      headerAction={backButton}
      maxWidth="max-w-lg"
      padding="p-6"
    >
      <div className="space-y-10">
        {!showProposalList ? (
          <>
            {/* Description */}
            <div className="space-y-3">
              <p className="text-base text-gray-700 font-medium leading-relaxed">
                Applying to RFPs on ResearchHub happens via proposals.
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSelectExisting}
                className="inline-flex items-center rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-gray-700 py-2 w-full h-14 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group justify-start px-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                    <List className="text-blue-600" size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Select existing proposal</div>
                    <div className="text-xs text-gray-500">Choose from your published work</div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleDraftNew}
                className="inline-flex items-center rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-white focus-visible:ring-primary-500 py-2 w-full h-14 bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 group shadow-lg justify-start px-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors flex-shrink-0">
                    <Plus className="text-white" size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">Create new proposal</div>
                    <div className="text-xs text-blue-100">Draft and publish a new proposal</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Info section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl"></div>
              <div className="relative bg-blue-50/80 backdrop-blur-sm border-2 border-blue-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold text-blue-900">What is a Proposal?</h4>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Documenting and sharing your research plan before conducting research as well
                      as specifying funding requirements. We believe open access proposals are the
                      perfect format for RFP applications.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Header section for proposal list */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-book-open w-6 h-6 text-green-600"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Your Published Proposals</h3>
                  <p className="text-sm text-gray-500">Select one to apply with</p>
                </div>
              </div>
            </div>

            {/* Proposal list */}
            <div className="space-y-3">
              {loading ? (
                <ProposalSkeleton />
              ) : proposals.length > 0 ? (
                proposals.map((proposal) => {
                  const isSelected = proposal.id === selectedProposalId;
                  const isDraft = proposal.status === 'draft';
                  const isSelectable = !isDraft;

                  return (
                    <div
                      key={proposal.id}
                      onClick={() => isSelectable && setSelectedProposalId(proposal.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        isDraft
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                          : isSelected
                            ? 'border-blue-300 bg-blue-50 cursor-pointer'
                            : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="proposal"
                            value={proposal.id}
                            checked={isSelected && !isDraft}
                            onChange={() => isSelectable && setSelectedProposalId(proposal.id)}
                            disabled={isDraft}
                            className={`w-4 h-4 mt-1 flex-shrink-0 focus:ring-2 ${
                              isDraft
                                ? 'text-gray-400 bg-gray-200 border-gray-300 cursor-not-allowed'
                                : 'text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500'
                            }`}
                          />
                          <div className="flex-1">
                            <h4
                              className={`font-medium leading-tight ${isDraft ? 'text-gray-500' : 'text-gray-900'}`}
                            >
                              {proposal.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {isDraft ? (
                                <>
                                  <CircleIcon size={14} className="text-gray-400" />
                                  <span className="text-xs text-gray-500 font-medium">Draft</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircleIcon size={14} className="text-green-500" />
                                  <span className="text-xs text-green-600 font-medium">
                                    Published
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-8 h-8 text-gray-400"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10,9 9,9 8,9" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">You have no proposals yet.</p>
                  <button
                    onClick={handleDraftNew}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Create your first proposal
                  </button>
                </div>
              )}
            </div>

            {/* Action buttons for second screen */}
            {!loading && proposals.filter((p) => p.status === 'published').length > 0 && (
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleApplyToGrant}
                  disabled={!selectedProposal || submitting}
                  className="w-full"
                  size="lg"
                >
                  <Check size={16} className="mr-2" />
                  {submitting ? 'Applying...' : 'Apply with selected proposal'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleDraftNew}
                  className="w-full"
                  size="lg"
                  disabled={submitting}
                >
                  <Plus size={16} className="mr-2" />
                  Draft new proposal instead
                </Button>
              </div>
            )}

            {/* Show only "Draft New" button when there are only drafts */}
            {!loading &&
              proposals.length > 0 &&
              proposals.filter((p) => p.status === 'published').length === 0 && (
                <div className="flex justify-center pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleDraftNew}
                    className="w-full"
                    size="lg"
                    disabled={submitting}
                  >
                    <Plus size={16} className="mr-2" />
                    Publish a proposal to apply
                  </Button>
                </div>
              )}

            {/* Loading state action buttons */}
            {loading && (
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            )}
          </>
        )}
      </div>
    </BaseModal>
  );
};
