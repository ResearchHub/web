import { Avatar } from './Avatar';
import Link from 'next/link';

export type BadgeType = 'topic' | 'journal';

export interface TopicAndJournalBadgeProps {
  type: BadgeType;
  name: string;
  slug: string;
  imageUrl?: string;
  className?: string;
}

/**
 * A reusable badge component for topics and journals
 * Displays an avatar if imageUrl is provided
 * Links to the appropriate page based on type and slug
 */
export const TopicAndJournalBadge = ({
  type,
  name,
  slug,
  imageUrl,
  className = '',
}: TopicAndJournalBadgeProps) => {
  // Determine the URL based on the badge type
  const href = type === 'topic' ? `/topic/${slug}` : `/journal/${slug}`;

  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors ${className}`}
    >
      {imageUrl && <Avatar src={imageUrl} alt={name} size="xxs" className="ring-1 ring-gray-200" />}
      <span className={`text-gray-700 ${type === 'topic' ? 'capitalize' : ''}`}>{name}</span>
    </Link>
  );
};
