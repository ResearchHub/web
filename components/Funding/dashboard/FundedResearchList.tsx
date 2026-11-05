'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, Building2, Star } from 'lucide-react';
import { getActivityComment } from '@/components/Activity/lib/activityDisplay.utils';
import { getActivityWork } from '@/components/Activity/lib/activityWork.utils';
import {
  isVideoLink,
  splitPlayableLinks,
  withoutVideoLinks,
} from '@/components/Embed/playableLinks';
import { VideoThumbnail } from '@/components/Embed/VideoThumbnail';
import { ActivityCommentPanel } from '@/components/modals/ActivityCommentPanel';
import { Avatar } from '@/components/ui/Avatar';
import { DashboardSection, SeeAllButton } from '@/components/Funding/dashboard/DashboardSection';
import { DocumentThumbnail } from '@/components/Funding/dashboard/DocumentThumbnail';
import {
  fundedRowByline,
  type FundedRow,
  type ProposalNews,
} from '@/components/Funding/dashboard/lib/myFundingModel';
import { useMoneyFormat } from '@/components/Funding/dashboard/lib/useMoneyFormat';
import { formatTimeAgo } from '@/utils/date';
import type { DetectedUrl } from '@/utils/url';

interface FundedResearchListProps {
  readonly rows: readonly FundedRow[];
  /** How many rows to show; the rest wait behind "See all". */
  readonly limit?: number;
  /** Opens the Funded tab, where every row is. */
  readonly onSeeAll?: () => void;
}

/**
 * Research you funded: each proposal with its cover and scientist, the latest word from
 * its author or reviewers, and what you gave. The proposal opens its page; the latest
 * word opens in full in the side panel.
 */
export function FundedResearchList({ rows, limit, onSeeAll }: FundedResearchListProps) {
  if (rows.length === 0) return null;

  const shown = limit ? rows.slice(0, limit) : rows;

  return (
    <DashboardSection
      title="Research you funded"
      action={
        limit != null &&
        rows.length > limit &&
        onSeeAll && <SeeAllButton onClick={onSeeAll}>See all {rows.length}</SeeAllButton>
      }
    >
      {/* One card holding every row, like Your peer reviews. */}
      <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {shown.map((row) => (
          <FundedResearchRow key={row.key} row={row} />
        ))}
      </ul>
    </DashboardSection>
  );
}

function FundedResearchRow({ row }: { readonly row: FundedRow }) {
  const format = useMoneyFormat();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // The news opens in full in the side panel, as a feed card's "Read update"
  // and "Read review" do; it links to the proposal's tab only when the
  // activity lacks what the panel needs.
  const panel = useMemo(() => {
    if (!row.news) return null;
    const comment = getActivityComment(row.news.entry);
    const work = getActivityWork(row.news.entry);
    return comment && work ? { comment, work } : null;
  }, [row.news]);
  // A video in the news shows as one, its link dropped from the words.
  const video = useMemo(
    () =>
      panel
        ? (splitPlayableLinks(panel.comment.content, panel.comment.format).players.find(
            isVideoLink
          ) ?? null)
        : null,
    [panel]
  );

  return (
    <li className="px-5 py-5">
      <Link href={row.href} className="group flex items-start gap-4">
        <DocumentThumbnail image={row.image} size="lg" />
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 group-hover:text-primary-700">
            {row.title}
          </span>
          <span className="mt-2 flex min-w-0 items-center gap-2 text-[13px] text-gray-600">
            {row.kind === 'grant' && row.organization ? (
              <Building2 className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            ) : (
              <Avatar
                src={row.scientist.profileImage}
                alt={row.scientist.fullName}
                size={20}
                disableTooltip
              />
            )}
            <span className="truncate">{fundedRowByline(row)}</span>
          </span>
        </span>

        <span className="shrink-0 text-right">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            You gave
          </span>
          <span className="mt-1 block font-mono text-base font-semibold text-gray-900">
            {format(row.youGave)}
          </span>
        </span>
      </Link>

      {/* The latest news spans the whole row, under both the title and the amount. */}
      {row.news &&
        (panel ? (
          <button type="button" onClick={() => setIsPanelOpen(true)} className={NEWS_CLASS}>
            <NewsPreview news={row.news} video={video} />
          </button>
        ) : (
          <Link href={row.news.href ?? row.href} className={NEWS_CLASS}>
            <NewsPreview news={row.news} />
          </Link>
        ))}

      {panel && (
        <ActivityCommentPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          comment={panel.comment}
          work={panel.work}
        />
      )}
    </li>
  );
}

const NEWS_CLASS =
  'mt-4 block w-full rounded-lg bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';

function NewsPreview({
  news,
  video = null,
}: {
  readonly news: ProposalNews;
  readonly video?: DetectedUrl | null;
}) {
  const text = video ? withoutVideoLinks(news.text) : news.text;
  const heading = (
    <span className="flex items-center gap-1.5 text-xs text-gray-500">
      {news.kind === 'update' ? (
        <>
          <Bell className="h-3.5 w-3.5 text-primary-600" aria-hidden="true" />
          <span className="font-semibold text-gray-700">Update</span>
        </>
      ) : (
        <span className="font-semibold text-gray-700">Peer review</span>
      )}
      {news.kind === 'review' && news.score ? (
        <span className="inline-flex items-center gap-0.5 font-medium text-amber-700">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
          {news.score.toFixed(1)}
        </span>
      ) : null}
      <span aria-hidden="true">·</span>
      <span>{formatTimeAgo(news.timestamp)}</span>
    </span>
  );

  if (!video) {
    return (
      <>
        {heading}
        <span className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-700">{text}</span>
      </>
    );
  }
  // The video takes the right of the whole preview, beside the heading and the words.
  return (
    <span className="flex items-center gap-3">
      <span className="min-w-0 flex-1">
        {heading}
        <span className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-gray-700">
          {text || (news.kind === 'update' ? 'Shared a video' : 'A video')}
        </span>
      </span>
      <VideoThumbnail embed={video} className="aspect-video w-28 shrink-0" />
    </span>
  );
}
