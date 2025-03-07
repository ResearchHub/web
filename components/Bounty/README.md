# Bounty Components

This directory contains components for displaying and interacting with bounties in the ResearchHub application.

## Architecture

The bounty components follow a layered architecture:

1. **Bounty Type**: The core data structure that represents a bounty
2. **BountyCard**: The core presentation component that renders bounty UI
3. **BountyCardWrapper**: A wrapper component that handles modals, navigation, and compatibility

This architecture follows a clean separation of concerns:

- Data transformation happens at the type level through transformers
- Presentation is handled by the BountyCard component
- Complex interactions and compatibility are handled by the BountyCardWrapper

## Components

### Main Components

- **BountyCard**: The core component for displaying a bounty. It accepts a single `Bounty` object and focuses on rendering.
- **BountyCardWrapper**: A wrapper component that handles modals, navigation, and compatibility issues. It provides backward compatibility for code that passes an array of bounties. Use this component in most cases.

### Sub-components

- **BountyActions**: Displays action buttons for a bounty (Award, Review/Answer, Contribute).
- **BountyDetails**: Displays the details of a bounty.
- **BountyMetadataLine**: Displays metadata about a bounty (type, amount, deadline).
- **BountySolutions**: Displays solutions for a bounty.

## Usage

### Using BountyCardWrapper (recommended)

```tsx
import { BountyCardWrapper } from '@/components/Bounty';

// ...

<BountyCardWrapper
  bounty={bounty}
  content={content}
  contentFormat={contentFormat}
  documentId={documentId}
  contentType={contentType}
  commentId={commentId}
  isCreator={isCreator}
  onBountyUpdated={handleBountyUpdated}
  slug={slug}
/>;
```

### Using BountyCard directly (advanced usage)

```tsx
import { BountyCard } from '@/components/Bounty';

// ...

<BountyCard
  bounty={bounty}
  content={content}
  contentFormat={contentFormat}
  documentId={documentId}
  contentType={contentType}
  commentId={commentId}
  isCreator={isCreator}
  onBountyUpdated={handleBountyUpdated}
  onViewSolution={handleViewSolution}
  onNavigationClick={handleNavigationClick}
  slug={slug}
/>;
```

### Using with an array of bounties (for backward compatibility)

```tsx
import { BountyCardWrapper } from '@/components/Bounty';

// ...

<BountyCardWrapper
  bounties={bounties}
  content={content}
  contentFormat={contentFormat}
  documentId={documentId}
  contentType={contentType}
  commentId={commentId}
  isCreator={isCreator}
  onBountyUpdated={handleBountyUpdated}
  slug={slug}
/>;
```

## Props

### BountyCardWrapper Props

| Prop            | Type          | Description                                               |
| --------------- | ------------- | --------------------------------------------------------- |
| bounty          | Bounty        | A single bounty to display                                |
| bounties        | Bounty[]      | Array of bounties to display (for backward compatibility) |
| content         | any           | Content of the bounty (details)                           |
| contentFormat   | ContentFormat | Format of the content (e.g., 'QUILL_EDITOR', 'TIPTAP')    |
| documentId      | number        | ID of the document the bounty is associated with          |
| contentType     | ContentType   | Type of content (e.g., 'paper', 'post')                   |
| commentId       | number        | ID of the comment (optional)                              |
| isCreator       | boolean       | Whether the current user is the creator of the bounty     |
| onBountyUpdated | () => void    | Callback when the bounty is updated                       |
| slug            | string        | Slug for URL construction (optional)                      |

### BountyCard Props

| Prop              | Type                                       | Description                                            |
| ----------------- | ------------------------------------------ | ------------------------------------------------------ |
| bounty            | Bounty                                     | The bounty to display                                  |
| content           | any                                        | Content of the bounty (details)                        |
| contentFormat     | ContentFormat                              | Format of the content (e.g., 'QUILL_EDITOR', 'TIPTAP') |
| documentId        | number                                     | ID of the document the bounty is associated with       |
| contentType       | ContentType                                | Type of content (e.g., 'paper', 'post')                |
| commentId         | number                                     | ID of the comment (optional)                           |
| isCreator         | boolean                                    | Whether the current user is the creator of the bounty  |
| onBountyUpdated   | () => void                                 | Callback when the bounty is updated                    |
| onViewSolution    | (event: SolutionViewEvent) => void         | Callback when a solution is viewed                     |
| onNavigationClick | (tab: 'reviews' \| 'conversation') => void | Callback when navigation is requested                  |
| slug              | string                                     | Slug for URL construction (optional)                   |
