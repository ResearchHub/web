'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Fundraise } from '@/types/funding';
import { FundraiseProgress } from '@/components/Fund/FundraiseProgress';
import { PostBlockEditor } from '@/components/work/PostBlockEditor';
import { cn } from '@/utils/styles';
import { usePostContent } from '@/hooks/usePostContent';

interface ProposalPeekViewProps {
  postId: number;
  slug: string;
  fundraise: Fundraise;
  title: string;
  className?: string;
}

export const ProposalPeekView: FC<ProposalPeekViewProps> = ({
  postId,
  slug,
  fundraise,
  title,
  className,
}) => {
  const { work, htmlContent, isLoading, error } = usePostContent(postId);

  const proposalHref = `/proposal/${postId}/${slug}`;

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="w-[90%] mx-auto py-4 space-y-4">
          <div className="w-full aspect-[2/1] bg-gray-100 rounded-lg" />
          <div className="h-20 bg-gray-100 rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-4/6" />
            <div className="h-4 bg-gray-100 rounded w-3/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-4 text-sm text-gray-500', className)}>
        {error}.{' '}
        <Link href={proposalHref} className="text-indigo-600 hover:underline">
          View full proposal
        </Link>
      </div>
    );
  }

  const hasContent = work?.previewContent || htmlContent;

  return (
    <div
      className={cn('border-t border-gray-200 bg-gray-50', className)}
      onClick={(e) => e.preventDefault()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="w-[90%] mx-auto py-4 space-y-4">
        {work?.image && (
          <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={work.image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 90vw, 774px"
            />
          </div>
        )}

        <FundraiseProgress fundraise={fundraise} fundraiseTitle={title} work={work ?? undefined} />

        {hasContent && (
          <div className="relative">
            <div className="max-h-[400px] overflow-y-auto">
              {work?.previewContent ? (
                <PostBlockEditor content={work.previewContent} />
              ) : htmlContent ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              ) : null}
            </div>
            <div className="sticky bottom-0 h-16 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
          </div>
        )}

        <Link
          href={proposalHref}
          className="text-sm font-medium text-primary-600 hover:text-primary-600 hover:underline"
        >
          Read full proposal &rarr;
        </Link>
      </div>
    </div>
  );
};
