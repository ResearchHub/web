import Link from 'next/link';
import { Badge } from './Badge';

export type BadgeType = 'topic' | 'journal';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeVariant = 'primary' | 'secondary';

export interface TopicAndJournalBadgeProps {
  name: string;
  slug: string;
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
 * Supports different variants: primary (default), secondary
 */
export const TopicAndJournalBadge = ({
  name,
  slug,
  className = '',
  disableLink = false,
  size = 'md',
}: TopicAndJournalBadgeProps) => {
  const href = `/topic/${slug}`;

  const sizePadding = {
    sm: 'px-1.5 py-0.5',
    md: 'px-2 py-1',
    lg: 'px-2 py-1',
  };

  const badge = (
    <Badge
      variant="default"
      className={`text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer ${sizePadding[size]} ${className}`}
    >
      {name}
    </Badge>
  );

  return disableLink ? badge : <Link href={href}>{badge}</Link>;
};
