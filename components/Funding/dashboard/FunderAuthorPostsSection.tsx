'use client';

import { FC, useMemo } from 'react';
import { AuthorPostsCarousel } from '@/components/Comment/components/AuthorPostsCarousel';
import type { PostCardVideo } from '@/components/Comment/lib/postCard';
import { useFunderAuthorPosts } from './hooks/useFunderAuthorPosts';

interface FunderAuthorPostsSectionProps {
  funderId: number;
  className?: string;
}

// Demo-only: a scripted video update from an applicant, prepended as the first
// card so it always leads the funder's recent-activity carousel. Clicking the
// card opens a modal that plays the video.
const DEMO_VIDEO_UPDATE: PostCardVideo = {
  kind: 'video',
  key: 'demo-video-update-ruslan',
  author: {
    fullName: 'Ruslan Rus',
    profileImage: '/people/ruslan.jpeg',
  },
  createdDate: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  snippet: 'Sharing a quick video update on our remyelination progress.',
  videoUrl: '/rus.MP4',
  relatedWork: {
    title:
      'A conserved fibrotic extracellular-matrix brake on remyelination: cross-lesion single-nucleus mapping of oligodendrocyte differentiation arrest in multiple sclerosis',
    href: '/proposal/30/a-conserved-fibrotic-extracellular-matrix-brake-on-remyelination-cross-lesion-single-nucleus-mapping-of-oligodendrocyte-differentiation-arrest-in-multiple-sclerosis',
  },
};

const EmptyState: FC = () => (
  <div className="rounded-xl border border-dashed border-gray-200 px-6 py-12 text-center">
    <p className="text-sm text-gray-500">
      No activity yet — author updates and peer reviews from your applicants will show up here.
    </p>
  </div>
);

export const FunderAuthorPostsSection: FC<FunderAuthorPostsSectionProps> = ({
  funderId,
  className,
}) => {
  const { cards, isLoading, hasMore, loadMore } = useFunderAuthorPosts(funderId);

  const cardsWithDemoVideo = useMemo(() => [DEMO_VIDEO_UPDATE, ...cards], [cards]);

  return (
    <AuthorPostsCarousel
      cards={cardsWithDemoVideo}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      title="Recent activity"
      subtitle="Recent updates from authors and peer-reviewers"
      headerVariant="page"
      showRelatedWork
      showTypeBadge
      emptyState={<EmptyState />}
      variant="plain"
      className={className}
    />
  );
};
