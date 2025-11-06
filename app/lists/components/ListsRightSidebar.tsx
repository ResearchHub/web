'use client';

import { ListStats, TopAuthor, TopCategory, TopTopic } from '@/types/user-list';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { formatCount } from '@/utils/listUtils';

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
          <h2 className="font-semibold text-gray-900">Top Authors</h2>
        </div>
        <ListStatsSkeleton />
      </div>
    );
  }

  if (authors.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-baseline mb-3">
        <h2 className="font-semibold text-gray-900">Top Authors</h2>
      </div>
      <div className="space-y-3">
        {authors.slice(0, 5).map((author) => {
          const authorName =
            author.full_name ||
            `${author.first_name || ''} ${author.last_name || ''}`.trim() ||
            'Unknown Author';
          return (
            <div
              key={author.id}
              onClick={() => navigateToAuthorProfile(author.id)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Avatar size="sm" authorId={author.id} alt={authorName} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{authorName}</div>
                <div className="text-xs text-gray-500">{formatCount(author.count)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface TopCategoriesSectionProps {
  categories: TopCategory[];
  isLoading: boolean;
}

const TopCategoriesSection = ({ categories, isLoading }: TopCategoriesSectionProps) => {
  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-baseline mb-3">
          <h2 className="font-semibold text-gray-900">Top Categories</h2>
        </div>
        <ListStatsSkeleton />
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-baseline mb-3">
        <h2 className="font-semibold text-gray-900">Top Categories</h2>
      </div>
      <div className="space-y-3">
        {categories.slice(0, 5).map((category) => (
          <Link
            key={category.id}
            href={`/hub/${category.id}`}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <span className="text-sm text-gray-900">{category.name}</span>
            <span className="text-xs text-gray-500">{category.itemCount}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

interface TopTopicsSectionProps {
  topics: TopTopic[];
  isLoading: boolean;
}

const TopTopicsSection = ({ topics, isLoading }: TopTopicsSectionProps) => {
  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-baseline mb-3">
          <h2 className="font-semibold text-gray-900">Top Topics</h2>
        </div>
        <ListStatsSkeleton />
      </div>
    );
  }

  if (topics.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-baseline mb-3">
        <h2 className="font-semibold text-gray-900">Top Topics</h2>
      </div>
      <div className="space-y-3">
        {topics.slice(0, 5).map((topic) => (
          <Link
            key={topic.id}
            href={`/topic/${topic.id}`}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <span className="text-sm text-gray-900">{topic.name}</span>
            <span className="text-xs text-gray-500">{topic.itemCount}</span>
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
            <TopCategoriesSection categories={stats?.topCategories || []} isLoading={isLoading} />
          </div>
        </>
      )}

      {(stats?.topTopics?.length || 0) > 0 && (
        <>
          <div className="border-t border-gray-200"></div>
          <div className="bg-white rounded-lg p-4">
            <TopTopicsSection topics={stats?.topTopics || []} isLoading={isLoading} />
          </div>
        </>
      )}
    </div>
  );
}
