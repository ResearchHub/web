'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Topic } from '@/types/topic';
import { Button } from '@/components/ui/Button';
import { TopicList } from './TopicList';
import { getCategoryEmoji } from './lib/TopicIcons';
import { toTitleCase } from '@/utils/stringUtils';

interface TopicsByCategoryProps {
  groupedTopics: Record<string, Topic[]>;
  maxInitialTopics?: number;
}

export function TopicsByCategory({ groupedTopics, maxInitialTopics = 6 }: TopicsByCategoryProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  return (
    <>
      {Object.entries(groupedTopics).map(([category, categoryTopics]) => {
        const categoryEmoji = getCategoryEmoji(category);
        const categoryTitle = toTitleCase(category);
        const isExpanded = expandedCategories.has(category);
        const topicsToShow = isExpanded
          ? categoryTopics
          : categoryTopics.slice(0, maxInitialTopics);

        return (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{categoryEmoji}</span>
              <h2 className="text-xl font-semibold text-gray-800">{categoryTitle}</h2>
            </div>

            <TopicList topics={topicsToShow} />

            {categoryTopics.length > maxInitialTopics && !isExpanded && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="ghost"
                  size="md"
                  className="group bg-gray-100 hover:bg-gray-200 text-gray-700"
                  onClick={() => toggleCategoryExpansion(category)}
                >
                  All {categoryTitle}
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
