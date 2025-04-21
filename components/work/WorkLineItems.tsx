'use client';

import { useState, useCallback } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  ArrowUp,
  Download,
  Flag,
  Edit,
  Share2,
  MoreHorizontal,
  Coins,
  UserPlus,
  Bookmark,
} from 'lucide-react';
import { Work } from '@/types/work';
import { AuthorList } from '@/components/ui/AuthorList';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useVote } from '@/hooks/useVote';
import { useUserVotes } from '@/hooks/useUserVotes';
import toast from 'react-hot-toast';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TipContentModal } from '@/components/modals/TipContentModal';
import { Icon } from '@/components/ui/icons/Icon';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';

interface WorkLineItemsProps {
  work: Work;
  showClaimButton?: boolean;
  insightsButton?: React.ReactNode;
}

export const WorkLineItems = ({
  work,
  showClaimButton = true,
  insightsButton,
}: WorkLineItemsProps) => {
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { vote, isVoting } = useVote({
    votableEntityId: work.id,
    feedContentType: work.contentType === 'paper' ? 'PAPER' : 'POST',
  });
  const [voteCount, setVoteCount] = useState(work.metrics?.votes || 0);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const router = useRouter();
  const { selectedOrg } = useOrganizationContext();

  const {
    data: userVotes,
    isLoading: isLoadingVotes,
    refresh: refreshVotes,
  } = useUserVotes({
    paperIds: work.contentType === 'paper' ? [work.id] : [],
    postIds: work.contentType === 'post' || work.contentType === 'preregistration' ? [work.id] : [],
  });

  const isUpvoted =
    work.contentType === 'paper'
      ? userVotes?.papers[work.id]?.voteType === 'upvote'
      : userVotes?.posts[work.id]?.voteType === 'upvote';

  const handleVote = useCallback(async () => {
    const wasUpvoted = isUpvoted;

    try {
      await vote(wasUpvoted ? 'NEUTRAL' : 'UPVOTE');

      setVoteCount((prevCount) => (wasUpvoted ? prevCount - 1 : prevCount + 1));

      await refreshVotes();
    } catch (error: any) {
      // Check if it's a 403 error or contains the specific error message
      if (
        error?.status === 403 ||
        (error?.response && error?.response?.status === 403) ||
        (typeof error === 'object' && error?.detail === 'Can not vote on own content')
      ) {
        toast.error('Cannot vote on your own content');
      } else {
        // For other errors, show a generic message
        toast.error(
          error instanceof Error ? error.message : 'Unable to process your vote. Please try again.'
        );
      }
    }
  }, [work.contentType, work.id, isUpvoted, vote, refreshVotes]);

  const handleEdit = useCallback(() => {
    if (selectedOrg && work.note) {
      router.push(`/notebook/${work.note.organization.slug}/${work.note.id}`);
    } else {
      toast.error('Unable to edit');
    }
  }, [work.contentType, work.note, selectedOrg, router]);

  const handleTipSuccess = (amount: number) => {
    toast.success(`Successfully tipped ${amount} RSC`);
    setIsTipModalOpen(false);
  };

  return (
    <div>
      {/* Primary Actions */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => executeAuthenticatedAction(handleVote)}
            disabled={isVoting || isLoadingVotes}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isUpvoted
                ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            } ${isVoting || isLoadingVotes ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ArrowUp className={`h-4 w-4`} />
            <span>{voteCount}</span>
          </button>

          <button
            onClick={() => executeAuthenticatedAction(() => setIsTipModalOpen(true))}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Icon name="tipRSC" size={20} />
            <span>Tip RSC</span>
          </button>

          {/* Render insights button if provided */}
          {insightsButton}

          {/* More Actions Dropdown */}
          <Menu as="div" className="relative">
            <MenuButton className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <MoreHorizontal className="h-5 w-5" />
            </MenuButton>

            <MenuItems className="absolute left-0 mt-2 w-48 origin-top-left bg-white rounded-lg shadow-lg border border-gray-200 py-1 focus:outline-none">
              <MenuItem>
                <Button
                  variant="ghost"
                  disabled={!selectedOrg || !work.note}
                  onClick={handleEdit}
                  className="w-full justify-start"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  <span>Edit</span>
                </Button>
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <Button
                    variant="ghost"
                    onClick={() => executeAuthenticatedAction(() => setIsFlagModalOpen(true))}
                    className={`${focus ? 'bg-gray-50' : ''} w-full justify-start`}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    <span>Flag Content</span>
                  </Button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 space-y-2 text-sm text-gray-600">
        <div>
          <div className="flex items-start">
            <span className="font-medium text-gray-900 w-24">Authors</span>
            <div className="flex-1">
              <div className="mb-1.5">
                <AuthorList
                  authors={work.authors.map((authorship) => ({
                    name: authorship.authorProfile.fullName,
                    verified: authorship.authorProfile.user?.isVerified,
                    profileUrl: `/author/${authorship.authorProfile.id}`,
                  }))}
                  size="sm"
                  className="inline-flex items-center text-gray-600 font-medium"
                  delimiterClassName="mx-2 text-gray-400"
                  delimiter="•"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Journal */}
        {work.journal && (
          <div className="flex items-start">
            <span className="font-medium text-gray-900 w-24">Journal</span>
            <div className="flex-1">
              <span>{work.journal.name}</span>
            </div>
          </div>
        )}

        {/* Published Date */}
        {work.publishedDate && (
          <div className="flex items-start">
            <span className="font-medium text-gray-900 w-24">Published</span>
            <div className="flex-1">
              <span>
                {new Date(work.publishedDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      <FlagContentModal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        documentId={work.id.toString()}
        workType={work.contentType}
      />

      {/* Tip Modal */}
      <TipContentModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        contentId={work.id}
        feedContentType={work.contentType === 'paper' ? 'PAPER' : 'POST'}
        onTipSuccess={handleTipSuccess}
      />
    </div>
  );
};
