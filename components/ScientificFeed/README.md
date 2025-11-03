# Scientific Feed

A beautifully designed feed component for displaying scientific content including papers, peer review bounties, research proposals, and requests for proposals (RFPs).

## Overview

The Scientific Feed is designed for scientists, academics, and citizen scientists to discover trending research, earn peer review opportunities, and support scientific endeavors.

## Features

### Feed Tabs
- **For You**: Personalized feed based on user interests
- **Following**: Content from topics the user follows with horizontal scrollable topic pills

### Card Types

#### 1. Paper Card
- Displays research papers from preprint servers (arXiv, bioRxiv, medRxiv, chemRxiv)
- Shows category badges, authors, publication date, and peer review scores
- Features 4-panel thumbnail grid showing paper figures
- Expandable abstract with "Read more" functionality
- Trending score indicator

#### 2. Bounty Card (Peer Review Opportunity)
- Shows bounty amount and status (open/in-review/closed)
- Contains nested paper card with reduced styling
- Displays reviewer avatars with avatar stack
- Primary actions: "Review Paper" and "Read Requirements"

#### 3. Proposal Card (Fundraise)
- Features fundraising progress with visual progress bar
- Shows raised amount vs goal with percentage funded
- Displays supporter avatars
- Includes end date and thumbnail image
- Condensed callout section with funding details

#### 4. RFP Card (Request for Proposal/Grant)
- Shows total budget and application deadline
- Displays applicant avatars
- Clean callout section with key information
- Primary actions: "Apply" and "Read Requirements"

### Consistent Design Elements

All cards share:
- **Common positioning**: Upvote/downvote, comments, and bookmark buttons in the same location
- **Social proof**: Avatar stacks showing supporters, reviewers, or applicants
- **Badges row**: Category and subcategory badges at the top
- **Actions bar**: Light gray background with left-aligned common actions and right-aligned card-specific CTAs
- **Callout sections**: Different background colors for nested content (proposals, RFPs, nested papers)

### Sorting & Filtering
- Sort by: Trending or Latest
- Topic filtering (Following tab only)
- Horizontal scrollable topic pills with smooth scroll behavior

## Usage

```tsx
import { ScientificFeed } from '@/components/ScientificFeed';

export default function FeedPage() {
  return <ScientificFeed />;
}
```

## Mock Data

Mock data is provided in `/data/mockFeedData.ts` with all card types represented. You can modify this data to iterate on the design.

## Design Principles

1. **Minimal & Clean**: Easy to scan, minimal visual noise
2. **Consistency**: Elements appear in the same position across card types
3. **Social Proof**: Avatars show community engagement
4. **Clarity**: Clear CTAs and visual hierarchy
5. **Responsive**: Works across different screen sizes (handled by PageLayout)

## Components

- `ScientificFeed.tsx` - Main feed component with tabs and filters
- `FeedCardBase.tsx` - Base component with consistent actions bar
- `PaperCard.tsx` - Research paper display
- `BountyCard.tsx` - Peer review bounty opportunities
- `ProposalCard.tsx` - Research funding proposals
- `RFPCard.tsx` - Request for proposal/grant cards

## Customization

To modify the feed data, edit `/data/mockFeedData.ts`. The data structure includes:

- Authors with avatars
- Category and subcategory tags
- Voting metrics
- Card-specific data (bounty amounts, fundraise progress, etc.)
- Thumbnails and images

## Future Enhancements

- Real API integration
- Infinite scroll
- Advanced filtering options
- User preferences for feed algorithm
- Bookmark collection management

