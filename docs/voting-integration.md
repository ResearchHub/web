# Voting Integration

This document outlines how we integrated the voting mechanism into the ResearchHub codebase.

## Overview

We've enhanced the `UpvoteAndCommentButton` component to support both direct callback mode and votable entity mode (using CommentService). This provides a complete voting solution that can be used across different content types.

## Implementation Steps

### 1. Created CommentService.voteComment

We created a method in the CommentService to handle voting on comments:

```typescript
// services/comment.service.ts
static async voteComment({
  commentId,
  documentId,
  voteType,
  contentType,
}: VoteCommentOptions): Promise<any> {
  const contentTypePath = getContentTypePath(contentType);
  let endpoint = '';

  if (voteType === 'UPVOTE') {
    endpoint = `/${contentTypePath}/${documentId}/comments/${commentId}/upvote/`;
  } else if (voteType === 'DOWNVOTE') {
    endpoint = `/${contentTypePath}/${documentId}/comments/${commentId}/downvote/`;
  } else {
    endpoint = `/${contentTypePath}/${documentId}/comments/${commentId}/neutralvote/`;
  }

  return ApiClient.post(this.BASE_PATH + endpoint);
}
```

### 2. Created useVote Hook

We created a hook that uses the CommentService to handle voting:

```typescript
// hooks/useVote.ts
export function useVote({ documentId, contentType, onVoteSuccess, onVoteError }: UseVoteOptions) {
  const [isVoting, setIsVoting] = useState(false);
  const { data: session } = useSession();

  const vote = useCallback(
    async (
      item: { id: number; userVote?: UserVoteType; score?: number },
      voteType: UserVoteType
    ) => {
      // Don't allow voting if not logged in
      if (!session?.user) {
        toast.error('Please sign in to vote');
        return;
      }

      // Don't allow multiple votes at once
      if (isVoting) return;

      try {
        setIsVoting(true);

        // Create an optimistically updated version of the item
        const updatedItem = { ...item };

        // Calculate score change based on previous and new vote states
        let scoreChange = 0;

        if (voteType === 'UPVOTE' && item.userVote !== 'UPVOTE') {
          // Adding an upvote
          scoreChange = 1;
        } else if (voteType === 'NEUTRAL' && item.userVote === 'UPVOTE') {
          // Removing an upvote
          scoreChange = -1;
        }

        // Update the optimistic item with the new vote state
        updatedItem.userVote = voteType;
        updatedItem.score = (item.score || 0) + scoreChange;

        // Call the success callback with the optimistically updated item
        if (onVoteSuccess) {
          onVoteSuccess(updatedItem, voteType);
        }

        // Make the API call
        await CommentService.voteComment({
          commentId: item.id,
          documentId,
          voteType,
          contentType,
        });
      } catch (error: any) {
        console.error('Error voting:', error);

        // Handle specific error cases
        if (error?.status === 403) {
          toast.error('Cannot vote on your own content');
        } else {
          toast.error('Failed to vote. Please try again.');
        }

        // Call the error callback
        if (onVoteError) {
          onVoteError(error);
        }
      } finally {
        setIsVoting(false);
      }
    },
    [documentId, contentType, isVoting, session, onVoteSuccess, onVoteError]
  );

  return {
    vote,
    isVoting,
  };
}
```

### 3. Enhanced UpvoteAndCommentButton

We enhanced the `UpvoteAndCommentButton` component to support both direct callback mode and votable entity mode:

```typescript
// components/ui/UpvoteAndCommentButton.tsx
export const UpvoteAndCommentButton: FC<UpvoteAndCommentButtonProps> = ({
  // Rendering options
  className,
  isUpvoted: propIsUpvoted,
  upvoteCount: propUpvoteCount = 0,
  commentCount = 0,

  // Direct callback mode
  onUpvote,
  onComment,

  // Votable entity mode
  votableEntityId,
  documentId,
  contentType,
  userVote,
  score,
  onVoteSuccess,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [isVotingLocally, setIsVotingLocally] = useState(false);

  // Determine if we're in votable mode
  const isVotableMode = votableEntityId !== undefined && documentId !== undefined && contentType !== undefined;

  // Use the vote hook if in votable mode
  const { vote, isVoting: isVotingFromHook } = useVote({
    documentId: documentId || 0,
    contentType: contentType || 'paper',
    onVoteSuccess,
  });

  // Determine the effective upvote state and count
  const effectiveIsUpvoted = isVotableMode ? userVote === 'UPVOTE' : propIsUpvoted;
  const effectiveUpvoteCount = isVotableMode ? (score || 0) : propUpvoteCount;
  const isVoting = isVotingLocally || isVotingFromHook;

  // Handle voting based on the mode
  const handleVote = () => {
    if (isVoting) return;

    if (isVotableMode && votableEntityId) {
      executeAuthenticatedAction(() => {
        const newVoteType: UserVoteType = effectiveIsUpvoted ? 'NEUTRAL' : 'UPVOTE';
        vote({ id: votableEntityId, userVote, score }, newVoteType);
      });
    } else if (onUpvote) {
      setIsVotingLocally(true);
      onUpvote();
      setTimeout(() => setIsVotingLocally(false), 300);
    }
  };

  return (
    // Component JSX
  );
};
```

## Integration with Renderers

### CommentRenderer

We updated the `CommentRenderer` to use the enhanced `UpvoteAndCommentButton` component:

```tsx
// components/Feed/registry/CommentRenderer.tsx
{
  documentId ? (
    <UpvoteAndCommentButton
      votableEntityId={comment.id}
      documentId={documentId}
      contentType={contentType}
      userVote={comment.userVote}
      score={comment.score}
      onComment={() => onReply && onReply(comment.id)}
      commentCount={commentCount}
    />
  ) : (
    <UpvoteAndCommentButton
      onUpvote={() => onUpvote && onUpvote(comment.id)}
      onComment={() => onReply && onReply(comment.id)}
      isUpvoted={comment.userVote === 'UPVOTE'}
      upvoteCount={upvoteCount}
      commentCount={commentCount}
    />
  );
}
```

### BountyActions

We updated the `BountyActions` component to use the enhanced `UpvoteAndCommentButton` component:

```tsx
// components/Bounty/BountyActions.tsx
<UpvoteAndCommentButton
  // Direct callback props
  onUpvote={onUpvote}
  onComment={onComment}
  isUpvoted={isUpvoted}
  upvoteCount={upvoteCount}
  commentCount={commentCount}
  // Votable entity props
  votableEntityId={votableEntityId}
  documentId={documentId}
  contentType={contentType}
  userVote={userVote}
  score={score}
/>
```

## Benefits

1. **Reusability**: The voting mechanism can be used across different content types.
2. **Optimistic Updates**: The `useVote` hook provides optimistic updates for a better user experience.
3. **Error Handling**: The hook handles errors and displays toast messages.
4. **Authentication**: The `UpvoteAndCommentButton` handles authentication using the `useAuthenticatedAction` hook.
5. **Flexibility**: The mechanism can be used with different UI components.

## Conclusion

By enhancing the `UpvoteAndCommentButton` component to support both direct callback mode and votable entity mode, we've created a flexible and reusable voting mechanism that can be used across different content types in the ResearchHub codebase.
