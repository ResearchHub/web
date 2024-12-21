'use client'

import { useState } from 'react'
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
}

export const AuthorList = ({ 
  authors, 
  size = 'base', 
  timestamp, 
  isNested,
  className 
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
            <AuthorItem 
              key={author.name} 
              author={author} 
              showDot={index < authors.length - 1}
              size={size}
              className={className}
            />
          ))}
          {showAll && authors.length > 3 && (
            <button
              onClick={() => setShowAll(false)}
              className="flex items-center text-blue-500 hover:text-blue-600"
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
        <AuthorItem author={authors[0]} showDot={true} size={size} className={className} />
        <AuthorItem author={authors[1]} showDot={authors.length <= 3} size={size} className={className} />
        <button
          onClick={() => setShowAll(true)}
          className="flex items-center text-blue-500 hover:text-blue-600"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span className={getTextSize()}>
            {authors.length - 3} more
          </span>
        </button>
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
    <div className="flex flex-wrap items-center gap-x-2">
      {renderAuthors()}
      {timestamp && (
        <>
          <span className="text-gray-400">•</span>
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
      'text-gray-900 hover:text-gray-900',
      className
    )}>
      {author.name}
    </span>
    {author.verified && (
      <BadgeCheck className={`${size === 'xs' ? 'w-3 h-3' : 'w-4 h-4'} ml-1 text-blue-500`} />
    )}
    {showDot && <span className="ml-2 text-gray-400">•</span>}
  </span>
); 