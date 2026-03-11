import { FC } from 'react';
import Link from 'next/link';

interface HashtagBadgeProps {
  label: string;
  href: string;
  className?: string;
}

export const HashtagBadge: FC<HashtagBadgeProps> = ({ label, href, className = '' }) => (
  <Link
    href={href}
    className={`flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors ${className}`}
    style={{ fontSize: '13px' }}
    onClick={(e) => e.stopPropagation()}
  >
    #{label}
  </Link>
);
