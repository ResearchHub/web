'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { cn } from '@/utils/styles';
import { buildWorkUrl } from '@/utils/url';
import { Users } from 'lucide-react';

interface GrantCardProps {
  entry: FeedEntry;
  className?: string;
}

function formatAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${usd.toLocaleString()}`;
}

export const GrantCard: FC<GrantCardProps> = ({ entry, className }) => {
  const content = entry.content as FeedGrantContent;
  const grant = content.grant;

  const href = buildWorkUrl({
    id: content.id,
    contentType: 'funding_request',
    slug: content.slug,
  });

  const isClosed = grant.status === 'CLOSED';
  const applicantCount = grant.applicants?.length ?? 0;
  const amount = grant.amount?.usd ?? 0;

  return (
    <Link
      href={href}
      className={cn(
        'block rounded-xl border border-gray-200 overflow-hidden hover:bg-gray-50 transition-colors',
        isClosed && 'opacity-75',
        className
      )}
    >
      <div className="flex flex-wrap gap-3 p-3">
        <div className="min-w-0 flex-1 basis-48 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-[11px] font-medium rounded-full px-2 py-0.5',
                isClosed ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'
              )}
            >
              {isClosed ? 'Closed' : 'Open'}
            </span>
            {grant.organization && (
              <span className="text-[11px] text-gray-400 truncate">{grant.organization}</span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2">
            {content.title}
          </h3>

          {grant.description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {grant.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-auto pt-1">
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <Users size={13} />
              {applicantCount} proposal{applicantCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="relative flex-shrink-0 w-[160px] self-stretch min-h-[90px] rounded-lg overflow-hidden bg-gray-100">
          {content.previewImage ? (
            <Image
              src={content.previewImage}
              alt={content.title}
              fill
              className="object-cover"
              sizes="160px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
              <span className="text-indigo-400 text-2xl">💰</span>
            </div>
          )}
          {amount > 0 && (
            <div className="absolute inset-x-0 bottom-0 bg-indigo-600/85 backdrop-blur-sm px-2.5 py-1.5 flex items-center justify-center gap-1 rounded-b-lg">
              <span className="text-sm font-bold font-mono text-white">{formatAmount(amount)}</span>
              <span className="text-[11px] text-white/80 font-medium">award</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
