import { Avatar } from './Avatar';
import Link from 'next/link';

export type BadgeType = 'topic' | 'journal';

export interface TopicAndJournalBadgeProps {
  type: BadgeType;
  name: string;
  slug: string;
  imageUrl?: string;
  className?: string;
  disableLink?: boolean;
}

/**
 * A reusable badge component for topics and journals
 * Displays an avatar if imageUrl is provided
 * Links to the appropriate page based on type and slug
 * Can optionally disable the link functionality with disableLink prop
 */
export const TopicAndJournalBadge = ({
  type,
  name,
  slug,
  imageUrl,
  className = '',
  disableLink = false,
}: TopicAndJournalBadgeProps) => {
  // Determine the URL based on the badge type
  const href = type === 'topic' ? `/topic/${slug}` : `/journal/${slug}`;

  // Common content of the badge
  const badgeContent = (
    <>
      {imageUrl && <Avatar src={imageUrl} alt={name} size="xxs" className="ring-1 ring-gray-200" />}
      <span className={`text-gray-700 ${type === 'topic' ? 'capitalize' : ''}`}>{name}</span>
    </>
  );

  // Common styles for the badge
  const badgeStyles = `flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors ${className}`;

  // Return either a link or a div based on the disableLink prop
  return disableLink ? (
    <div className={badgeStyles}>{badgeContent}</div>
  ) : (
    <Link href={href} className={badgeStyles}>
      {badgeContent}
    </Link>
  );
};
