'use client';

import { FC } from 'react';
import { formatDate } from '@/utils/date';
import { cn } from '@/utils/styles';

interface FeedItemEyebrowProps {
  /** Content type shown first, e.g. "Registered Report". */
  label: string;
  publishedAt?: string;
  className?: string;
}

export const FeedItemEyebrow: FC<FeedItemEyebrowProps> = ({ label, publishedAt, className }) => (
  <div
    className={cn(
      'mb-1.5 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-gray-500',
      className
    )}
  >
    <span className="font-semibold">{label}</span>
    {publishedAt && (
      <>
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-gray-300" />
        <span className="font-medium">Published {formatDate(publishedAt)}</span>
      </>
    )}
  </div>
);
