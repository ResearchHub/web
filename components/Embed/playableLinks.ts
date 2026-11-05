import { parseContent } from '@/components/Comment/lib/commentContentUtils';
import { extractDocEmbeds, withoutStandaloneUrls } from '@/components/Comment/lib/embedDoc';
import type { CommentContent } from '@/components/Comment/lib/types';
import type { ContentFormat } from '@/types/comment';
import { classifyUrl, trimUrlTrailingPunctuation, URL_REGEX, type DetectedUrl } from '@/utils/url';
import { isEmbedExpandable } from './EmbedExpandedContent';

/**
 * The links in a comment that play in place (YouTube, X, TikTok, LinkedIn), and
 * its words without the paragraphs that were only one of those links, so a
 * video stands in for its URL rather than repeating it.
 */
export function splitPlayableLinks(
  content: CommentContent,
  format: ContentFormat
): { readonly body: CommentContent; readonly players: readonly DetectedUrl[] } {
  const parsed = parseContent(content, format);
  if (format === 'TIPTAP') {
    const players = extractDocEmbeds(parsed).filter(isEmbedExpandable);
    if (players.length === 0) return { body: content, players };
    return {
      body: withoutStandaloneUrls(
        parsed,
        players.map((player) => player.url)
      ),
      players,
    };
  }
  // Quill or plain text: its links play below it, and its words stay as written.
  const text: string = Array.isArray(parsed?.ops)
    ? parsed.ops
        .map((op: { insert?: unknown }) => (typeof op.insert === 'string' ? op.insert : ''))
        .join('')
    : typeof content === 'string'
      ? content
      : '';
  const byUrl = new Map<string, DetectedUrl>();
  for (const match of text.match(URL_REGEX) ?? []) {
    const embed = classifyUrl(trimUrlTrailingPunctuation(match));
    if (embed && isEmbedExpandable(embed) && !byUrl.has(embed.url)) byUrl.set(embed.url, embed);
  }
  return { body: content, players: [...byUrl.values()] };
}

/** A playable link that is a video, rather than a post that may hold one. */
export function isVideoLink(embed: DetectedUrl): boolean {
  return (embed.kind === 'youtube' || embed.kind === 'tiktok') && !!embed.videoId;
}

/**
 * Plain text without the links in it that are videos, for a preview that
 * shows the video itself in their place. A sentence that pointed at the link
 * at its end ("…shared at", "Watch here:") loses the pointing word too.
 */
export function withoutVideoLinks(text: string): string {
  const stripped = text
    .replace(URL_REGEX, (match) => {
      const embed = classifyUrl(trimUrlTrailingPunctuation(match));
      return embed && isVideoLink(embed) ? '' : match;
    })
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped === text.replace(/\s+/g, ' ').trim()) return stripped;
  return stripped.replace(/(?:\s+(?:at|here|via))?\s*[:\-–—]?$/i, '').trim();
}
