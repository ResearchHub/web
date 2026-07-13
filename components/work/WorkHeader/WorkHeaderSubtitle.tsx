'use client';

import Link from 'next/link';
import { Lock, Star } from 'lucide-react';
import { AuthorList } from '@/components/ui/AuthorList';
import { Tooltip } from '@/components/ui/Tooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Review } from '@/types/feed';
import { buildWorkUrl, generateSlug } from '@/utils/url';

interface WorkHeaderSubtitleProps {
  work: Work;
  metadata?: WorkMetadata;
  reviewsUrl?: string;
}

export function WorkHeaderSubtitle({ work, metadata, reviewsUrl }: WorkHeaderSubtitleProps) {
  const authors = work.authors.map((a) => ({
    name: a.authorProfile.fullName,
    verified: a.authorProfile.user?.isVerified,
    profileUrl: `/author/${a.authorProfile.id}`,
    authorUrl: a.authorProfile.user ? `/author/${a.authorProfile.id}` : undefined,
  }));

  const reviewScore = metadata?.metrics?.reviewScore || work.metrics?.reviewScore;
  const hasReviewScore = reviewScore !== undefined && reviewScore > 0;

  const reviews: Review[] = (work.peerReviews ?? []).map((pr) => ({
    id: pr.id,
    score: pr.score,
    author: {
      id: pr.createdBy.authorProfile.id,
      fullName: pr.createdBy.authorProfile.fullName,
      profileImage: pr.createdBy.authorProfile.profileImage,
      firstName: '',
      lastName: '',
      headline: '',
      profileUrl: `/author/${pr.createdBy.authorProfile.id}`,
      isClaimed: false,
      isVerified: pr.createdBy.authorProfile.isVerified,
    },
    isAssessed: pr.isAssessed,
  }));

  const isPrivate = work.isPublic === false && work.contentType === 'preregistration';
  const linkedGrant = work.linkedGrant;
  const linkedGrantTitle =
    linkedGrant?.title ||
    linkedGrant?.shortTitle ||
    linkedGrant?.organization ||
    'a funding opportunity';
  const linkedGrantHref = linkedGrant?.postId
    ? buildWorkUrl({
        id: linkedGrant.postId,
        slug: generateSlug(linkedGrantTitle),
        contentType: 'funding_request',
      })
    : null;

  return (
    <div className="flex flex-col gap-2">
      {isPrivate && (
        <div className="inline-flex items-center gap-1.5 text-sm text-amber-700">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span>
            Proposal submitted privately to{' '}
            {linkedGrantHref ? (
              <Link href={linkedGrantHref} className="hover:underline">
                {linkedGrantTitle}
              </Link>
            ) : (
              linkedGrantTitle
            )}
          </span>
        </div>
      )}
      {authors.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-base text-gray-500">By</span>
          <AuthorList
            authors={authors}
            size="base"
            className="text-gray-600 font-medium"
            delimiterClassName="text-gray-400"
            delimiter="·"
            showAbbreviatedInMobile
            mobileExpandable
          />
          {work.type === 'preprint' && (
            <span className="font-medium text-xs px-2 py-0.5 rounded-md text-yellow-700 bg-yellow-100">
              Preprint
            </span>
          )}
        </div>
      )}
      {(work.publishedDate || hasReviewScore) && (
        <div className="flex items-center flex-wrap text-sm text-gray-500">
          {work.publishedDate && (
            <span>
              {new Date(work.publishedDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
          {hasReviewScore && (
            <>
              {work.publishedDate && <span className="mx-2 text-gray-400">•</span>}
              <Tooltip
                content={
                  <PeerReviewTooltip
                    reviews={reviews}
                    averageScore={reviewScore}
                    href={reviewsUrl}
                  />
                }
                position="top"
                width="w-[320px]"
              >
                {reviewsUrl ? (
                  <Link
                    href={reviewsUrl}
                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                  >
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {reviewScore.toFixed(1)}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 cursor-help">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {reviewScore.toFixed(1)}
                  </span>
                )}
              </Tooltip>
            </>
          )}
        </div>
      )}
    </div>
  );
}
