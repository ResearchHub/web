import { FC } from 'react';
import Link from 'next/link';

interface HashtagBadgeProps {
  label: string;
  /** Where the badge goes; without one it is plain text. */
  href?: string;
  className?: string;
}

const STYLE = { fontSize: '13px' };

export const HashtagBadge: FC<HashtagBadgeProps> = ({ label, href, className = '' }) => {
  const baseClass = `flex-shrink-0 text-gray-500 ${className}`;
  if (!href) {
    return (
      <span className={baseClass} style={STYLE}>
        #{label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={`${baseClass} hover:text-gray-700 transition-colors`}
      style={STYLE}
      onClick={(e) => e.stopPropagation()}
    >
      #{label}
    </Link>
  );
};
