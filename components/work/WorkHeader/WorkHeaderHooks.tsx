import { useState, useCallback } from 'react';
import { Work } from '@/types/work';
import { useVote } from '@/hooks/useVote';
import { useUserVotes } from '@/hooks/useUserVotes';
import { useUser } from '@/contexts/UserContext';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import toast from 'react-hot-toast';

export function useWorkVote(work: Work) {
  const { vote, isVoting } = useVote({
    votableEntityId: work.id,
    feedContentType: work.contentType === 'paper' ? 'PAPER' : 'POST',
    relatedDocumentTopics: work.topics,
    relatedDocumentId: work.id.toString(),
    relatedDocumentContentType: work.contentType,
  });

  const [voteCount, setVoteCount] = useState(
    work.metrics?.adjustedScore ?? work.metrics?.votes ?? 0
  );

  const {
    data: userVotes,
    isLoading: isLoadingVotes,
    refresh: refreshVotes,
  } = useUserVotes({
    paperIds: work.contentType === 'paper' ? [work.id] : [],
    postIds:
      work.contentType === 'post' ||
      work.contentType === 'preregistration' ||
      work.contentType === 'funding_request'
        ? [work.id]
        : [],
  });

  const isUpvoted =
    work.contentType === 'paper'
      ? userVotes?.papers[work.id]?.voteType === 'upvote'
      : userVotes?.posts[work.id]?.voteType === 'upvote';

  const isDownvoted =
    work.contentType === 'paper'
      ? userVotes?.papers[work.id]?.voteType === 'downvote'
      : userVotes?.posts[work.id]?.voteType === 'downvote';

  const handleVote = useCallback(
    async (direction: 'up' | 'down') => {
      const wasUpvoted = isUpvoted;
      const wasDownvoted = isDownvoted;

      try {
        let newVoteType: 'UPVOTE' | 'DOWNVOTE' | 'NEUTRAL';
        let countDelta: number;

        if (direction === 'up') {
          if (wasUpvoted) {
            newVoteType = 'NEUTRAL';
            countDelta = -1;
          } else if (wasDownvoted) {
            newVoteType = 'UPVOTE';
            countDelta = 2;
          } else {
            newVoteType = 'UPVOTE';
            countDelta = 1;
          }
        } else {
          if (wasDownvoted) {
            newVoteType = 'NEUTRAL';
            countDelta = 1;
          } else if (wasUpvoted) {
            newVoteType = 'DOWNVOTE';
            countDelta = -2;
          } else {
            newVoteType = 'DOWNVOTE';
            countDelta = -1;
          }
        }

        await vote(newVoteType);
        setVoteCount((prev) => prev + countDelta);
        await refreshVotes();
      } catch (error: any) {
        const isSelfVote =
          error?.status === 403 ||
          error?.response?.status === 403 ||
          error?.detail === 'Can not vote on own content';

        toast.error(
          isSelfVote
            ? 'Cannot vote on your own content'
            : error instanceof Error
              ? error.message
              : 'Unable to process your vote. Please try again.'
        );
      }
    },
    [isUpvoted, isDownvoted, vote, refreshVotes]
  );

  return { voteCount, isVoting, isLoadingVotes, isUpvoted, isDownvoted, handleVote };
}

export function useWorkPermissions(work: Work) {
  const { user } = useUser();
  const { selectedOrg } = useOrganizationContext();

  const isModerator = !!user?.isModerator;
  const isHubEditor = !!user?.authorProfile?.isHubEditor;
  const isAuthor =
    user?.authorProfile != null &&
    work.authors?.some((a) => a.authorProfile.id === user.authorProfile?.id);
  const isGrantContact =
    user?.authorProfile != null &&
    work.contentType === 'funding_request' &&
    work.note?.post?.grant?.contacts?.some(
      (contact) => contact.authorProfile?.id === user.authorProfile?.id
    );

  const canEdit = (() => {
    switch (work.contentType) {
      case 'paper':
        return isModerator || isHubEditor;
      case 'funding_request':
        return isGrantContact || isAuthor || isModerator;
      case 'post':
      case 'preregistration':
        return isAuthor;
      default:
        return !!(selectedOrg && work.note);
    }
  })();

  return { user, selectedOrg, isModerator, isHubEditor, isAuthor, canEdit };
}
