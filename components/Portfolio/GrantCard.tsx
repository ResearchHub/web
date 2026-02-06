'use client';

import Link from 'next/link';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { Badge } from '@/components/ui/Badge';
import { buildWorkUrl } from '@/utils/url';
import { formatUsdCompact } from '@/utils/number';
import { formatDistanceToNow } from 'date-fns';
import { CARD_STYLES, MS_PER_DAY } from './lib/shared';

interface GrantCardProps {
  readonly entry: FeedEntry;
}

export function GrantCard({ entry }: GrantCardProps) {
  const content = entry.content as FeedGrantContent;
  const grantData = content.grant;

  const isExpired = grantData.endDate ? new Date(grantData.endDate) < new Date() : false;
  const isOpen = grantData.status === 'OPEN' && !isExpired;
  const href = buildWorkUrl({ id: content.id, slug: content.slug, contentType: 'funding_request' });
  const topic = content.topics?.[0];
  const latestApplicant = grantData.applicants?.[0];
  const deadline = grantData.endDate ? formatDeadline(grantData.endDate) : 'No deadline';

  return (
    <Link href={href} className={CARD_STYLES}>
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start sm:items-center justify-between sm:justify-start gap-2">
            <h3 className="font-semibold text-gray-900 leading-tight sm:truncate">
              {content.title}
            </h3>
            <StatusDot isOpen={isOpen} />
          </div>
          {topic && <TopicBadge name={topic.name} />}
          {latestApplicant && (
            <p className="text-sm text-gray-500">
              Latest: {latestApplicant.fullName}
              {entry.timestamp &&
                ` · ${formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}`}
            </p>
          )}
        </div>
        <div className="text-sm space-y-1 sm:text-right sm:shrink-0">
          <Stat label="Budget" value={formatUsdCompact(grantData.amount?.usd ?? 0)} highlight />
          <Stat label="Deadline" value={deadline} />
          <Stat label="Applicants" value={String(grantData.applicants?.length ?? 0)} bold />
        </div>
      </div>
    </Link>
  );
}

function StatusDot({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className={`flex items-center gap-1.5 text-sm shrink-0 ${isOpen ? 'text-green-600' : 'text-gray-500'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
      {isOpen ? 'Open' : 'Closed'}
    </span>
  );
}

function TopicBadge({ name }: { name: string }) {
  return (
    <Badge variant="default" className="bg-blue-50 text-blue-700 border-0 text-xs">
      {name}
    </Badge>
  );
}

function Stat({
  label,
  value,
  highlight,
  bold,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  bold?: boolean;
}) {
  const valueClass = highlight
    ? 'text-orange-600 font-medium'
    : bold
      ? 'font-medium'
      : 'text-gray-700';
  return (
    <div className="flex justify-between sm:block">
      <span className="text-gray-500 sm:mr-1">{label}: </span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

function formatDeadline(date: string): string {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / MS_PER_DAY);
  if (days < 0) return 'Ended';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}
