'use client'

import { useState, Fragment } from 'react'
import { Plus, Minus, BadgeCheck } from 'lucide-react'
import { cn } from 'utils/styles'

interface Author {
  name: string
  verified?: boolean
  profileUrl?: string
}

interface AuthorListProps {
  authors: Author[]
  size?: 'xs' | 'sm' | 'base' // For different text sizes
  timestamp?: string
  isNested?: boolean
  /** Class names to apply to author names */
  className?: string
  /** Class names to apply to the delimiter */
  delimiterClassName?: string
  /** Word to use as delimiter between authors (e.g. "and") */
  delimiter?: any
}

export const AuthorList = ({ 
  authors, 
  size = 'base', 
  timestamp, 
  isNested,
  className,
  delimiterClassName,
  delimiter = '•'
}: AuthorListProps) => {
  const [showAll, setShowAll] = useState(false)
  
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

  const renderAuthors = () => {
    if (authors.length <= 3 || showAll) {
      return (
        <>
          {authors.map((author, index) => (
            <Fragment key={author.name}>
              <AuthorItem 
                author={author} 
                showDot={false}
                size={size}
                className={className}
              />
              {index < authors.length - 2 && (
                <span className={cn("mx-1", getTextSize(), delimiterClassName)}>{delimiter}</span>
              )}
              {index === authors.length - 2 && (
                <span className={cn("mx-1", getTextSize(), delimiterClassName)}>{` ${delimiter} `}</span>
              )}
            </Fragment>
          ))}
          {showAll && authors.length > 3 && (
            <button
              onClick={() => setShowAll(false)}
              className="flex items-center text-blue-500 hover:text-blue-600 ml-2"
            >
              <Minus className="w-3.5 h-3.5 mr-1" />
              <span className={getTextSize()}>
                Show less
              </span>
            </button>
          )}
        </>
      );
    }

    // Show first two authors, then CTA, then last author
    return (
      <>
        <AuthorItem author={authors[0]} showDot={false} size={size} className={className} />
        <span className={cn("mx-1", getTextSize(), delimiterClassName)}>{delimiter}</span>
        <AuthorItem author={authors[1]} showDot={false} size={size} className={className} />
        <button
          onClick={() => setShowAll(true)}
          className="flex items-center text-blue-500 hover:text-blue-600 mx-1"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span className={getTextSize()}>
            {authors.length - 3} more
          </span>
        </button>
        <span className={cn("mx-1", getTextSize(), delimiterClassName)}>{delimiter}</span>
        <AuthorItem 
          author={authors[authors.length - 1]} 
          showDot={false}
          size={size}
          className={className}
        />
      </>
    );
  };

  return (
    <div className="flex flex-wrap items-center">
      {renderAuthors()}
      {timestamp && (
        <>
          <span className={cn("mx-1", getTextSize(), delimiterClassName)}>{delimiter}</span>
          <span className={`text-gray-500 ${getTextSize()}`}>
            {timestamp}
          </span>
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
  className 
}: { 
  author: Author; 
  showDot: boolean;
  size: 'xs' | 'sm' | 'base';
  className?: string
}) => (
  <span className="flex items-center">
    <span className={cn(
      size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base',
      'text-gray-900 hover:text-gray-900 font-semibold',
      className
    )}>
      {author.name}
    </span>
    {author.verified && (
      <BadgeCheck className={`${size === 'xs' ? 'w-3 h-3' : 'w-4 h-4'} ml-1 text-blue-500`} />
    )}
  </span>
); 