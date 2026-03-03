'use client';

import { ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { HashtagBadge } from '@/components/ui/badges/HashtagBadge';
import { EXCLUDED_TOPIC_SLUGS } from '@/constants/topics';
import { SidebarHeader } from '@/components/ui/SidebarHeader';

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

  const sortedTopics = useMemo(() => {
    const filtered = topics.filter((topic) => !EXCLUDED_TOPIC_SLUGS.includes(topic.slug));

    const categories = filtered.filter((t) => t.namespace === 'category');
    const subcategories = filtered.filter((t) => t.namespace === 'subcategory');
    const others = filtered.filter(
      (t) => t.namespace !== 'category' && t.namespace !== 'subcategory'
    );

    categories.sort((a, b) => Number(a.id) - Number(b.id));
    subcategories.sort((a, b) => Number(a.id) - Number(b.id));

    const result: Topic[] = [];

    if (categories.length > 0) {
      result.push(categories[0]);
    }

    if (subcategories.length > 0) {
      result.push(subcategories[0]);
    }

    result.push(...categories.slice(1));
    result.push(...subcategories.slice(1));
    result.push(...others);

    return result;
  }, [topics]);

  if (sortedTopics.length === 0) return null;

  const displayedTopics = showAllTopics ? sortedTopics : sortedTopics.slice(0, 5);
  const hasMoreTopics = sortedTopics.length > 5;

  return (
    <section>
      <SidebarHeader title="Topics" className="mb-3" />
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          {displayedTopics.map((topic) => (
            <HashtagBadge
              key={topic.id}
              label={topic.slug || topic.name}
              href={`/topic/${topic.slug}`}
            />
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
