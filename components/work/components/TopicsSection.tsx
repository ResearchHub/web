'use client';

import { ChevronDown, Tags } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';

interface Topic {
  id: string | number;
  name: string;
  slug: string;
}

interface TopicsSectionProps {
  topics: Topic[];
}

export const TopicsSection = ({ topics }: TopicsSectionProps) => {
  const [showAllTopics, setShowAllTopics] = useState(false);

  if (!topics || topics.length === 0) return null;

  const displayedTopics = showAllTopics ? topics : topics.slice(0, 5);
  const hasMoreTopics = topics.length > 5;

  return (
    <section>
      <div className="flex items-center space-x-2 mb-4">
        <Tags className="h-5 w-5 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">Topics</h2>
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {displayedTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topic/${topic.slug}`}
              className="hover:opacity-80 transition-colors"
            >
              <Badge variant="default" size="lg" className="cursor-pointer hover:bg-gray-200">
                {topic.name}
              </Badge>
            </Link>
          ))}
        </div>
        {hasMoreTopics && (
          <button
            onClick={() => setShowAllTopics(!showAllTopics)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <span>{showAllTopics ? 'Show less' : 'Show all topics'}</span>
            <ChevronDown
              className={`h-4 w-4 ml-1 transition-transform ${showAllTopics ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
    </section>
  );
};
