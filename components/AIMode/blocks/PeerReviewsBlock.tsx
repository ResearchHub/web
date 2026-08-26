'use client';

import { Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { ProposalWorkCard } from '@/components/Funding/ProposalWorkCard';
import { cn } from '@/utils/styles';
import { useAIMode } from '../lib/AIModeContext';
import { getExpert } from '../lib/experts';
import { getFeedEntries, getProposal, rankProposals } from '../lib/proposals';
import type { ProposalRecord } from '../lib/types';

const STARS = [1, 2, 3, 4, 5];

const ScoreStars = ({ score }: { readonly score: number }) => (
  <span className="inline-flex items-center gap-0.5">
    {STARS.map((position) => (
      <Star
        key={position}
        className={cn(
          'h-3.5 w-3.5',
          position <= Math.round(score) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
        )}
      />
    ))}
  </span>
);

interface ReviewProps {
  readonly proposal: ProposalRecord;
}

const Review = ({ proposal }: ReviewProps) => {
  const { actions } = useAIMode();
  const [entry] = getFeedEntries([proposal.postId]);
  const { peerReview } = proposal;
  const reviewer = getExpert(peerReview.reviewerName);

  return (
    <div className="border-t border-gray-200 p-3.5 first:border-t-0">
      <div className="flex items-start gap-2.5">
        <Avatar src={reviewer?.avatarUrl} alt={peerReview.reviewerName} size="sm" disableTooltip />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span className="text-sm font-semibold text-gray-900">{peerReview.reviewerName}</span>
            <span className="text-sm text-gray-500">peer reviewed and scored</span>
            <ScoreStars score={peerReview.score} />
          </div>
          {reviewer && (
            <div className="mt-0.5 truncate text-xs text-gray-500">{reviewer.affiliation}</div>
          )}
        </div>
      </div>

      <div className="mt-2.5">
        <div className="text-sm font-semibold text-gray-900">{peerReview.heading}</div>
        <p className="mt-1 text-sm leading-relaxed text-gray-700">{peerReview.body}</p>
      </div>

      {entry && (
        <div className="mt-3">
          <ProposalWorkCard entry={entry} onNavigate={actions.close} />
        </div>
      )}
    </div>
  );
};

interface PeerReviewsBlockProps {
  readonly postIds: number[];
  readonly heading?: string;
}

/**
 * The evidence beat: one written review per proposal, with the proposal it was
 * written against directly beneath it. Splitting review from disbursement is
 * what stops the updates track collapsing into a single click that produces a
 * finished allocation out of nowhere.
 */
export const PeerReviewsBlock = ({ postIds, heading }: PeerReviewsBlockProps) => {
  const proposals = rankProposals(
    postIds
      .map((postId) => getProposal(postId))
      .filter((proposal): proposal is ProposalRecord => !!proposal)
  );

  if (proposals.length === 0) return null;

  return (
    <div className="mt-4 max-w-[620px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-3.5 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {heading ?? 'Peer reviews'}
        </span>
        <span className="text-xs text-gray-500">
          {proposals.length} {proposals.length === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      <div>
        {proposals.map((proposal) => (
          <Review key={proposal.postId} proposal={proposal} />
        ))}
      </div>
    </div>
  );
};
