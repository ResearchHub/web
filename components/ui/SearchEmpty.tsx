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
    <div className={cn('flex flex-col items-center justify-start w-full', className)}>
      <img
        src="/search-empty-state.png"
        alt={title}
        loading="lazy"
        className="w-[400px] mt-10 object-contain max-w-full sm:w-[70%]"
      />
      <span className="text-center text-[22px] text-gray-900 mt-5 font-semibold md:text-[16px] sm:w-[85%]">
        {title}
      </span>
      {subtitle && (
        <span className="text-center text-[18px] text-gray-500 mt-2 mb-4 md:text-[14px] sm:w-[85%]">
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default SearchEmpty;
