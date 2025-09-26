'use client';

import Link from 'next/link';
import { Hash } from 'lucide-react';
import { Topic } from '@/types/topic';
import { FollowTopicButton } from '@/components/ui/FollowTopicButton';
import { toTitleCase } from '@/utils/stringUtils';
import { getTopicEmoji } from './TopicEmojis';

interface TopicListProps {
  topics: Topic[];
  className?: string;
}

export function TopicList({ topics, className = '' }: TopicListProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${className}`}>
      {topics.map((topic) => {
        const topicTitle = toTitleCase(topic.name);
        const paperCount = topic.paperCount || 0;

        // Get emoji from mapping based on name or slug, fallback to Hash icon
        const displayIcon = getTopicEmoji(topic.name) || getTopicEmoji(topic.slug);

        return (
          <div
            key={topic.id}
            className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden h-full"
          >
            <div className="p-3 w-full">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/topic/${topic.slug}`}
                  className="flex items-start gap-3 flex-1 min-w-0"
                >
                  <div className="text-2xl flex-shrink-0 mt-0.5 w-8 h-8 flex items-center justify-center">
                    {displayIcon ? (
                      <span>{displayIcon}</span>
                    ) : (
                      <Hash className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-gray-900 break-words leading-tight">
                      {topicTitle}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {paperCount.toLocaleString()} papers
                    </p>
                  </div>
                </Link>

                <FollowTopicButton topicId={topic.id} size="sm" className="flex-shrink-0" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
