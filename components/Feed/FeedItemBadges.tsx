'use client';

import { FC, useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import Icon from '@/components/ui/icons/Icon';
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

// Helper function to render badge with source logo
const renderSourceLogoBadge = (slug: string, name: string) => {
  const logo = getSourceLogo(slug);
  const isRHJournal = logo === 'rhJournal2';
  const href = isRHJournal ? '/journal' : `/topic/${slug}`;

  return (
    <Link href={href} className="flex-shrink-0">
      <Badge
        variant="default"
        className="text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer px-2 py-1 h-[26px]"
      >
        {isRHJournal ? (
          <>
            <Icon name="rhJournal2" size={14} className="mr-2" />
            <span className="text-gray-800">RH Journal</span>
          </>
        ) : logo ? (
          <Image
            src={logo}
            alt={name}
            width={50}
            height={14}
            className="object-contain"
            style={{ maxHeight: '14px' }}
          />
        ) : (
          <span className="text-gray-800">{name}</span>
        )}
      </Badge>
    </Link>
  );
};

/**
 * Reusable component for rendering badges in feed items
 * Handles journal, category, subcategory, and topics badges
 * Shows the same set of badges across breakpoints (do not hide badges on mobile)
 * Has a blur gradient on the right edge that fades when scrolled to the end
 */
export const FeedItemBadges: FC<FeedItemBadgesProps> = ({
  journal,
  category,
  subcategory,
  topics = [],
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightBlur, setShowRightBlur] = useState(false);

  // Check if content overflows and if scrolled to the end
  const updateBlurState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const hasOverflow = el.scrollWidth > el.clientWidth;
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2; // 2px threshold

    setShowRightBlur(hasOverflow && !isAtEnd);
  }, []);

  // Initialize and update on mount/resize
  useEffect(() => {
    updateBlurState();

    const el = scrollRef.current;
    if (!el) return;

    // Listen for scroll events
    el.addEventListener('scroll', updateBlurState, { passive: true });

    // Listen for resize to recalculate
    const resizeObserver = new ResizeObserver(updateBlurState);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', updateBlurState);
      resizeObserver.disconnect();
    };
  }, [updateBlurState]);

  // Filter out excluded topics
  const filteredTopics = topics.filter((topic) => !EXCLUDED_TOPIC_SLUGS.includes(topic.slug));

  // Get journal logo if available
  const journalLogo = journal?.name ? getSourceLogo(journal.slug) : null;

  // Render the non-journal badges (do not hide badges on mobile)
  const renderBadges = () => {
    // When category/subcategory is present, we show those (and do not fall back to topics).
    if (category?.slug || subcategory?.slug) {
      return (
        <>
          {/* Category Badge */}
          {category?.slug && (
            <Link href={`/topic/${category.slug}`} className="flex-shrink-0">
              <Badge
                variant="default"
                className="text-xs font-medium text-gray-800 hover:bg-gray-200 cursor-pointer px-2 py-1"
              >
                {category.name}
              </Badge>
            </Link>
          )}

          {/* Subcategory Badge */}
          {subcategory?.slug && (
            <Link href={`/topic/${subcategory.slug}`} className="flex-shrink-0">
              <Badge
                variant="default"
                className="text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer px-2 py-1"
              >
                {subcategory.name}
              </Badge>
            </Link>
          )}
        </>
      );
    }

    // Otherwise show all topics
    if (filteredTopics.length > 0) {
      return (
        <>
          {filteredTopics.map((topic) => {
            const topicLogo = topic.slug ? getSourceLogo(topic.slug) : null;
            if (topicLogo) {
              return (
                <div key={topic.id || topic.slug} className="flex-shrink-0">
                  {renderSourceLogoBadge(topic.slug, topic.name)}
                </div>
              );
            }
            return (
              <TopicAndJournalBadge
                key={topic.id || topic.slug}
                name={topic.name}
                slug={topic.slug}
              />
            );
          })}
        </>
      );
    }

    return null;
  };

  return (
    <div className="relative flex-1 min-w-0">
      {/* Scrollable badges container */}
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide">
        {/* Journal Badge */}
        {journalLogo && journal?.slug && journal?.name && (
          <>{renderSourceLogoBadge(journal.slug, journal.name)}</>
        )}

        {/* Non-journal badges (category/subcategory OR all topics) */}
        {renderBadges()}
      </div>

      {/* Right blur gradient overlay */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-l from-white to-transparent transition-opacity duration-200 ${
          showRightBlur ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
