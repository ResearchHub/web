'use client';

import Link from 'next/link';
import { Building2, ExternalLink } from 'lucide-react';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import type { GrantInvitedExpert } from '@/types/expertFinder';

interface GrantInvitedExpertCardProps {
  expert: GrantInvitedExpert;
  className?: string;
}

function ExpertSourceLinks({ expert }: { expert: GrantInvitedExpert }) {
  const sources = expert.sources?.length ? expert.sources : [];
  if (sources.length === 0) return null;

  return (
    <span className="inline-flex shrink-0 items-center gap-0.5">
      {sources.map((src, i) => (
        <Tooltip
          key={`${src.url}-${i}`}
          content={src.text}
          position="top"
          width="w-72"
          className="text-left"
          wrapperClassName="inline-flex shrink-0 items-center"
        >
          <a
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded p-0.5 text-primary-600 transition-colors hover:text-primary-700"
            aria-label={src.text}
            title={src.text}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
          </a>
        </Tooltip>
      ))}
    </span>
  );
}

export function GrantInvitedExpertCard({ expert, className }: GrantInvitedExpertCardProps) {
  const name = expert.displayName || expert.name;
  const title = expert.title?.trim() || '';
  const university = expert.affiliation?.trim() || '';
  const authorId = expert.registeredUser?.author?.id;
  const hasAuthor = authorId != null && authorId > 0;

  const nameLink = hasAuthor ? (
    <Link
      href={`/author/${authorId}`}
      className="text-[11px] font-semibold text-blue-500 underline truncate hover:text-blue-600 leading-snug"
      onClick={(e) => e.stopPropagation()}
    >
      {name}
    </Link>
  ) : (
    <span className="text-[11px] font-semibold text-gray-900 truncate leading-snug">{name}</span>
  );

  const profileBlock = hasAuthor ? (
    <AuthorTooltip authorId={authorId} placement="top">
      <div className="min-w-0 cursor-pointer">
        {nameLink}
        {title ? (
          <p className="mt-0.5 line-clamp-1 text-[10px] leading-snug text-gray-500" title={title}>
            {title}
          </p>
        ) : null}
      </div>
    </AuthorTooltip>
  ) : (
    <div className="min-w-0">
      {nameLink}
      {title ? (
        <p className="mt-0.5 line-clamp-1 text-[10px] leading-snug text-gray-500" title={title}>
          {title}
        </p>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        'flex min-h-[80px] flex-col rounded-md border px-2.5 py-2',
        hasAuthor ? 'border-emerald-200 bg-emerald-50/70' : 'border-gray-100 bg-white',
        className
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-1">
        <div className="min-w-0 flex-1">{profileBlock}</div>
        <ExpertSourceLinks expert={expert} />
      </div>
      {university ? (
        <div className="mt-1.5 flex min-w-0 items-start gap-1 text-[10px] leading-snug text-gray-500">
          <Building2 className="mt-px h-3 w-3 shrink-0 text-gray-400" aria-hidden />
          <p className="line-clamp-2 min-w-0" title={university}>
            {university}
          </p>
        </div>
      ) : null}
    </div>
  );
}
