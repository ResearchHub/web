'use client';

import { FC, MouseEvent, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Tooltip } from '@/components/ui/Tooltip';
import { BaseModal } from '@/components/ui/BaseModal';
import { classifyUrl, type DetectedUrl, type UrlKind } from '@/utils/url';
import { Embed } from './Embed';
import { EmbedExpandedContent, isEmbedExpandable } from './EmbedExpandedContent';
import { useLinkPreview } from './hooks/useLinkPreview';

/**
 * Compact inline rendering for a single URL inside comment prose. Designed
 * to be slot-compatible in both:
 *   - the TipTap editor (via the `richLink` NodeView), and
 *   - read-only output (`TipTapRenderer`).
 *
 * Visual format follows the product spec:
 *   - YouTube/X/TikTok/LinkedIn → `{favicon} {creator}  {title}`
 *   - Other URLs with title+favicon → `{favicon} {title}`
 *   - Other URLs with title only → `{title}`
 *   - Otherwise → `{url}` (host + path, shortened)
 *
 * Hovering the chip shows a popover containing the standard `<Embed>` card
 * so the same UX surface is reused — no second renderer to maintain.
 */

const SOCIAL_KINDS: ReadonlySet<UrlKind> = new Set(['youtube', 'tiktok', 'x', 'linkedin']);

const faviconFor = (url: string): string | undefined => {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
  } catch {
    return undefined;
  }
};

const shortenUrl = (url: string): string => {
  try {
    const u = new URL(url);
    const path = u.pathname === '/' ? '' : u.pathname;
    return u.hostname.replace(/^www\./, '') + path;
  } catch {
    return url;
  }
};

interface InlineRichLinkProps {
  url: string;
  /** Pre-classified URL (skip a redundant `classifyUrl` call). */
  embed?: DetectedUrl | null;
  /**
   * When true (editor context), the chip is "quiet": no navigation on click,
   * no hover preview tooltip, no modal. The editor owns all interactions
   * (selection + the link menu bubble) and the carousel under the editor
   * provides the canonical preview surface — keeping a popover on the chip
   * here just creates a duplicate that fights the user's mouse position.
   */
  disabled?: boolean;
  className?: string;
}

