import React from 'react';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';
import { RefreshCw } from 'lucide-react';

interface LoadErrorStateProps {
  /** Main message (e.g. "Failed to load reviewers data.") */
  title: string;
  /** Optional secondary text */
  subtitle?: string;
  /** When provided, shows a "Try again" button that calls this */
  onRetry?: () => void;
  /** Image to show. Defaults to the same as empty state for consistent, friendly UI. */
  imageSrc?: string;
  className?: string;
}

/**
 * Error state for failed data loading. Matches SearchEmpty layout (image + title + subtitle + action)
 * so error and empty states feel consistent across the app.
 */
export const LoadErrorState = ({
  title,
  subtitle = "We couldn't load this. Please try again.",
  onRetry,
  imageSrc = '/search-empty-state.png',
  className,
}: LoadErrorStateProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-start w-full', className)}>
      <img
        src={imageSrc}
        alt=""
        role="presentation"
        loading="lazy"
        className="w-[400px] mt-10 object-contain max-w-full sm:w-[70%]"
      />
      <span className="text-center text-[22px] text-gray-900 mt-5 font-medium md:text-[16px] sm:w-[85%]">
        {title}
      </span>
      {subtitle && (
        <span className="text-center text-[18px] text-gray-500 mt-2 md:text-[14px] sm:w-[85%]">
          {subtitle}
        </span>
      )}
      {onRetry && (
        <Button type="button" variant="outlined" size="sm" onClick={onRetry} className="mt-4 gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
};

export default LoadErrorState;
