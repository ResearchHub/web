'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utils/styles';

interface WorkMiniCardProps {
  title: string;
  imageUrl?: string;
  /** Without one, the card is a plain reminder of what it's about, not a link. */
  href?: string;
  className?: string;
}

/**
 * A small embedded card for the work a panel is about: its cover thumbnail and
 * title. Used where the panel's content is the subject, not the work itself.
 */
export function WorkMiniCard({ title, imageUrl, href, className }: WorkMiniCardProps) {
  const body = (
    <>
      <div className="relative h-11 w-[72px] flex-shrink-0 overflow-hidden rounded-lg bg-gray-900">
        {imageUrl && <Image src={imageUrl} alt="" fill className="object-cover" sizes="72px" />}
      </div>
      <span className="line-clamp-2 min-w-0 text-sm font-semibold leading-5 text-gray-900">
        {title}
      </span>
    </>
  );

  const classes = cn(
    'flex items-center gap-3 rounded-xl border border-gray-200 p-2 pr-3',
    href && 'hover:bg-gray-50',
    className
  );

  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
