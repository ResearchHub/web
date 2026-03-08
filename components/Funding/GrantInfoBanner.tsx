'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { PostBlockEditor } from '@/components/work/PostBlockEditor';
import { ApplyToGrantModal } from '@/components/modals/ApplyToGrantModal';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { useUserVotes } from '@/hooks/useUserVotes';
import { Work } from '@/types/work';
import { buildWorkUrl } from '@/utils/url';

function formatCompactAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${Math.round(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd).toLocaleString()}`;
}

interface GrantInfoBannerProps {
  className?: string;
  description: string;
  content?: string;
  amountUsd?: number;
  grantId?: string;
  isActive?: boolean;
  imageUrl?: string;
  work?: Work;
  organization?: string;
}

export const GrantInfoBanner = ({
  className,
  description,
  content,
  amountUsd,
  grantId,
  isActive = true,
  imageUrl,
  work,
  organization,
}: GrantInfoBannerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const { data: userVotes } = useUserVotes({
    postIds: work ? [work.id] : [],
  });

  const userVote = work
    ? userVotes?.posts[work.id]?.voteType === 'upvote'
      ? 'UPVOTE'
      : userVotes?.posts[work.id]?.voteType === 'downvote'
        ? 'DOWNVOTE'
        : undefined
    : undefined;

  const isTruncated = description.length > 200;
  const preview = isTruncated ? description.slice(0, 200).trimEnd() : description;

  const href = work
    ? buildWorkUrl({
        id: work.id,
        slug: work.slug,
        contentType: work.contentType,
      })
    : undefined;

  return (
    <>
      <div
        className={cn(
          'w-full rounded-xl overflow-hidden transition-colors shadow-[inset_0_0_0_1px_theme(colors.primary.200)] ring-1 ring-primary-100',
          className
        )}
      >
        <div
          className={cn(imageUrl ? 'sm:!flex bg-primary-50' : 'border-l-4 border-l-primary-400')}
        >
          {/* Left column: image stretches vertically with content */}
          {imageUrl && (
            <div className="relative flex-shrink-0 w-[240px] min-h-[160px] hidden sm:!block m-3 mr-0 rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt="Grant"
                fill
                className="object-cover brightness-105 contrast-105"
                sizes="240px"
              />
            </div>
          )}

          {/* Right column: content + CTA */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="bg-gradient-to-r from-primary-50 to-primary-50/60 p-3 px-4 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-semibold text-gray-900">🏆 Funding Details</span>
                {amountUsd != null && amountUsd > 0 && (
                  <span
                    className={`font-mono font-bold text-sm px-2 py-0.5 rounded-md tabular-nums ${isActive ? 'text-primary-800 bg-primary-200/70' : 'text-gray-500 bg-gray-200'}`}
                  >
                    {formatCompactAmount(amountUsd)}
                  </span>
                )}
              </div>

              {organization && (
                <p className="text-sm text-gray-500 mb-4">Offered by {organization}</p>
              )}

              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                {preview}
                {isTruncated && <span className="text-sm font-bold text-gray-900 ml-0.5">...</span>}
              </p>

              <div className="flex items-center justify-between mt-2">
                {content ? (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1 text-sm font-bold text-gray-900 cursor-pointer hover:underline underline-offset-2"
                  >
                    {isExpanded ? 'Show less' : 'Learn more'}
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                ) : (
                  <div />
                )}

                {grantId && isActive && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsApplyModalOpen(true)}
                    className="flex-shrink-0 gap-1.5"
                  >
                    Submit Proposal
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expanded content — animated expand/collapse */}
        {content && (
          <div
            className={cn(
              'grid transition-[grid-template-rows] duration-300 ease-in-out',
              isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            )}
          >
            <div className="overflow-hidden">
              <div className="post-content bg-primary-50/25 px-6 py-4 border-t border-primary-100">
                <PostBlockEditor content={content} />
              </div>
            </div>
          </div>
        )}

        {/* FeedItemActions — full width below everything */}
        {work && (
          <div className="border-t border-gray-200">
            <FeedItemActions
              metrics={work.metrics}
              feedContentType="POST"
              votableEntityId={work.id}
              relatedDocumentId={work.id.toString()}
              relatedDocumentContentType={work.contentType}
              userVote={userVote}
              href={href}
              tips={work.tips}
              relatedDocumentTopics={work.topics}
              relatedDocumentUnifiedDocumentId={work.unifiedDocumentId?.toString()}
              hideCommentButton={(work.metrics?.comments ?? 0) === 0}
              hideReportButton={false}
              className="gap-1"
            />
          </div>
        )}
      </div>

      {grantId && (
        <ApplyToGrantModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onUseSelected={() => setIsApplyModalOpen(false)}
          grantId={grantId}
        />
      )}
    </>
  );
};
