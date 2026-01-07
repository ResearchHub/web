'use client';

import { ChevronDown, Tags } from 'lucide-react';
import { useState, useMemo } from 'react';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { EXCLUDED_TOPIC_SLUGS } from '@/constants/topics';

interface Topic {
  id: string | number;
  name: string;
  slug: string;
  namespace?: 'journal' | 'topic' | 'category' | 'subcategory';
}

interface TopicsSectionProps {
  topics: Topic[];
}

export const TopicsSection = ({ topics }: TopicsSectionProps) => {
  const [showAllTopics, setShowAllTopics] = useState(false);

  // Sort topics: lowest-id category first, lowest-id subcategory second, then the rest
  const sortedTopics = useMemo(() => {
    const filtered = topics.filter((topic) => !EXCLUDED_TOPIC_SLUGS.includes(topic.slug));

    // Find the category and subcategory with the lowest ids
    const categories = filtered.filter((t) => t.namespace === 'category');
    const subcategories = filtered.filter((t) => t.namespace === 'subcategory');
    const others = filtered.filter(
      (t) => t.namespace !== 'category' && t.namespace !== 'subcategory'
    );

    // Sort each group by id to get the lowest
    categories.sort((a, b) => Number(a.id) - Number(b.id));
    subcategories.sort((a, b) => Number(a.id) - Number(b.id));

    const result: Topic[] = [];

    // Add the lowest-id category first
    if (categories.length > 0) {
      result.push(categories[0]);
    }

    // Add the lowest-id subcategory second
    if (subcategories.length > 0) {
      result.push(subcategories[0]);
    }

    // Add remaining categories (excluding the first one already added)
    result.push(...categories.slice(1));

    // Add remaining subcategories (excluding the first one already added)
    result.push(...subcategories.slice(1));

    // Add all other topics
    result.push(...others);

    return result;
  }, [topics]);

  if (sortedTopics.length === 0) return null;

  const displayedTopics = showAllTopics ? sortedTopics : sortedTopics.slice(0, 5);
  const hasMoreTopics = sortedTopics.length > 5;

  return (
    <section>
      <div className="flex items-center space-x-2 mb-4">
        <Tags className="h-6 w-6 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">Topics</h2>
      </div>
      {/* Show the same topics UI across breakpoints (do not hide on mobile) */}
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
