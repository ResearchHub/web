import type { DocumentTab } from './types';

/**
 * Citation chips are authored in script text as `[[tab:section|label]]` —
 * `[[org:typicalGrant|your typical grant]]`, `[[rfp:claims|the claims section]]`,
 * `[[judgment|your judgment rules]]` — and rendered as links on a private
 * `cite:` scheme that the transcript intercepts and routes to the side panel.
 */
export const CITE_SCHEME = 'cite';

export interface Citation {
  tab: DocumentTab;
  sectionId: string | null;
}

const CITATION_PATTERN = /\[\[(rfp|judgment|org)(?::([A-Za-z0-9_-]+))?\|([^\]]+)\]\]/g;

/** Rewrites chip syntax into markdown links markdown-it will render. */
export const citationsToMarkdown = (text: string) =>
  text.replace(
    CITATION_PATTERN,
    (_, tab: string, sectionId: string | undefined, label: string) =>
      `[${label}](${CITE_SCHEME}://${tab}/${sectionId ?? ''})`
  );

/**
 * A turn types out character by character, so a chip is briefly half-written.
 * Cutting the partial chip keeps its raw syntax from flashing on screen.
 */
export const stripPartialCitation = (text: string) => {
  const open = text.lastIndexOf('[[');
  if (open === -1) return text;

  const close = text.lastIndexOf(']]');
  return close > open ? text : text.slice(0, open);
};

export const parseCitationHref = (href: string): Citation | null => {
  const match = /^cite:\/\/(rfp|judgment|org)\/([A-Za-z0-9_-]*)$/.exec(href);
  if (!match) return null;

  return { tab: match[1] as DocumentTab, sectionId: match[2] || null };
};
