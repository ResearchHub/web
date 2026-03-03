'use client';

import { FC, useRef, useState, useEffect, useCallback } from 'react';
import { HashtagBadge } from '@/components/ui/badges/HashtagBadge';
import { Topic } from '@/types/topic';
import { Journal } from '@/types/journal';
import { EXCLUDED_TOPIC_SLUGS } from '@/constants/topics';
import { getSourceLogo } from '@/utils/preprintUtil';

interface FeedItemBadgesProps {
  journal?: Journal;
  category?: Topic;
  subcategory?: Topic;
  topics?: Topic[];
}

/**
 * Reusable component for rendering badges in feed items
 * Renders topics and journal as hashtag-style text badges (e.g. #biorxiv, #chemistry)
 */
export const FeedItemBadges: FC<FeedItemBadgesProps> = ({
  journal,
  category,
  subcategory,
  topics = [],
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightBlur, setShowRightBlur] = useState(false);

  const updateBlurState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const hasOverflow = el.scrollWidth > el.clientWidth;
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;

    setShowRightBlur(hasOverflow && !isAtEnd);
  }, []);

  useEffect(() => {
    updateBlurState();

    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateBlurState, { passive: true });

    const resizeObserver = new ResizeObserver(updateBlurState);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', updateBlurState);
      resizeObserver.disconnect();
    };
  }, [updateBlurState]);

  const filteredTopics = topics.filter((topic) => !EXCLUDED_TOPIC_SLUGS.includes(topic.slug));

  const journalLogo = journal?.name ? getSourceLogo(journal.slug) : null;
  const isRHJournal = journalLogo === 'rhJournal2';

  const renderBadges = () => {
    if (category?.slug || subcategory?.slug) {
      return (
        <>
          {category?.slug && (
            <HashtagBadge label={category.slug} href={`/topic/${category.slug}`} />
          )}
          {subcategory?.slug && (
            <HashtagBadge label={subcategory.slug} href={`/topic/${subcategory.slug}`} />
          )}
        </>
      );
    }

    if (filteredTopics.length > 0) {
      return (
        <>
          {filteredTopics.map((topic) => (
            <HashtagBadge
              key={topic.id || topic.slug}
              label={topic.slug || topic.name}
              href={`/topic/${topic.slug}`}
            />
          ))}
        </>
      );
    }

    return null;
  };

  return (
    <div className="relative flex-1 min-w-0">
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide items-center">
        {journalLogo && journal?.slug && journal?.name && (
          <HashtagBadge
            label={journal.slug}
            href={isRHJournal ? '/journal' : `/topic/${journal.slug}`}
          />
        )}
        {renderBadges()}
      </div>

      <div
        className={`absolute right-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-l from-white to-transparent transition-opacity duration-200 ${
          showRightBlur ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
