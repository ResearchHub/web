'use client';

import { FC } from 'react';
import { FeedEntry, FeedPaperContent, FeedPostContent } from '@/types/feed';
import { Badge } from '@/components/ui/Badge';
import { Pin, Eye, MessageSquare, Star, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';

type JournalHighlightItemProps = {
  entry: FeedEntry;
};

// Type guard to check if content is a paper or post with the required properties
const isPaperOrPostContent = (content: any): content is FeedPaperContent | FeedPostContent => {
  return (
    content &&
    'contentType' in content &&
    (content.contentType === 'PAPER' ||
      content.contentType === 'POST' ||
      content.contentType === 'PREREGISTRATION') &&
    'title' in content &&
    'textPreview' in content &&
    'slug' in content
  );
};

const getHighlightIcon = (highlightType: string) => {
  switch (highlightType) {
    case 'editors-choice':
      return <Award className="w-4 h-4 text-amber-600" />;
    case 'most-cited':
      return <TrendingUp className="w-4 h-4 text-blue-600" />;
    case 'trending':
      return <Eye className="w-4 h-4 text-green-600" />;
    default:
      return <Star className="w-4 h-4 text-purple-600" />;
  }
};

const getHighlightBadge = (highlightType: string) => {
  switch (highlightType) {
    case 'editors-choice':
      return { label: "Editor's Choice", color: 'bg-amber-100 text-amber-800' };
    case 'most-cited':
      return { label: 'Most Cited', color: 'bg-blue-100 text-blue-800' };
    case 'trending':
      return { label: 'Trending', color: 'bg-green-100 text-green-800' };
    case 'breakthrough':
      return { label: 'Breakthrough', color: 'bg-purple-100 text-purple-800' };
    default:
      return { label: 'Featured', color: 'bg-gray-100 text-gray-800' };
  }
};

export const JournalHighlightItem: FC<JournalHighlightItemProps> = ({ entry }) => {
  const { content, metrics } = entry;

  // Only render if content is a paper or post with required properties
  if (!isPaperOrPostContent(content)) {
    return null;
  }

  const highlightType = (entry as any).highlightType || 'featured';
  const badge = getHighlightBadge(highlightType);

  const generateHref = () => {
    if (content.contentType === 'PAPER') {
      return `/paper/${content.id}/${content.slug}`;
    } else if (content.contentType === 'POST') {
      return `/post/${content.id}/${content.slug}`;
    } else if (content.contentType === 'PREREGISTRATION') {
      return `/fund/${content.id}/${content.slug}`;
    }
    return `/paper/${content.id}/${content.slug}`; // fallback
  };

  return (
    <Link href={generateHref()}>
      <div className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {content.title}
          </h3>

          <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-3">
            {content.textPreview}
          </p>

          {/* Authors */}
          {'authors' in content && content.authors && content.authors.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1 text-xs text-gray-500 line-clamp-1">
                <span>By</span>
                <span className="font-medium text-gray-700">
                  {content.authors.map((author, index) => (
                    <span key={author.id}>
                      {author.fullName}
                      {index < content.authors.length - 1 && ', '}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          )}

          {/* Topics */}
          {'topics' in content && content.topics && content.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {content.topics.slice(0, 2).map((topic) => (
                <Badge key={topic.id} variant="default" className="text-xs px-2 py-0.5">
                  {topic.name}
                </Badge>
              ))}
              {content.topics.length > 2 && (
                <Badge variant="default" className="text-xs px-2 py-0.5">
                  +{content.topics.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Metrics */}
          {metrics && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{metrics.votes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{metrics.comments}</span>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(content.createdDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
