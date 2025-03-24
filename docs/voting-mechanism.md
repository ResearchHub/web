# Voting Mechanism in ResearchHub

This document outlines the voting mechanism used in the ResearchHub codebase.

## Overview

The voting mechanism in ResearchHub is designed to be flexible and reusable across different content types. It consists of several components:

1. **CommentService**: A service that handles the API calls for voting.
2. **useVote**: A hook that provides voting functionality to components.
3. **UpvoteAndCommentButton**: A versatile button for upvoting and commenting that can work in two modes:
   - Direct callback mode: Uses onUpvote and onComment callbacks
   - Votable entity mode: Uses CommentService to handle voting with votableEntityId, documentId, and contentType

## Components

### CommentService

The `CommentService` is responsible for making API calls to vote on content. It handles the following:

- Making API calls to vote on content based on the vote type (upvote, downvote, or neutral)
- Handling different content types through the appropriate endpoints

```typescript
// services/comment.service.ts
export class CommentService {
  static async voteComment({
    commentId,
    documentId,
    voteType,
    contentType,
  }: VoteCommentOptions): Promise<any> {
    // Implementation
  }
}
```

### useVote Hook

The `useVote` hook provides a reusable way to handle voting functionality across different components. It uses the `CommentService` to make API calls and handles optimistic updates.

```typescript
// hooks/useVote.ts
export function useVote({ documentId, contentType, onVoteSuccess, onVoteError }: UseVoteOptions) {
  // Implementation
  return {
    vote,
    isVoting,
  };
}
```

### UpvoteAndCommentButton

The `UpvoteAndCommentButton` is a versatile component that can work in two modes:

1. **Direct callback mode**: Uses `onUpvote` and `onComment` callbacks
2. **Votable entity mode**: Uses `CommentService` to handle voting with `votableEntityId`, `documentId`, and `contentType`

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
  // Implementation
};
```

### Using UpvoteAndCommentButton

The `UpvoteAndCommentButton` is the recommended way to add voting functionality to components. It handles authentication, optimistic updates, and error handling.

#### Direct Callback Mode

```tsx
<UpvoteAndCommentButton
  onUpvote={() => handleUpvote(item.id)}
  onComment={() => handleComment(item.id)}
  isUpvoted={item.userVote === 'UPVOTE'}
  upvoteCount={item.score}
  commentCount={item.commentCount}
/>
```

#### Votable Entity Mode

```tsx
<UpvoteAndCommentButton
  votableEntityId={item.id}
  documentId={documentId}
  contentType={contentType}
  userVote={item.userVote}
  score={item.score}
  onComment={() => handleComment(item.id)}
  commentCount={item.commentCount}
  onVoteSuccess={(updatedItem) => {
    // Handle optimistic update
  }}
/>
```

## Integration with Renderers

The voting mechanism is integrated with the renderer pattern used in the codebase. The `CommentRenderer` and `BountyRenderer` use the `UpvoteAndCommentButton` when appropriate.

### CommentRenderer

```tsx
<UpvoteAndCommentButton
  votableEntityId={comment.id}
  documentId={documentId}
  contentType={contentType}
  userVote={comment.userVote}
  score={comment.score}
  onComment={() => onReply && onReply(comment.id)}
  commentCount={commentCount}
/>
```

### BountyRenderer

```tsx
<BountyActions
  // Other props...
  votableEntityId={votableEntityId}
  documentId={documentId}
  contentType={contentType}
  userVote={userVote}
  score={score}
/>
```

## Implementation Details

1. **Optimistic Updates**: The `useVote` hook handles optimistic updates by updating the UI before the API call completes.
2. **Error Handling**: The `useVote` hook handles errors and displays appropriate toast messages.
3. **Score Calculation**: The `useVote` hook calculates the score change based on the previous and new vote states.
4. **Authentication**: The `UpvoteAndCommentButton` handles authentication using the `useAuthenticatedAction` hook.

## Conclusion

The voting mechanism in ResearchHub is designed to be flexible and reusable across different content types. It provides a consistent user experience and handles common edge cases like authentication and error handling.

## Future Improvements

1. **Downvoting**: Add support for downvoting.
2. **Vote Count Animation**: Add animations for vote count changes.
3. **Caching**: Implement caching to reduce API calls.
4. **Offline Support**: Add support for offline voting.
