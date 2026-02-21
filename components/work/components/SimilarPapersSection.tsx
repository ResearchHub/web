'use client';

import { useEffect, useState } from 'react';
import { PaperService } from '@/services/paper.service';
import { Work } from '@/types/work';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { AuthorList } from '@/components/ui/AuthorList';
import { truncateText } from '@/utils/stringUtils';
import { Skeleton } from '@/components/ui/Skeleton';

interface SimilarPapersSectionProps {
  paperId: number;
}

const SimilarPaperCardSkeleton = () => (
  <div className="bg-gray-50 rounded-md border border-l-2 border-l-gray-400 border-gray-200 p-2.5">
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-3 w-3/4" />
  </div>
);

export const SimilarPapersSection = ({ paperId }: SimilarPapersSectionProps) => {
  const [similarPapers, setSimilarPapers] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarPapers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const papers = await PaperService.getSimilarPapers(paperId);
        setSimilarPapers(papers || []);
      } catch (err) {
        console.error('Error fetching similar papers:', err);
        setError('Failed to load similar papers');
      } finally {
        setIsLoading(false);
      }
    };

    if (paperId) {
      fetchSimilarPapers();
    }
  }, [paperId]);

  // Don't render if there's an error
  if (error) {
    return null;
  }

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-6 w-6 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Similar Papers</h2>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <SimilarPaperCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      </section>
    );
  }

  if (!similarPapers || similarPapers.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-6 w-6 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">Similar Papers</h2>
      </div>
      <div className="space-y-2">
        {similarPapers.slice(0, 3).map((paper) => {
          const authors =
            paper.authors?.map((author) => ({
              name: author.authorProfile.fullName,
              verified: author.authorProfile.user?.isVerified,
              profileUrl: author.authorProfile.profileUrl,
            })) || [];

          const paperUrl = `/paper/${paper.id}/${paper.slug}`;
          const truncatedTitle = truncateText(paper.title, 80);
          const formattedDate = paper.publishedDate
            ? new Date(paper.publishedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : null;

          return (
            <Link
              key={paper.id}
              href={paperUrl}
              className="block bg-gray-50 rounded-md border border-l-2 border-l-gray-400 border-gray-200 p-2.5 hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-xs font-medium text-gray-900 line-clamp-2 mb-1.5">
                {truncatedTitle}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {authors.length > 0 && (
                  <AuthorList
                    authors={authors}
                    size="xs"
                    className="text-gray-600 font-normal"
                    delimiter="•"
                    maxLength={2}
                  />
                )}
                {formattedDate && (
                  <>
                    {authors.length > 0 && <span className="text-xs text-gray-400">•</span>}
                    <span className="text-xs text-gray-500">{formattedDate}</span>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
