import { Avatar } from './Avatar';
import Link from 'next/link';

export type BadgeType = 'topic' | 'journal';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeVariant = 'primary' | 'secondary';

export interface TopicAndJournalBadgeProps {
  type: BadgeType;
  name: string;
  slug: string;
  imageUrl?: string;
  className?: string;
  disableLink?: boolean;
  size?: BadgeSize;
  variant?: BadgeVariant;
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
  type,
  name,
  slug,
  imageUrl,
  className = '',
  disableLink = false,
  size = 'md',
  variant = 'primary',
}: TopicAndJournalBadgeProps) => {
  // Determine the URL based on the badge type
  // Both topic and journal types now use /topic/:slug (journals redirect to topics)
  const href = `/topic/${slug}`;

  // Size-based styling
  const sizeStyles = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  // Common content of the badge
  const badgeContent = (
    <>
      {/* {imageUrl && (
        <Avatar
          src={imageUrl}
          alt={name}
          size={size === 'lg' ? 'xs' : 'xxs'}
          className="ring-1 ring-primary-200"
        />
      )} */}
      <span
        className={`${variant === 'primary' ? 'text-primary-700' : 'text-gray-700'} ${type === 'topic' ? 'capitalize' : ''}`}
      >
        <span className="block md:!hidden">
          {name.length > 30 ? `${name.slice(0, 30)}...` : name}
        </span>
        <span className="hidden md:!block">{name}</span>
      </span>
    </>
  );

  // Variant-based styling
  const variantStyles = {
    primary: 'border-primary-200 bg-primary-50 hover:bg-primary-100',
    secondary: 'border-gray-200 bg-gray-50 hover:bg-gray-100',
  };

  // Common styles for the badge
  const badgeStyles = `flex items-center gap-1.5 rounded-full font-medium border transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  // Return either a link or a div based on the disableLink prop
  return disableLink ? (
    <div className={badgeStyles}>{badgeContent}</div>
  ) : (
    <Link href={href} className={badgeStyles}>
      {badgeContent}
    </Link>
  );
};
