# Feed Component Registry

This directory contains the implementation of the Component Registry pattern for the Feed components. This pattern allows for a flexible, extensible, and maintainable way to render different content types in the feed.

## Architecture

The Component Registry pattern consists of:

1. **Registry**: A central registry that maps content types to their renderers
2. **Renderers**: Type-specific components that know how to render a particular content type
3. **Shared Components**: Reusable components that can be used by multiple renderers

## How It Works

1. The `FeedItem` component receives a feed entry with a specific content type
2. It looks up the appropriate renderer in the registry based on the content type
3. It uses the renderer to render the header, body, and actions for the content
4. If no renderer is found for a content type, it falls back to the default renderer

## Adding a New Content Type

To add support for a new content type:

1. Create a new renderer file (e.g., `CommentRenderer.tsx`)
2. Implement the `ContentRenderer` interface for the new content type
3. Register the renderer in the registry (`index.ts`)

Example:

```tsx
// CommentRenderer.tsx
import { ContentRenderer, AuthorData } from './types';
import { Comment } from '@/types/comment';

export const CommentRenderer: ContentRenderer<Comment> = {
  renderHeader: (comment, options) => {
    // Implementation
  },

  renderBody: (comment, options) => {
    // Implementation
  },

  renderActions: (comment, options) => {
    // Implementation
  },

  getUrl: (comment) => {
    // Implementation
  },

  getAuthorData: (comment) => {
    // Implementation
  },

  getMetadata: (comment) => {
    // Implementation
  },
};

// Then in index.ts
export const contentRenderers = {
  // Existing renderers
  bounty: BountyRenderer,
  paper: PaperRenderer,

  // Add the new renderer
  comment: CommentRenderer,
};
```

## Customizing Renderers

Each renderer can be customized to handle specific requirements for its content type:

- **Header**: Customize how author information, timestamps, and other metadata are displayed
- **Body**: Customize how the main content is displayed, including expandable sections, images, etc.
- **Actions**: Customize what actions are available for the content type

## Shared Components

To promote code reuse, common UI patterns are extracted into shared components:

- **ExpandableContent**: A component for displaying expandable text content
- **ContentBadge**: A component for displaying content type badges
- **ActionButton**: A component for displaying action buttons

These components can be used by multiple renderers to maintain consistency while allowing for customization.

## Benefits

- **Separation of Concerns**: Each content type has its own renderer with specific logic
- **DRY Code**: Common rendering patterns are extracted into shared components
- **Extensibility**: Adding a new content type is as simple as creating a new renderer
- **Customization**: Each renderer can customize how content is displayed
- **Maintainability**: Changes to one content type don't affect others
- **Type Safety**: Each renderer is typed to its specific content type
