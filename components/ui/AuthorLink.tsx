'use client';

import Link from 'next/link';
import { AUTHOR_TOOLTIP_ANCHOR_CLASS, AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/utils/styles';

interface AuthorLinkProps {
  /** Their author profile's id. Without one (0 for a name with no profile), the name is plain text. */
  authorId?: number | null;
  name: string;
  /** For the name itself: its color, weight and size, or `truncate`. */
  className?: string;
  /** Which side of the name their profile card opens on. */
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * An author's name as a link to their profile. With a mouse, hovering it opens
 * their profile card (AuthorTooltip) too; on touch screens, where the hover
 * would be the tap that follows the link, it is just the link.
 */
export function AuthorLink({
  authorId,
  name,
  className,
  tooltipPlacement = 'bottom',
}: AuthorLinkProps) {
  // Unknown while the page hydrates, so the server's render is the plain link.
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)') === true;

  // Every name sits in the box AuthorTooltip wraps it in, so it doesn't move
  // when the card arrives after hydration, and a `truncate` name can shrink.
  if (!authorId) {
    return (
      <span className={AUTHOR_TOOLTIP_ANCHOR_CLASS}>
        <span className={className}>{name}</span>
      </span>
    );
  }

  const link = (
    <Link
      href={`/author/${authorId}`}
      // Not prefetched: the names on a page would each load a profile no one opened.
      prefetch={false}
      className={cn('hover:underline', className)}
    >
      {name}
    </Link>
  );

  if (!canHover) {
    return <span className={AUTHOR_TOOLTIP_ANCHOR_CLASS}>{link}</span>;
  }

  return (
    <AuthorTooltip authorId={authorId} placement={tooltipPlacement}>
      {link}
    </AuthorTooltip>
  );
}
