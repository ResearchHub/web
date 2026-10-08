'use client';

import Link from 'next/link';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { cn } from '@/utils/styles';
import { useChangelogSeen } from './useChangelogSeen';

interface ChangelogLinkProps {
  className?: string;
}

/**
 * Renders the Changelog link with a "new entry" radiating-dot indicator that
 * persists per-user in localStorage (see useChangelogSeen, shared with the
 * sidebar's help menu).
 */
export const ChangelogLink: React.FC<ChangelogLinkProps> = ({ className }) => {
  const { hasSeen: hasSeenChangelog, markSeen } = useChangelogSeen();

  return (
    <Link
      href="/changelog"
      onClick={markSeen}
      className={cn(
        'flex items-center gap-1',
        hasSeenChangelog ? 'hover:text-gray-700' : 'text-orange-500 hover:text-orange-600',
        className
      )}
    >
      {!hasSeenChangelog && <RadiatingDot color="bg-orange-500" size="sm" />}
      Changelog
    </Link>
  );
};
