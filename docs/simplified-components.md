# Simplified Components

This document outlines the simplifications made to the CommentCard and BountyCard components in the ResearchHub codebase.

## Overview

We've simplified the components to make them more straightforward and easier to maintain. The key changes include:

1. **Removed Unnecessary Props**: Removed props that weren't essential to the components' functionality.
2. **Fixed Linter Errors**: Removed properties that were causing linter errors.
3. **Simplified Interfaces**: Made the component interfaces more intuitive and focused.

## CommentCard Component

### Before

```typescript
interface CommentCardProps {
  comment: Comment;
  contentType: ContentType;
  isReplying?: boolean;
  // ... other props
  debug?: boolean;
  documentId?: number;
  handleVoteInternally?: boolean;
  onVoteSuccess?: (updatedComment: Comment, voteType: UserVoteType) => void;
}
```

### After

```typescript
interface CommentCardProps {
  comment: Comment;
  isReplying?: boolean;
  // ... other props
  onUpvote?: (commentId: number) => void;
}
```

## BountyCard Component

### Before

```typescript
export interface BountyCardProps {
  // ... other props
  handleVoteInternally?: boolean;
  onVoteSuccess?: (updatedBounty: Bounty, voteType: UserVoteType) => void;
}
```

### After

```typescript
export interface BountyCardProps {
  // ... other props
  onUpvote?: (bountyId: number) => void;
}
```

## VoteButton Component

We've also simplified the VoteButton component by:

1. Removing the dependency on external utilities
2. Adding a simple `cn` function directly in the file
3. Focusing on the core functionality of voting

```typescript
// Simple utility function for combining class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};
```

## Benefits

1. **Cleaner Code**: The components are now more focused and easier to understand.
2. **Fewer Dependencies**: Components have fewer dependencies on external utilities and contexts.
3. **Simplified Props**: The props are more intuitive and focused on the components' core functionality.
4. **Fixed Linter Errors**: Removed properties that were causing linter errors.
5. **Better Developer Experience**: The simplified API is more intuitive and requires less boilerplate.

## Usage

The simplified components can be used as follows:

```tsx
<CommentCard
  comment={comment}
  isReplying={isReplying}
  onUpvote={handleVote}
  // ... other props
/>

<BountyCard
  bounty={bounty}
  onUpvote={handleVote}
  // ... other props
/>
```

Where `handleVote` is a function that handles the voting logic, typically by calling a context method or making an API call.
