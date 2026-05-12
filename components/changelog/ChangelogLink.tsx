'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { CHANGELOG_STORAGE_KEY } from '@/constants/changelog';
import { cn } from '@/utils/styles';

interface ChangelogLinkProps {
  className?: string;
}

/**
 * Renders the Changelog link with a "new entry" radiating-dot indicator that
 * persists per-user in localStorage. Centralizes the seen-state logic so
 * desktop and mobile surfaces stay in sync without duplicating it.
 */
export const ChangelogLink: React.FC<ChangelogLinkProps> = ({ className }) => {
  const [hasSeenChangelog, setHasSeenChangelog] = useState(true);

  useEffect(() => {
    const hasSeen = localStorage.getItem(CHANGELOG_STORAGE_KEY);
    setHasSeenChangelog(!!hasSeen);
  }, []);

  const handleClick = () => {
    localStorage.setItem(CHANGELOG_STORAGE_KEY, 'true');
    setHasSeenChangelog(true);
  };

  return (
    <Link
      href="/changelog"
      onClick={handleClick}
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
