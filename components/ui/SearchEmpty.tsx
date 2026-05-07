import React from 'react';
import { cn } from '@/utils/styles';

interface SearchEmptyProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Empty state for search results. Follows ResearchHub UI patterns.
 */
export const SearchEmpty = ({
  title = 'There are no results found for this criteria',
  subtitle,
  className,
}: SearchEmptyProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-start w-full tablet:!mb-20', className)}>
      <img
        src="/search-empty-state.png"
        alt={title}
        loading="lazy"
        className="w-[400px] mt-10 tablet:!mt-4 object-contain max-w-full sm:w-[70%]"
      />
      <span className="text-center text-[16px] tablet:!text-[18px] text-gray-900 mt-5 font-medium sm:w-[85%]">
        {title}
      </span>
      {subtitle && (
        <span className="text-center text-[14px] tablet:!text-[15px] text-gray-500 mt-2 mb-4 sm:w-[85%]">
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default SearchEmpty;
