'use client';

import { FC } from 'react';
import Link from 'next/link';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { Badge } from '@/components/ui/Badge';
import { buildWorkUrl } from '@/utils/url';

interface GrantCardProps {
  readonly entry: FeedEntry;
}

export const GrantCard: FC<GrantCardProps> = ({ entry }) => {
  const grant = entry.content as FeedGrantContent;
  const grantData = grant.grant;

  // Check if deadline has passed - if so, treat as closed regardless of API status
  const isDeadlineEnded = grantData.endDate ? new Date(grantData.endDate) < new Date() : false;
  const isOpen = grantData.status === 'OPEN' && !isDeadlineEnded;
  const statusLabel = isOpen ? 'Open' : 'Closed';
  const statusColor = isOpen ? 'text-green-600' : 'text-gray-500';
  const statusDotColor = isOpen ? 'bg-green-500' : 'bg-gray-400';

  const href = buildWorkUrl({
    id: grant.id,
    slug: grant.slug,
    contentType: 'funding_request',
  });

  const topic = grant.topics?.[0];
  const deadlineText = grantData.endDate ? formatDeadline(grantData.endDate) : 'No deadline';

  const applicantCount = grantData.applicants?.length || 0;
  const budgetAmount = grantData.amount?.usd || 0;

  // Get latest applicant from the applicants array
  const latestApplicant = grantData.applicants?.[0];
  const entryDate = entry.timestamp ? formatDate(entry.timestamp) : null;
  const latestText = latestApplicant
    ? `Latest: ${latestApplicant.fullName}${entryDate ? ` · ${entryDate}` : ''}`
    : null;

  return (
    <Link
      href={href}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      {/* Desktop layout */}
      <div className="hidden sm:flex justify-between gap-4">
        {/* Left side */}
        <div className="flex-1 min-w-0">
          {/* Title row with status */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{grant.title}</h3>
            <span className={`flex items-center gap-1.5 text-sm ${statusColor} shrink-0`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
              {statusLabel}
            </span>
          </div>

          {/* Topic badge */}
          {topic && (
            <div className="mb-2">
              <Badge variant="default" className="bg-blue-50 text-blue-700 border-0 text-xs">
                {topic.name}
              </Badge>
            </div>
          )}

          {/* Latest applicant */}
          {latestText && <p className="text-sm text-gray-500">{latestText}</p>}
        </div>

        {/* Right side - stats */}
        <div className="text-right text-sm shrink-0 space-y-1">
          <div>
            <span className="text-gray-500">Budget: </span>
            <span className="text-orange-600 font-medium">$ {formatNumber(budgetAmount)}</span>
          </div>
          <div>
            <span className="text-gray-500">Deadline: </span>
            <span className="text-gray-700">{deadlineText}</span>
          </div>
          <div>
            <span className="text-gray-500">Applicants: </span>
            <span className="text-gray-900 font-medium">{applicantCount}</span>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden space-y-3">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 leading-tight">{grant.title}</h3>
          <span className={`flex items-center gap-1.5 text-sm ${statusColor} shrink-0`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
            {statusLabel}
          </span>
        </div>

        {/* Topic badge */}
        {topic && (
          <Badge variant="default" className="bg-blue-50 text-blue-700 border-0 text-xs">
            {topic.name}
          </Badge>
        )}

        {/* Stats */}
        <div className="text-sm space-y-1">
          <div>
            <span className="text-gray-500">Budget: </span>
            <span className="text-orange-600 font-medium">{formatCompact(budgetAmount)}</span>
          </div>
          <div className="flex gap-4">
            <span>
              <span className="text-gray-500">Deadline: </span>
              <span className="text-gray-700">{deadlineText}</span>
            </span>
            <span>
              <span className="text-gray-500">Applicants: </span>
              <span className="text-gray-900 font-medium">{applicantCount}</span>
            </span>
          </div>
        </div>

        {/* Latest applicant */}
        {latestText && <p className="text-sm text-gray-500">{latestText}</p>}
      </div>
    </Link>
  );
};

function formatDeadline(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Ended';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day left';
  return `${diffDays} days left`;
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatCompact(num: number): string {
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K`;
  }
  return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
