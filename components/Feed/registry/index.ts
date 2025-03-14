import { ContentRendererRegistry } from './types';
import { DefaultRenderer } from './DefaultRenderer';
import { BountyRenderer } from './BountyRenderer';
import { CommentRenderer } from './CommentRenderer';

/**
 * Registry of content renderers
 * Maps content types to their respective renderers
 */
export const contentRenderers: ContentRendererRegistry = {
  // Default renderer (fallback)
  default: DefaultRenderer,

  // Content type specific renderers
  bounty: BountyRenderer,
  comment: CommentRenderer,

  // Add more renderers as needed
  // post: PostRenderer,
  // review: ReviewRenderer,
};

// Export types
export * from './types';

// Export renderers
export { DefaultRenderer } from './DefaultRenderer';
export { BountyRenderer } from './BountyRenderer';
export { CommentRenderer } from './CommentRenderer';
