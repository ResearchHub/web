'use client';

import { useState, useCallback } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ArrowUp, Flag, Edit, MoreHorizontal } from 'lucide-react';
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
import { PaperService } from '@/services/paper.service';
import { useUser } from '@/contexts/UserContext';
import { Contact } from '@/types/note';
import { WorkEditModal } from './WorkEditModal';
import { WorkMetadata } from '@/services/metadata.service';
import { SaveContentButton } from '@/components/UserSaved/SaveContentButton';
import { FeatureFlag, isFeatureEnabled } from '@/utils/featureFlags';

interface WorkLineItemsProps {
  work: Work;
  showClaimButton?: boolean;
  insightsButton?: React.ReactNode;
  metadata: WorkMetadata;
}

export const WorkLineItems = ({
  work,
  showClaimButton = true,
  insightsButton,
  metadata,
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
  const { user } = useUser();
  const [isWorkEditModalOpen, setIsWorkEditModalOpen] = useState(false);

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
    if (work.contentType === 'paper' && user?.isModerator) {
      setIsWorkEditModalOpen(true);
    } else if (selectedOrg && work.note) {
      router.push(`/notebook/${work.note.organization.slug}/${work.note.id}`);
    } else {
      toast.error('Unable to edit');
    }
  }, [work.contentType, work.note, selectedOrg, router, user]);

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
                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            } ${isVoting || isLoadingVotes ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ArrowUp className={`h-4 w-4`} />
            <span>{voteCount}</span>
          </button>

          {work.contentType !== 'preregistration' && (
            <button
              onClick={() => executeAuthenticatedAction(() => setIsTipModalOpen(true))}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Icon name="tipRSC" size={20} />
              <span>Tip RSC</span>
            </button>
          )}

          {isFeatureEnabled(FeatureFlag.UserSavedLists) && (
            <SaveContentButton
              styling="work_item"
              userSavedIdentifier={{ id: work.id, idType: 'paperId' }}
            />
          )}

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
                  disabled={
                    work.contentType === 'paper' ? !isModerator : !selectedOrg || !work.note
                  }
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

      {/* Authors/Contacts */}
      <div className="mt-6 space-y-2 text-sm text-gray-600">
        <div>
          {work.contentType === 'funding_request' ? (
            // Only render if there is an organization OR at least one contact
            work.note?.post?.grant?.organization ||
            (work.note?.post?.grant?.contacts && work.note.post.grant.contacts.length > 0) ? (
              <div className="flex items-start">
                <span className="font-medium text-gray-900 w-28">
                  Funder{work.note?.post?.grant?.organization ? '' : '(s)'}
                </span>
                <div className="flex-1">
                  {work.note?.post?.grant?.organization ? (
                    <span>{work.note.post.grant.organization}</span>
                  ) : (
                    <AuthorList
                      authors={
                        work.note?.post?.grant?.contacts?.map((contact: Contact) => ({
                          name: contact.authorProfile?.fullName || contact.name,
                          verified: contact.authorProfile?.user?.isVerified,
                          profileUrl: contact.authorProfile
                            ? `/author/${contact.authorProfile?.id}`
                            : undefined,
                          authorUrl: contact.authorProfile?.user
                            ? `/author/${contact.authorProfile?.id}`
                            : undefined,
                        })) || []
                      }
                      size="sm"
                      className="inline-flex items-center text-gray-600 font-medium"
                      delimiterClassName="mx-2 text-gray-400"
                      delimiter="•"
                    />
                  )}
                </div>
              </div>
            ) : null
          ) : (
            // NON-GRANT: Authors section
            <div className="flex items-start">
              <span className="font-medium text-gray-900 w-28">Authors</span>
              <div className="flex-1">
                <AuthorList
                  authors={work.authors.map((authorship) => ({
                    name: authorship.authorProfile.fullName,
                    verified: authorship.authorProfile.user?.isVerified,
                    profileUrl: `/author/${authorship.authorProfile.id}`,
                    authorUrl: authorship.authorProfile.user
                      ? `/author/${authorship.authorProfile.id}`
                      : undefined,
                  }))}
                  size="sm"
                  className="inline-flex items-center text-gray-600 font-medium"
                  delimiterClassName="mx-2 text-gray-400"
                  delimiter="•"
                />
              </div>
            </div>
          )}
        </div>

        {/* Journal */}
        {work.journal && (
          <div className="flex items-start">
            <span className="font-medium text-gray-900 w-28">Journal</span>
            <div className="flex-1">
              <span>{work.journal.name}</span>
            </div>
          </div>
        )}

        {/* Published Date */}
        {work.publishedDate && (
          <div className="flex items-start">
            <span className="font-medium text-gray-900 w-28">Published</span>
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

      {work.contentType === 'paper' && (
        <WorkEditModal
          isOpen={isWorkEditModalOpen}
          onClose={() => setIsWorkEditModalOpen(false)}
          work={work}
          metadata={metadata}
        />
      )}
    </div>
  );
};
