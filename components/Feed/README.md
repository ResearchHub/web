# Feed Components

This directory contains components for displaying feed items in the ResearchHub application.

## Components

### FeedItemHeader

The `FeedItemHeader` component is a flexible and reusable header component that can be used for various content types in feeds, including comments, bounties, papers, and more.

#### Features

- Supports single or multiple authors/contributors
- Adapts to different content types (bounty, paper, post, comment, review, answer)
- Displays appropriate metadata based on content type (e.g., review stars, bounty status)
- Consistent styling with flexible layout
- Customizable with additional elements

#### Usage

```tsx
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';

// Basic usage for a comment
<FeedItemHeader
  contentType="comment"
  timestamp={comment.createdDate}
  author={{
    fullName: comment.author.fullName,
    profileImage: comment.author.profileImage,
    profileUrl: comment.author.profileUrl,
  }}
/>

// For a bounty
<FeedItemHeader
  contentType="bounty"
  timestamp={bounty.createdDate}
  author={{
    fullName: bounty.createdBy.authorProfile.fullName,
    profileImage: bounty.createdBy.authorProfile.profileImage,
    profileUrl: bounty.createdBy.authorProfile.profileUrl,
  }}
  bountyAmount={totalAmount}
  bountyStatus={isOpen ? 'open' : 'closed'}
/>

// For a paper with multiple authors
<FeedItemHeader
  contentType="paper"
  timestamp={paper.createdDate}
  authors={paper.authors.map(author => ({
    fullName: author.fullName,
    profileImage: author.profileImage,
    profileUrl: author.profileUrl,
    isVerified: author.isVerified,
  }))}
  action="published"
/>

// For a review with rating
<FeedItemHeader
  contentType="review"
  timestamp={review.createdDate}
  author={{
    fullName: review.author.fullName,
    profileImage: review.author.profileImage,
    profileUrl: review.author.profileUrl,
  }}
  score={review.rating}
/>
```

#### Props

| Prop         | Type                             | Description                                                                      |
| ------------ | -------------------------------- | -------------------------------------------------------------------------------- |
| contentType  | string                           | Type of content (e.g., 'bounty', 'paper', 'post', 'comment', 'review', 'answer') |
| timestamp    | string \| Date                   | When the content was created or updated                                          |
| className    | string                           | Optional CSS class name                                                          |
| size         | 'xs' \| 'sm' \| 'md'             | Size variant for the header (default: 'sm')                                      |
| author       | Author                           | Single author object with fullName, profileImage, profileUrl, isVerified         |
| authors      | Author[]                         | Array of author objects for multiple authors                                     |
| action       | string                           | Action performed (e.g., 'create', 'update', 'publish')                           |
| actionText   | string                           | Custom action text to override default                                           |
| score        | number                           | Rating score (for reviews)                                                       |
| bountyAmount | number                           | Amount of the bounty (for bounties)                                              |
| bountyStatus | 'open' \| 'closed' \| 'expiring' | Status of the bounty (for bounties)                                              |
| rightElement | ReactNode                        | Custom element to display on the right side                                      |

#### Author Object

```typescript
interface Author {
  id?: string | number;
  fullName: string;
  profileImage?: string | null;
  profileUrl?: string;
  isVerified?: boolean;
}
```

## Best Practices

1. **Use the appropriate contentType**: This helps the component display the right metadata and action text.
2. **Provide complete author information**: Include profileImage and profileUrl when available for better UX.
3. **Use the size prop appropriately**: Use 'xs' for compact layouts, 'sm' for normal feeds, and 'md' for featured content.
4. **Customize with rightElement**: Add custom elements on the right side when needed.
5. **Override action text when necessary**: Use actionText prop to override the default action text for special cases.
