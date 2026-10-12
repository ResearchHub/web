'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { Avatar } from '@/components/ui/Avatar';
import { SidePanel } from '@/components/ui/SidePanel';
import { ActivityAuthorSummary } from '@/components/Activity/cards/ActivityAuthorSummary';
import { ActivityQuotedComment } from '@/components/Activity/cards/ActivityQuotedComment';
import { ReviewScoreStars } from '@/components/Activity/amounts/ReviewScoreStars';
import type { ActivityComment } from '@/components/Activity/lib/activityDisplay.utils';
import {
  getWorkHrefForComment,
  type ActivityWork,
} from '@/components/Activity/lib/activityWork.utils';
import { formatTimestamp } from '@/utils/date';

interface ActivityCommentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  comment: ActivityComment;
  /** The work the comment is on. */
  work: ActivityWork;
  /** Switches the panel to the comment this one replies to. */
  onOpenParent?: () => void;
}

function panelTitle(comment: ActivityComment): string {
  switch (comment.kind) {
    case 'review':
      return 'Peer review';
    case 'update':
      return 'Author update';
    case 'answer':
      return 'Answer';
    default:
      return comment.parent ? 'Reply' : 'Comment';
  }
}

function footerLabel(comment: ActivityComment): string {
  switch (comment.kind) {
    case 'review':
      return 'See all reviews';
    case 'update':
      return 'See all updates';
    default:
      return 'Open the conversation';
  }
}

/**
 * Someone's comment, reply or peer review in full, opened from a feed card without
 * leaving the feed. The author's own formatting is kept here; this is where it's read.
 */
export const ActivityCommentPanel: FC<ActivityCommentPanelProps> = ({
  isOpen,
  onClose,
  comment,
  work,
  onOpenParent,
}) => {
  const { author, content, format, score, parent, createdDate } = comment;
  const headline = author.headline?.trim();
  const href = getWorkHrefForComment(work, comment.kind);

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={panelTitle(comment)}
      footer={
        <Link
          href={href}
          className="inline-flex h-10 items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-gray-600"
        >
          {footerLabel(comment)}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      }
    >
      <div className="flex flex-col gap-5 px-4 py-5 tablet:px-6">
        <div className="flex items-center gap-3">
          <Avatar
            src={author.profileImage}
            alt={author.fullName || 'Author'}
            size="md"
            authorId={author.id}
          />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] leading-5">
              <ActivityAuthorSummary authors={[author]} />
            </div>
            <div className="truncate text-[13px] leading-[18px] text-gray-500">
              {[headline, createdDate && formatTimestamp(createdDate, false)]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>
        </div>

        {score != null && (
          <div className="flex items-center gap-2">
            <ReviewScoreStars score={score} size="md" />
            <span className="font-mono text-sm font-semibold text-amber-700">
              {score.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">overall</span>
          </div>
        )}

        <Link
          href={href}
          className="flex items-center gap-3 rounded-xl border border-gray-200 p-2 pr-3 hover:bg-gray-50"
        >
          <div className="relative h-11 w-[72px] flex-shrink-0 overflow-hidden rounded-lg bg-gray-900">
            {work.imageUrl && (
              <Image src={work.imageUrl} alt="" fill className="object-cover" sizes="72px" />
            )}
          </div>
          <span className="line-clamp-2 min-w-0 text-sm font-semibold leading-5 text-gray-900">
            {work.title}
          </span>
        </Link>

        {parent && <ActivityQuotedComment comment={parent} onOpen={onOpenParent} lines={4} />}

        <CommentReadOnly
          content={content}
          contentFormat={format}
          initiallyExpanded
          showLinkPreviews={false}
          className="text-[15px] leading-7 text-gray-800"
        />
      </div>
    </SidePanel>
  );
};
