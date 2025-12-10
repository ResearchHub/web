'use client';

import { ChevronDown, Tags } from 'lucide-react';
import { useState, useMemo } from 'react';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { EXCLUDED_TOPIC_SLUGS } from '@/constants/topics';

interface Topic {
  id: string | number;
  name: string;
  slug: string;
}

interface TopicsSectionProps {
  topics: Topic[];
  category?: Topic;
  subcategory?: Topic;
}

export const TopicsSection = ({ topics, category, subcategory }: TopicsSectionProps) => {
  const [showAllTopics, setShowAllTopics] = useState(false);

  // Sort topics: category first, then subcategory, then the rest
  const sortedTopics = useMemo(() => {
    const filteredTopics = topics.filter((topic) => !EXCLUDED_TOPIC_SLUGS.includes(topic.slug));

    // Create a priority map for sorting
    const getPriority = (topic: Topic): number => {
      if (category && topic.id === category.id) return 0;
      if (subcategory && topic.id === subcategory.id) return 1;
      return 2;
    };

    return [...filteredTopics].sort((a, b) => getPriority(a) - getPriority(b));
  }, [topics, category, subcategory]);

  if (sortedTopics.length === 0) return null;

  const displayedTopics = showAllTopics ? sortedTopics : sortedTopics.slice(0, 5);
  const hasMoreTopics = sortedTopics.length > 5;

  return (
    <section>
      <div className="flex items-center space-x-2 mb-4">
        <Tags className="h-6 w-6 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">Topics</h2>
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {displayedTopics.map((topic) => (
            <TopicAndJournalBadge key={topic.id} name={topic.name} slug={topic.slug} size="md" />
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
