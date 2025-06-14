'use client';

import { useState, Fragment } from 'react';
import { Plus, Minus, BadgeCheck } from 'lucide-react';
import { cn } from 'utils/styles';
import { VerifiedBadge } from './VerifiedBadge';
import Link from 'next/link';

export interface Author {
  name: string;
  verified?: boolean;
  profileUrl?: string;
  authorUrl?: string;
}

interface AuthorListProps {
  authors: Author[];
  size?: 'xs' | 'sm' | 'base'; // For different text sizes
  timestamp?: string;
  isNested?: boolean;
  /** Class names to apply to author names */
  className?: string;
  /** Class names to apply to the delimiter */
  delimiterClassName?: string;
  /** Word to use as delimiter between authors (e.g. "and") */
  delimiter?: any;
  /** Whether to show abbreviated format (first, last, et al.) */
  abbreviated?: boolean;
  /** Maximum number of authors to display before showing 'et al.' */
  maxLength?: number;
  /** Whether to show abbreviated version (first author + et al.) on mobile only */
  showAbbreviatedInMobile?: boolean;
}

export const AuthorList = ({
  authors,
  size = 'base',
  timestamp,
  className,
  delimiterClassName,
  delimiter = '•',
  abbreviated = false,
  maxLength,
  showAbbreviatedInMobile = false,
}: AuthorListProps) => {
  const [showAll, setShowAll] = useState(false);

  // Filter out "et al" variations
  const filteredAuthors = authors.filter(
    (author) => !(author?.name || '').toLowerCase().match(/^et\.?\s*al\.?$/i)
  );

  const getTextSize = () => {
    switch (size) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-sm';
      default:
        return 'text-base';
    }
  };

  // Render the full author list (for desktop or non-mobile-responsive version)
  const renderAuthors = () => {
    // Handle maxLength format if provided
    if (maxLength !== undefined && maxLength > 0 && filteredAuthors.length > 0) {
      const authorsToShow = filteredAuthors.slice(0, maxLength);
      const showEtAl = filteredAuthors.length > maxLength;

      return (
        <>
          {authorsToShow.map((author, index) => (
            <Fragment key={author?.name + index}>
              <AuthorItem author={author} showDot={false} size={size} className={className} />
              {index < authorsToShow.length - 1 && (
                <span className={cn('mx-1', getTextSize(), delimiterClassName)}>{delimiter}</span>
              )}
            </Fragment>
          ))}
          {showEtAl && (
            <>
              <span className={cn('mx-1', getTextSize(), delimiterClassName)}>{delimiter}</span>
              <span className={cn(getTextSize(), 'text-gray-500')}>et al.</span>
            </>
          )}
        </>
      );
    }

    // Handle abbreviated format
    if (abbreviated) {
      if (filteredAuthors.length === 1) {
        return (
          <AuthorItem
            author={filteredAuthors[0]}
            showDot={false}
            size={size}
            className={className}
          />
        );
      }

      if (filteredAuthors.length === 2) {
        return (
          <>
            <AuthorItem
              author={filteredAuthors[0]}
              showDot={false}
              size={size}
              className={className}
            />
            <span className={cn('mx-1', getTextSize(), delimiterClassName)}>{delimiter}</span>
            <AuthorItem
              author={filteredAuthors[1]}
              showDot={false}
              size={size}
              className={className}
            />
          </>
        );
      }

      if (filteredAuthors.length > 2) {
        return (
          <>
            <AuthorItem
              author={filteredAuthors[0]}
              showDot={false}
              size={size}
              className={className}
            />
            <span className={cn('mx-1', getTextSize(), delimiterClassName)}>{delimiter}</span>
            <AuthorItem
              author={filteredAuthors[filteredAuthors.length - 1]}
              showDot={false}
              size={size}
              className={className}
            />
            <span className={cn('mx-1', getTextSize(), delimiterClassName)}>{delimiter}</span>
            <span className={cn(getTextSize(), 'text-gray-500')}>et al.</span>
          </>
        );
      }
    }

    // Original expanded format
    if (filteredAuthors.length <= 3 || showAll) {
      return (
        <>
          {filteredAuthors.map((author, index) => (
            <Fragment key={author?.name + index}>
              <AuthorItem author={author} showDot={false} size={size} className={className} />
              {index < filteredAuthors.length - 2 && (
                <span className={cn('mx-1', getTextSize(), delimiterClassName)}>{delimiter}</span>
              )}
              {index === filteredAuthors.length - 2 && (
                <span className={cn('mx-1', getTextSize(), delimiterClassName)}>{delimiter}</span>
              )}
            </Fragment>
          ))}
          {showAll && filteredAuthors.length > 3 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAll(false);
              }}
              className="flex items-center text-blue-500 hover:text-blue-600 ml-2"
            >
              <Minus className="w-3.5 h-3.5 mr-1" />
              <span className={getTextSize()}>Show less</span>
            </button>
          )}
        </>
      );
    }

    // Show first two authors, then CTA, then last author
    return (
      <>
        <AuthorItem author={filteredAuthors[0]} showDot={false} size={size} className={className} />
        <span className={cn('mx-1', getTextSize(), delimiterClassName)}>{delimiter}</span>
        <AuthorItem author={filteredAuthors[1]} showDot={false} size={size} className={className} />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowAll(true);
          }}
          className="flex items-center text-blue-500 hover:text-blue-600 mx-1"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span className={getTextSize()}>{filteredAuthors.length - 3} more</span>
        </button>
        <span className={cn('mx-1', getTextSize(), delimiterClassName)}>{delimiter}</span>
        <AuthorItem
          author={filteredAuthors[filteredAuthors.length - 1]}
          showDot={false}
          size={size}
          className={className}
        />
      </>
    );
  };

  // Render mobile-abbreviated list (first author + et al.)
  const renderMobileAbbreviatedAuthors = () => {
    if (filteredAuthors.length <= 1) {
      return (
        <AuthorItem author={filteredAuthors[0]} showDot={false} size={size} className={className} />
      );
    }

    return (
      <>
        <AuthorItem author={filteredAuthors[0]} showDot={false} size={size} className={className} />
        <span className={cn('mx-1', getTextSize(), delimiterClassName)}>{delimiter}</span>
        <span className={cn(getTextSize(), 'text-gray-500')}>et al.</span>
      </>
    );
  };

  return (
    <div className="flex flex-wrap items-center">
      {showAbbreviatedInMobile ? (
        <>
          {/* Mobile-only abbreviated view - Using flex-nowrap to prevent line breaks */}
          <div className="md:!hidden flex flex-nowrap items-center overflow-hidden">
            {renderMobileAbbreviatedAuthors()}
          </div>
          {/* Desktop-only full view */}
          <div className="hidden md:!flex md:!flex-wrap md:!items-center">{renderAuthors()}</div>
        </>
      ) : (
        renderAuthors()
      )}

      {timestamp && (
        <>
          <span className={cn('mx-1', getTextSize(), delimiterClassName)}>{delimiter}</span>
          <span className={`text-gray-500 ${getTextSize()}`}>{timestamp}</span>
        </>
      )}
    </div>
  );
};

// Extracted AuthorItem component for cleaner code
const AuthorItem = ({
  author,
  showDot,
  size,
  className,
}: {
  author: Author;
  showDot: boolean;
  size: 'xs' | 'sm' | 'base';
  className?: string;
}) => (
  <span className="flex items-center">
    {author?.authorUrl ? (
      <Link
        href={author?.authorUrl}
        className={cn(
          size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base',
          'text-gray-900 hover:text-blue-800 font-semibold hover:underline',
          className
        )}
      >
        {author?.name}
      </Link>
    ) : (
      <span
        className={cn(
          size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base',
          'text-gray-900 hover:text-gray-900 font-semibold',
          className
        )}
      >
        {author?.name}
      </span>
    )}
    {author?.verified && <VerifiedBadge className="ml-1" size={'xs'} />}
  </span>
);
