import { FC } from 'react';
import {
  SkeletonCardShell,
  SkeletonFeedItemHeader,
  SkeletonPrimaryActionPanel,
  SkeletonVoteCommentActionsFooter,
} from '@/components/Feed/skeletons/shared';

type CommentSkeletonType = 'GENERIC_COMMENT' | 'REVIEW' | 'BOUNTY' | 'ANSWER' | 'AUTHOR_UPDATE';

const actionTextWidth: Record<CommentSkeletonType, string> = {
  GENERIC_COMMENT: 'w-28',
  REVIEW: 'w-36',
  BOUNTY: 'w-24',
  ANSWER: 'w-20',
  AUTHOR_UPDATE: 'w-32',
};

const ContentLines: FC = () => (
  <div className="space-y-2">
    <div className="h-4 w-full bg-gray-200 rounded" />
    <div className="h-4 w-5/6 bg-gray-200 rounded" />
    <div className="h-4 w-4/5 bg-gray-200 rounded" />
    <div className="h-4 w-3/4 bg-gray-200 rounded" />
  </div>
);

const ReviewScoreRow: FC = () => (
  <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
    <div className="flex items-center gap-1.5">
      <div className="h-3 w-20 bg-gray-200 rounded hidden sm:block" />
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 w-4 bg-gray-200 rounded-sm" />
        ))}
      </div>
    </div>
    <div className="h-6 w-16 bg-gray-200 rounded-full" />
  </div>
);

const BountyCommentSkeleton: FC = () => (
  <div className="space-y-3 animate-pulse">
    <SkeletonCardShell>
      <div className="p-4">
        <div className="h-5 w-52 bg-gray-200 rounded mb-3" />
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        </div>
        <ContentLines />
        <SkeletonPrimaryActionPanel buttonWidth="w-20" />
      </div>
    </SkeletonCardShell>
  </div>
);

const StandardCommentSkeleton: FC<{ commentType: CommentSkeletonType }> = ({ commentType }) => (
  <div className="space-y-3 animate-pulse">
    <SkeletonFeedItemHeader actionWidth={actionTextWidth[commentType]} />
    <SkeletonCardShell>
      <div className="p-4">
        {commentType === 'REVIEW' && <ReviewScoreRow />}
        <ContentLines />
      </div>
      <div className="border-t border-gray-200 px-4 py-3">
        <SkeletonVoteCommentActionsFooter />
      </div>
    </SkeletonCardShell>
  </div>
);

export function CommentSkeleton({
  commentType = 'GENERIC_COMMENT',
}: {
  commentType?: CommentSkeletonType;
}) {
  if (commentType === 'BOUNTY') {
    return <BountyCommentSkeleton />;
  }

  return <StandardCommentSkeleton commentType={commentType} />;
}
