'use client';

import React, { useEffect, useState } from 'react';
import { Work } from '@/types/work';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Carousel, CarouselCard } from '@/components/ui/Carousel';
import { CommentService } from '@/services/comment.service';
import { Comment } from '@/types/comment';
import { Star } from 'lucide-react';
import { navigateToAuthorProfile } from '@/utils/navigation';

interface ReviewsSectionProps {
  work: Work;
}

const ReviewCard = ({ review }: { review: Comment }) => {
  const author = review.createdBy?.authorProfile;
  if (!author) return null;

  return (
    <div className="flex items-start gap-3.5">
      <div className="relative flex-shrink-0">
        <AuthorTooltip authorId={author.id}>
          <Avatar
            src={author.profileImage}
            alt={author.fullName}
            size={48}
            authorId={author.id}
          />
        </AuthorTooltip>
        {author.isVerified && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-px">
            <VerifiedBadge size="xs" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center pt-0.5">
        <h4 className="text-sm font-semibold text-gray-900 truncate">{author.fullName}</h4>
        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 w-fit mt-1">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-amber-700">
            {review.reviewScore.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export function ReviewsSection({ work }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const reviewScore = work.metrics?.reviewScore || 0;
  const reviewCount = work.metrics?.reviews || 0;

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        const { comments } = await CommentService.fetchComments({
          documentId: work.id,
          contentType: work.contentType,
          filter: 'REVIEW',
          pageSize: 10,
        });
        setReviews(comments);
      } catch (error) {
        console.error('Error loading reviews for sidebar:', error);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [work.id, work.contentType]);

  const overallScoreBadge = reviewScore > 0 && (
    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
      <span className="text-sm font-bold text-amber-700">{reviewScore.toFixed(1)}</span>
      <span className="text-[10px] text-amber-500 font-medium ml-0.5">({reviewCount})</span>
    </div>
  );

  if (loading) {
    return (
      <section>
        <SectionHeader title="Peer Reviews" action={overallScoreBadge} />
        <div className="animate-pulse space-y-5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2.5">
              <div className="w-12 h-5 bg-gray-100 rounded-full" />
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5 pt-1">
                  <div className="h-3.5 bg-gray-100 rounded w-24" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section>
        <SectionHeader title="Peer Reviews" />
        <div className="rounded-xl p-5 text-center border border-dashed border-gray-200">
          <p className="text-sm text-gray-400">
            No peer reviews yet. Be the first to review this proposal.
          </p>
        </div>
      </section>
    );
  }

  // Single review: render directly without carousel
  if (reviews.length === 1) {
    const review = reviews[0];
    const authorId = review.createdBy?.authorProfile?.id;

    return (
      <section>
        <SectionHeader title="Peer Reviews" action={overallScoreBadge} />
        <div
          className={authorId ? 'cursor-pointer' : ''}
          onClick={() => authorId && navigateToAuthorProfile(authorId)}
        >
          <ReviewCard review={review} />
        </div>
      </section>
    );
  }

  const carouselCards: CarouselCard[] = reviews.map((review) => ({
    content: <ReviewCard review={review} />,
    onClick: () => {
      const authorId = review.createdBy?.authorProfile?.id;
      if (authorId) {
        navigateToAuthorProfile(authorId);
      }
    },
  }));

  return (
    <section>
      <SectionHeader title="Peer Reviews" action={overallScoreBadge} />
      <Carousel cards={carouselCards} cardWidth="w-[220px]" cardClassName="" gap="gap-4" />
    </section>
  );
}
