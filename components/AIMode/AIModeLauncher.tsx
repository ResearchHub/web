'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/utils/styles';
import { useAIMode } from './lib/AIModeContext';

interface AIModeLauncherProps {
  readonly variant: 'mobile' | 'desktop';
}

/**
 * Top-bar entry point. Opens the overlay in place — deliberately not a link, so
 * the funder never loses the page he was on.
 */
export const AIModeLauncher = ({ variant }: AIModeLauncherProps) => {
  const { actions } = useAIMode();

  return (
    <button
      type="button"
      onClick={actions.open}
      aria-label="Open AI Mode"
      title="AI Mode (⌘I)"
      className="flex items-center justify-center rounded-md p-2 transition-colors hover:bg-gray-100"
    >
      <Sparkles
        className={cn('text-gray-500', variant === 'mobile' ? 'h-6 w-6' : 'h-[26px] w-[26px]')}
      />
    </button>
  );
};
