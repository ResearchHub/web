'use client';

import Link from 'next/link';
import { Topic } from '@/types/topic';
import { Card } from '@/components/ui/Card';
import { FollowTopicButton } from '@/components/ui/FollowTopicButton';
import { getSubcategoryEmoji } from './lib/TopicIcons';
import { toTitleCase } from '@/utils/stringUtils';

interface TopicListProps {
  topics: Topic[];
  className?: string;
}

export function TopicList({ topics, className = '' }: TopicListProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${className}`}>
      {topics.map((topic) => {
        const emoji = getSubcategoryEmoji(topic.name);
        const topicTitle = toTitleCase(topic.name);

        return (
          <Card
            key={topic.id}
            className="group hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            <div className="p-2.5">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/topic/${topic.slug}`}
                  className="flex items-center gap-2 flex-1 min-w-0"
                >
                  <span className="text-2xl flex-shrink-0">{emoji}</span>
                  <h3 className="font-semibold text-base text-gray-900 break-words">
                    {topicTitle}
                  </h3>
                </Link>

                <FollowTopicButton topicId={topic.id} size="sm" className="flex-shrink-0 ml-auto" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
