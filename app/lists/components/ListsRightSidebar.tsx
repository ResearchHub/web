'use client';

import { ListStats, TopAuthor, TopCategory } from '@/types/user-list';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { formatCount } from '@/utils/listUtils';
import { Tags } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWreathLaurel } from '@fortawesome/pro-light-svg-icons';

const ListStatsSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-32"></div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-8 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

interface TopAuthorsSectionProps {
  authors: TopAuthor[];
  isLoading: boolean;
}

const TopAuthorsSection = ({ authors, isLoading }: TopAuthorsSectionProps) => {
  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-baseline mb-3">
          <h2 className="font-semibold text-gray-900">Authors</h2>
        </div>
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[32px_40px_1fr] gap-x-3 items-center px-1 py-2 rounded-md"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-md" />
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (authors.length === 0) {
    return null;
  }

  const renderRank = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="relative w-8 h-8 flex items-center justify-center">
          <FontAwesomeIcon icon={faWreathLaurel} className="text-yellow-500 text-2xl absolute" />
          <span className="relative text-gray-600 text-[11px] font-bold z-10">1</span>
        </div>
      );
    }
    return (
      <div className="relative w-8 h-8 flex items-center justify-center">
        <span className="text-gray-600 text-sm font-semibold">{rank}</span>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-baseline mb-3">
        <h2 className="font-semibold text-gray-900">Authors</h2>
      </div>
      <div className="space-y-3">
        {authors.slice(0, 5).map((author, index) => {
          const authorName =
            author.full_name ||
            `${author.first_name || ''} ${author.last_name || ''}`.trim() ||
            'Unknown Author';
          const rank = index + 1;
          return (
            <div
              key={author.id}
              onClick={() => navigateToAuthorProfile(author.id)}
              className="grid grid-cols-[32px_40px_1fr] gap-x-2 items-center hover:bg-gray-50 px-1 py-2 rounded-md cursor-pointer"
            >
              <div className="w-8 flex-shrink-0">{renderRank(rank)}</div>
              <div className="w-10 flex-shrink-0 flex items-center">
                <Avatar size="sm" authorId={author.id} alt={authorName} />
              </div>
              <div className="min-w-0 overflow-hidden">
                <div className="text-sm font-medium text-gray-900 block whitespace-nowrap overflow-hidden">
                  {authorName}
                </div>
                <div className="text-xs text-gray-500">{formatCount(author.count)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface TopicsSectionProps {
  categories: TopCategory[];
  isLoading: boolean;
}

const TopicsSection = ({ categories, isLoading }: TopicsSectionProps) => {
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Tags className="h-6 w-6 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Topics</h2>
        </div>
        <div className="animate-pulse flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 w-20 bg-gray-200 rounded-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Tags className="h-6 w-6 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">Topics</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/topic/${category.slug}`}
            className="flex items-center gap-1.5 rounded-full font-medium border transition-colors border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs px-2 py-1 text-gray-700"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

interface ListsRightSidebarProps {
  stats?: ListStats | null;
  isLoading?: boolean;
}

export function ListsRightSidebar({ stats, isLoading = false }: ListsRightSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-4">
        <TopAuthorsSection authors={stats?.topAuthors || []} isLoading={isLoading} />
      </div>

      {(stats?.topCategories?.length || 0) > 0 && (
        <>
          <div className="border-t border-gray-200"></div>
          <div className="bg-white rounded-lg p-4">
            <TopicsSection categories={stats?.topCategories || []} isLoading={isLoading} />
          </div>
        </>
      )}
    </div>
  );
}
