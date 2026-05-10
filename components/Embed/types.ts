/**
 * Shape of the metadata returned by `/api/link-preview`. Mirrors
 * `PreviewResponse` from `services/linkPreview.service.ts` — keep these in
 * sync (the service is server-only so we redeclare here for client use).
 */
export interface PreviewData {
  url: string;
  siteName?: string;
  title?: string;
  description?: string;
  image?: string;
  html?: string;
  authorName?: string;
  authorImage?: string;
}

/**
 * Size variants for the embed card.
 * - `md` (default): the original/canonical card size.
 * - `sm`: ~75% of `md`, intended for inline use in comments where the card
 *   is a footnote rather than the primary content.
 * - `lg`: larger variant for hero placements.
 */
export type EmbedSize = 'sm' | 'md' | 'lg';