export const InlineRichLink: FC<InlineRichLinkProps> = ({ url, embed, disabled, className }) => {
  const detected = embed ?? classifyUrl(url);
  const { data, isLoading } = useLinkPreview(url, true);
  // The modal lives at the InlineRichLink level (not inside the tooltip's
  // portal subtree) so that closing the tooltip on click — which unmounts
  // the tooltip's content — doesn't also unmount the modal we just opened.
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const expandable = !!detected && isEmbedExpandable(detected);

  const favicon = faviconFor(url);
  const author = data?.authorName?.trim();
  const title = data?.title?.trim();
  const isSocial = !!detected && SOCIAL_KINDS.has(detected.kind);
  // Show the creator only when we actually have something to show; LinkedIn
  // doesn't return author via our backend, so it'll just fall through to the
  // `{favicon}{title}` shape, which matches the spec for "title-only" URLs.
  const showAuthor = !!author && isSocial;

  const fallbackText = isLoading ? shortenUrl(url) : shortenUrl(url);
  const titleText = title || fallbackText;

  // Click semantics:
  //   - editor (`disabled`): swallow the click — TipTap owns caret placement.
  //   - embeddable kinds (LinkedIn/X/YouTube/TikTok with a usable id): open the
  //     in-app modal preview rather than punting the user to the source site.
  //     The `<a>` still has `href={url}`, so middle-click / cmd-click / right-
  //     click "Open in new tab" continue to work as users expect.
  //   - everything else: default — let the link navigate.
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Honor modifier keys / non-primary buttons — don't hijack power-user gestures.
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    if (expandable) {
      e.preventDefault();
      setPreviewModalOpen(true);
    }
  };

  const chip = (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      data-rich-link-chip=""
      // `vertical-align: middle` (via `align-middle`) centers the chip on the
      // surrounding text's x-line. For an `inline-flex` box the synthesized
      // baseline sits near the bottom, so `align-baseline` would make the
      // chip project upward from the text baseline by its full height — the
      // chip ends up visibly higher than the surrounding prose. Centering on
      // the x-line is the idiomatic fix for icon-chip-in-prose patterns.
      className={cn(
        'inline-flex max-w-[440px] items-center gap-1.5 rounded bg-gray-100 px-1.5 py-0.5 align-middle text-[13px] leading-snug text-gray-900 no-underline transition-colors hover:bg-gray-200',
        // Prevent the chip from breaking mid-token when the line wraps.
        'whitespace-nowrap overflow-hidden',
        className
      )}
      title={url}
    >
      {favicon && (
        // Decorative platform mark; alt is intentionally empty so AT skips it.
        // Inline width/height locks the favicon to 16px regardless of any
        // ambient `img { max-width: 100% }` (Tailwind preflight) or other
        // CSS that might otherwise let the icon balloon to its natural
        // (sometimes 256+ px) source size — a previous bug where it filled
        // the editor row with the chip's text squeezed to zero width.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={favicon}
          alt=""
          width={16}
          height={16}
          style={{ width: 16, height: 16, flexShrink: 0, display: 'inline-block' }}
          className="rounded-sm"
          loading="lazy"
        />
      )}
      {showAuthor && (
        <span className="shrink-0 text-gray-500" style={{ minWidth: 0 }}>
          {author}
        </span>
      )}
      <span
        className={cn(
          'min-w-0 truncate',
          title && 'underline decoration-gray-300 underline-offset-2'
        )}
      >
        {titleText}
      </span>
    </a>
  );

  // Editor context (`disabled`) — render the chip alone. No hover preview,
  // no click-to-modal; the editor's own bubble menu handles open / convert /
  // remove, and the carousel under the editor renders the rich preview.
  if (disabled) return chip;

  // No detected URL (shouldn't normally happen since the extension only
  // creates richLink nodes for classifiable URLs) — render the chip alone
  // without the hover preview.
  if (!detected) return chip;

  // Compact modal header. For social embeds the iframe body already shows
  // the full content, so duplicating it in the title (which is what
  // `preview.title` returns for X/LinkedIn — the full post text) just
  // crowds the header. Use `{author} on {provider}` when we know the
  // creator, falling back to a short provider-flavored label.
  const modalTitleText = (() => {
    if (detected.kind === 'youtube') return title || 'YouTube video';
    if (detected.kind === 'tiktok') return author ? `${author} on TikTok` : 'TikTok video';
    if (detected.kind === 'x') return author ? `${author} on X` : 'X post';
    if (detected.kind === 'linkedin') return author ? `${author} on LinkedIn` : 'LinkedIn post';
    return title || data?.siteName || shortenUrl(url);
  })();

  // The modal renders embedded content in our own iframe. Many users still
  // want to jump to the source (to reply, follow the author, etc.). The CTA
  // lives in the modal footer rather than next to the title — a real tap
  // target with a label is friendlier on touch devices than an inline icon.

  return (
    <>
      <Tooltip
        content={
          <Embed
            embed={detected}
            size="sm"
            // The card defers its own modal to us so the modal can outlive
            // the tooltip's portal subtree (which gets torn down when the
            // tooltip closes on click below).
            onActivate={expandable ? () => setPreviewModalOpen(true) : undefined}
          />
        }
        width="w-[336px]"
        position="bottom"
        delay={250}
        hideDelay={150}
        // Clicking the embed card opens our modal (via onActivate) — close
        // the tooltip in the same render so it doesn't linger on top of
        // the modal backdrop.
        closeOnContentClick
        // On touch devices, the tap-to-preview tooltip is redundant with the
        // chip's primary click action (which opens the modal directly for
        // embeddable kinds, or navigates for plain URLs). Suppressing it
        // avoids the awkward "first tap shows tooltip, second tap activates"
        // dance and matches expectations on mobile.
        disableTouchClick
        // Strip the tooltip's own padding/border/shadow so the embed card's
        // styling owns the visual surface (no nested borders).
        className="!border-0 !bg-transparent !p-0 !text-left !shadow-none"
        wrapperClassName="inline"
        // The chip lives inline inside a TipTap `<p>` paragraph (richLink is
        // a schema-inline atom). Tooltip's default `<div>` wrapper would
        // make `<div>` a descendant of `<p>` — invalid HTML and a hydration
        // warning. `<span>` is inline-valid and accepts `inline-flex` just
        // as well.
        wrapperAs="span"
      >
        {chip}
      </Tooltip>
      {expandable && (
        <BaseModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          title={modalTitleText}
          size="2xl"
          padding="p-0"
          footer={
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              View external source
              <ExternalLink className="h-4 w-4" />
            </a>
          }
        >
          <EmbedExpandedContent embed={detected} />
        </BaseModal>
      )}
    </>
  );
};
