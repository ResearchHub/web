'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { ExpertSourceLinkIcon } from '@/components/ExpertFinder/ExpertSourceLinkIcon';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import type { ExpertSourceLink, GrantInvitedExpert } from '@/types/expertFinder';

interface GrantInvitedExpertCardProps {
  expert: GrantInvitedExpert;
  className?: string;
}

function ExpertSourceLinkItem({ src }: { src: ExpertSourceLink }) {
  return (
    <Tooltip
      content={src.text}
      position="top"
      width="w-72"
      className="text-left"
      wrapperAs="span"
      wrapperClassName="inline-flex shrink-0 items-center"
    >
      <a
        href={src.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex rounded p-0.5 text-gray-600 transition-colors hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
        aria-label={src.text}
        title={src.text}
        onClick={(e) => e.stopPropagation()}
      >
        <ExpertSourceLinkIcon url={src.url} text={src.text} />
      </a>
    </Tooltip>
  );
}

export function GrantInvitedExpertCard({ expert, className }: GrantInvitedExpertCardProps) {
  const name = expert.displayName || expert.name;
  const title = expert.title?.trim() || '';
  const university = expert.affiliation?.trim() || '';
  const authorId = expert.registeredUser?.author?.id;
  const hasAuthor = authorId != null && authorId > 0;
  const sources = expert.sources?.length ? expert.sources : [];

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
      <div className="min-w-0">
        <div>
          {sources.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {sources.map((src, i) => (
                <ExpertSourceLinkItem key={`${src.url}-${i}`} src={src} />
              ))}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">{profileBlock}</div>
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
