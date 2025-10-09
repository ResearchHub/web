'use client';

import Link from 'next/link';
import { Hash, Check } from 'lucide-react';
import { Topic } from '@/types/topic';
import { FollowTopicButton } from '@/components/ui/FollowTopicButton';
import { toTitleCase } from '@/utils/stringUtils';
import { getTopicEmoji } from './TopicEmojis';
import { useFollowContext } from '@/contexts/FollowContext';
import { cn } from '@/utils/styles';

interface TopicListProps {
  topics: Topic[];
  className?: string;
  variant?: 'default' | 'compact';
}

export function TopicList({ topics, className = '', variant = 'default' }: TopicListProps) {
  const { followedTopicIds, toggleFollow } = useFollowContext();

  const handleCompactClick = async (e: React.MouseEvent, topicId: number) => {
    e.preventDefault();
    await toggleFollow(topicId);
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {topics.map((topic) => {
        const topicTitle = toTitleCase(topic.name);
        const isFollowed = followedTopicIds.includes(topic.id);

        // Get emoji from mapping based on name or slug, fallback to Hash icon
        const displayIcon = getTopicEmoji(topic.name) || getTopicEmoji(topic.slug);

        if (variant === 'compact') {
          return (
            <button
              key={topic.id}
              onClick={(e) => handleCompactClick(e, topic.id)}
              className={cn(
                'group bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden w-full text-left p-4 relative',
                'flex items-center gap-3 h-16',
                'max-[480px]:flex-col max-[480px]:gap-2 max-[480px]:h-auto max-[480px]:items-start max-[480px]:py-3',
                isFollowed
                  ? 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                  : 'border-gray-200 hover:shadow-md hover:border-gray-300'
              )}
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {displayIcon ? (
                  <span className="text-2xl">{displayIcon}</span>
                ) : (
                  <Hash className={cn('w-6 h-6', isFollowed ? 'text-blue-600' : 'text-gray-400')} />
                )}
              </div>

              <h3
                className={cn(
                  'font-medium text-sm truncate flex-1',
                  isFollowed ? 'text-blue-900' : 'text-gray-900'
                )}
              >
                {topicTitle}
              </h3>

              {isFollowed && (
                <div className="flex-shrink-0 max-[480px]:absolute max-[480px]:top-2 max-[480px]:right-2">
                  <Check className="w-5 h-5 text-blue-600" />
                </div>
              )}
            </button>
          );
        }

        return (
          <Link
            key={topic.id}
            href={`/topic/${topic.slug}`}
            className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden h-28 block"
          >
            <div className="p-5 w-full h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl flex-shrink-0 w-10 h-10 flex items-center justify-center">
                  {displayIcon ? (
                    <span className="text-3xl">{displayIcon}</span>
                  ) : (
                    <Hash className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                <div className="flex-shrink-0 -mr-1 -mt-0.5">
                  <div className="p-1.5">
                    <FollowTopicButton topicId={topic.id} size="sm" />
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-md text-gray-900 break-words leading-tight">
                  {topicTitle}
                </h3>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
