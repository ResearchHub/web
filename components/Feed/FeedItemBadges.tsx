'use client';

import { FC } from 'react';
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
    <Link href={href}>
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
 * On mobile: shows journal + one badge (priority: subcategory > category > topic)
 * On desktop: shows all badges
 */
export const FeedItemBadges: FC<FeedItemBadgesProps> = ({
  journal,
  category,
  subcategory,
  topics = [],
}) => {
  // Filter out excluded topics
  const filteredTopics = topics.filter((topic) => !EXCLUDED_TOPIC_SLUGS.includes(topic.slug));

  // Get journal logo if available
  const journalLogo = journal?.name ? getSourceLogo(journal.slug) : null;

  // Determine the single priority badge for mobile (subcategory > category > topic)
  const getMobilePriorityBadge = () => {
    if (subcategory?.slug) {
      return (
        <Link href={`/topic/${subcategory.slug}`}>
          <Badge
            variant="default"
            className="text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer px-2 py-1"
          >
            {subcategory.name}
          </Badge>
        </Link>
      );
    }
    if (category?.slug) {
      return (
        <Link href={`/topic/${category.slug}`}>
          <Badge
            variant="default"
            className="text-xs font-medium text-gray-800 hover:bg-gray-200 cursor-pointer px-2 py-1"
          >
            {category.name}
          </Badge>
        </Link>
      );
    }
    if (filteredTopics.length > 0) {
      const firstTopic = filteredTopics[0];
      const topicLogo = firstTopic.slug ? getSourceLogo(firstTopic.slug) : null;
      if (topicLogo) {
        return renderSourceLogoBadge(firstTopic.slug, firstTopic.name);
      }
      return <TopicAndJournalBadge name={firstTopic.name} slug={firstTopic.slug} />;
    }
    return null;
  };

  // If we have journal/category/subcategory, show those badges
  if (journalLogo || category?.slug || subcategory?.slug) {
    return (
      <>
        {/* Journal Badge - always shown */}
        {journal && journal.slug && journal.name && (
          <>{renderSourceLogoBadge(journal.slug, journal.name)}</>
        )}

        {/* Mobile: Single priority badge */}
        <div className="tablet:!hidden">{getMobilePriorityBadge()}</div>

        {/* Desktop: All badges */}
        <div className="hidden tablet:!contents">
          {/* Category Badge */}
          {category && category.slug && (
            <Link href={`/topic/${category.slug}`}>
              <Badge
                variant="default"
                className="text-xs font-medium text-gray-800 hover:bg-gray-200 cursor-pointer px-2 py-1"
              >
                {category.name}
              </Badge>
            </Link>
          )}
          {/* Subcategory Badge */}
          {subcategory && subcategory.slug && (
            <Link href={`/topic/${subcategory.slug}`}>
              <Badge
                variant="default"
                className="text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer px-2 py-1"
              >
                {subcategory.name}
              </Badge>
            </Link>
          )}
        </div>
      </>
    );
  }

  // Otherwise, show topics
  return (
    <>
      {/* Mobile: Journal + first topic only */}
      <div className="tablet:!hidden">
        {journal && journal.slug && journal.name && (
          <>{renderSourceLogoBadge(journal.slug, journal.name)}</>
        )}
        {getMobilePriorityBadge()}
      </div>

      {/* Desktop: All topics */}
      <div className="hidden tablet:!contents">
        {filteredTopics.map((topic) => {
          const topicLogo = topic.slug ? getSourceLogo(topic.slug) : null;
          if (topicLogo) {
            return (
              <div key={topic.id || topic.slug}>
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
      </div>
    </>
  );
};
