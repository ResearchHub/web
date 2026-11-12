'use client';

import { FC, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import type { ActivityWork } from '../lib/activityWork.utils';
import { cn } from '@/utils/styles';

interface ActivityWorkLinkProps {
  work: ActivityWork;
  /** Shown at the right edge, e.g. a funding goal. */
  trailing?: ReactNode;
  onNavigate?: () => void;
  className?: string;
}

/** A one-line link to a work: small thumbnail and title, for cards that list several. */
export const ActivityWorkLink: FC<ActivityWorkLinkProps> = ({
  work,
  trailing,
  onNavigate,
  className,
}) => (
  <Link
    href={work.href}
    onClick={onNavigate}
    className={cn('group flex items-center gap-3 py-2', className)}
  >
    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
      {work.imageUrl ? (
        <Image src={work.imageUrl} alt="" fill sizes="40px" className="object-cover" />
      ) : (
        <FileText className="m-auto h-full w-4 text-gray-400" />
      )}
    </div>
    <span className="line-clamp-2 flex-1 text-sm font-medium text-gray-900 group-hover:text-primary-600">
      {work.title}
    </span>
    {trailing && <span className="flex-shrink-0 text-xs text-gray-500">{trailing}</span>}
  </Link>
);
