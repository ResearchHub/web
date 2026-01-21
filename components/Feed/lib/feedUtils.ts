import { ContentMetrics } from '@/types/metrics';

/**
 * Determines if the comment/reply button should be shown.
 * Show the button if there are comments to view OR the user can add one.
 *
 * @param metrics - The content metrics containing comment count
 * @param hasCommentAction - Whether the user has a way to comment (via callback or navigation)
 */
export function shouldShowCommentButton(
  metrics: ContentMetrics | undefined,
  hasCommentAction: boolean
): boolean {
  const hasComments = (metrics?.comments ?? 0) > 0;
  return hasComments || hasCommentAction;
}
