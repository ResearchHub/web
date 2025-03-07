# Bounty Components

This directory contains components for displaying and interacting with bounties in the ResearchHub application.

## Architecture

The bounty components follow a layered architecture:

1. **BountyCard**: The core presentation component that renders bounty UI
2. **BountyCardAdapter**: Transforms raw bounty data into the format BountyCard expects

This architecture follows the Adapter pattern, separating data transformation from presentation and enabling reuse across different contexts.

## Components

### Main Components

- **BountyCard**: The core component for displaying a bounty. It is decoupled from the Comment type and accepts pre-calculated values instead of raw bounty data.
- **BountyCardAdapter**: An adapter component that transforms Bounty arrays into the format BountyCard expects.

### Sub-components

- **BountyActions**: Displays action buttons for a bounty (Award, Review/Answer, Contribute).
- **BountyDetails**: Displays the details of a bounty.
- **BountyMetadataLine**: Displays metadata about a bounty (type, amount, deadline).
- **BountySolutions**: Displays solutions for a bounty.

## Usage

### Using BountyCard directly (advanced usage)

```tsx
import { BountyCard } from '@/components/Bounty';

// ...

<BountyCard
  bountyType={bountyType}
  totalBountyAmount={totalBountyAmount}
  expirationDate={expirationDate}
  isOpen={isOpen}
  isPeerReviewBounty={isPeerReviewBounty}
  content={content}
  contentFormat={contentFormat}
  documentId={documentId}
  contentType={contentType}
  commentId={commentId}
  solutions={solutions}
  totalAwardedAmount={totalAwardedAmount}
  contributors={contributors}
  onSubmitSolution={handleSubmitSolution}
  isCreator={isCreator}
  onBountyUpdated={handleBountyUpdated}
  slug={slug}
/>;
```

### Using BountyCardAdapter (for Bounty arrays)

```tsx
import { BountyCardAdapter } from '@/components/Bounty';

// ...

<BountyCardAdapter
  bounties={bounties}
  content={content}
  contentFormat={contentFormat}
  documentId={documentId}
  contentType={contentType}
  commentId={commentId}
  onSubmitSolution={handleSubmitSolution}
  isCreator={isCreator}
  onBountyUpdated={handleBountyUpdated}
  slug={slug}
/>;
```

## Props

### BountyCard Props

| Prop               | Type          | Description                                            |
| ------------------ | ------------- | ------------------------------------------------------ |
| bountyType         | BountyType    | Type of the bounty (e.g., 'REVIEW', 'ANSWER')          |
| totalBountyAmount  | number        | Total amount of the bounty                             |
| expirationDate     | string        | Expiration date of the bounty                          |
| isOpen             | boolean       | Whether the bounty is open                             |
| isPeerReviewBounty | boolean       | Whether the bounty is a peer review bounty             |
| content            | any           | Content of the bounty (details)                        |
| contentFormat      | ContentFormat | Format of the content (e.g., 'QUILL_EDITOR', 'TIPTAP') |
| documentId         | number        | ID of the document the bounty is associated with       |
| contentType        | ContentType   | Type of content (e.g., 'paper', 'post')                |
| commentId          | number        | ID of the comment (optional)                           |
| solutions          | any[]         | Array of solutions for the bounty                      |
| totalAwardedAmount | number        | Total amount awarded for the bounty                    |
| contributors       | Contributor[] | Array of contributors to the bounty                    |
| onSubmitSolution   | () => void    | Callback when a solution is submitted                  |
| isCreator          | boolean       | Whether the current user is the creator of the bounty  |
| onBountyUpdated    | () => void    | Callback when the bounty is updated                    |
| slug               | string        | Slug for URL construction (optional)                   |

### BountyCardAdapter Props

| Prop             | Type          | Description                                            |
| ---------------- | ------------- | ------------------------------------------------------ |
| bounties         | Bounty[]      | Array of bounties to display                           |
| content          | any           | Content of the bounty (details)                        |
| contentFormat    | ContentFormat | Format of the content (e.g., 'QUILL_EDITOR', 'TIPTAP') |
| documentId       | number        | ID of the document the bounty is associated with       |
| contentType      | ContentType   | Type of content (e.g., 'paper', 'post')                |
| commentId        | number        | ID of the comment (optional)                           |
| onSubmitSolution | () => void    | Callback when a solution is submitted                  |
| isCreator        | boolean       | Whether the current user is the creator of the bounty  |
| onBountyUpdated  | () => void    | Callback when the bounty is updated                    |
| slug             | string        | Slug for URL construction (optional)                   |
