'use client';

import { useState, useCallback, useEffect } from 'react';
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
import { ClaimModal } from '@/components/modals/ClaimModal';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { DocumentType } from '@/types/vote';
import { useVote } from '@/hooks/useVote';
import { useUserVotes } from '@/hooks/useVote';

interface WorkLineItemsProps {
  work: Work;
  showClaimButton?: boolean;
}

export const WorkLineItems = ({ work, showClaimButton = true }: WorkLineItemsProps) => {
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [{ isLoading: isVoting }, vote] = useVote();
  const [voteCount, setVoteCount] = useState(work.metrics.votes);

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
    const documentType: DocumentType = work.contentType === 'paper' ? 'paper' : 'researchhubpost';
    const wasUpvoted = isUpvoted;

    try {
      await vote({
        documentType,
        documentId: work.id,
        voteType: wasUpvoted ? 'neutralvote' : 'upvote',
      });
      await refreshVotes();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setVoteCount((prev) => prev + (wasUpvoted ? -1 : 1));
    }
  }, [work.contentType, work.id, isUpvoted, vote, refreshVotes]);

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
            <ArrowUp className={`h-4 w-4 ${isUpvoted ? 'fill-current' : ''}`} />
            <span>{voteCount}</span>
          </button>

          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isSaved
                ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100">
            <Coins className="h-4 w-4" />
            <span>Tip RSC</span>
          </button>

          {/* More Actions Dropdown */}
          <Menu as="div" className="relative">
            <MenuButton className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <MoreHorizontal className="h-5 w-5" />
            </MenuButton>

            <MenuItems className="absolute left-0 mt-2 w-48 origin-top-left bg-white rounded-lg shadow-lg border border-gray-200 py-1 focus:outline-none">
              <MenuItem>
                {({ focus }) => (
                  <button
                    className={`${
                      focus ? 'bg-gray-50' : ''
                    } flex items-center space-x-2 px-4 py-2 text-gray-700 w-full text-left`}
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    className={`${
                      focus ? 'bg-gray-50' : ''
                    } flex items-center space-x-2 px-4 py-2 text-gray-700 w-full text-left`}
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    className={`${
                      focus ? 'bg-gray-50' : ''
                    } flex items-center space-x-2 px-4 py-2 text-gray-700 w-full text-left`}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() =>
                      executeAuthenticatedAction(() => {
                        console.log('Flag content clicked:', work.id);
                      })
                    }
                    className={`${
                      focus ? 'bg-gray-50' : ''
                    } flex items-center space-x-2 px-4 py-2 text-gray-700 w-full text-left`}
                  >
                    <Flag className="h-4 w-4" />
                    <span>Flag Content</span>
                  </button>
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
              {showClaimButton && (
                <button
                  onClick={() => setClaimModalOpen(true)}
                  className="flex items-center space-x-1 text-orange-500 hover:text-orange-600"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Claim profile and earn rewards</span>
                </button>
              )}
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

      {showClaimButton && (
        <ClaimModal isOpen={claimModalOpen} onClose={() => setClaimModalOpen(false)} />
      )}
    </div>
  );
};
