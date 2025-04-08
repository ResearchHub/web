import { Avatar } from './Avatar';
import Link from 'next/link';

export type BadgeType = 'topic' | 'journal';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface TopicAndJournalBadgeProps {
  type: BadgeType;
  name: string;
  slug: string;
  imageUrl?: string;
  className?: string;
  disableLink?: boolean;
  size?: BadgeSize;
}

/**
 * A reusable badge component for topics and journals
 * Displays an avatar if imageUrl is provided
 * Links to the appropriate page based on type and slug
 * Can optionally disable the link functionality with disableLink prop
 * Supports different sizes: sm, md (default), lg
 */
export const TopicAndJournalBadge = ({
  type,
  name,
  slug,
  imageUrl,
  className = '',
  disableLink = false,
  size = 'md',
}: TopicAndJournalBadgeProps) => {
  // Determine the URL based on the badge type
  const href = type === 'topic' ? `/topic/${slug}` : `/journal/${slug}`;

  // Size-based styling
  const sizeStyles = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  // Common content of the badge
  const badgeContent = (
    <>
      {imageUrl && (
        <Avatar
          src={imageUrl}
          alt={name}
          size={size === 'lg' ? 'xs' : 'xxs'}
          className="ring-1 ring-indigo-200"
        />
      )}
      <span className={`text-indigo-700 ${type === 'topic' ? 'capitalize' : ''}`}>{name}</span>
    </>
  );

  // Common styles for the badge
  const badgeStyles = `flex items-center gap-1.5 rounded-full font-medium border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors ${sizeStyles[size]} ${className}`;

  // Return either a link or a div based on the disableLink prop
  return disableLink ? (
    <div className={badgeStyles}>{badgeContent}</div>
  ) : (
    <Link href={href} className={badgeStyles}>
      {badgeContent}
    </Link>
  );
};
