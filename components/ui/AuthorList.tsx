'use client'

import { useState } from 'react'
import { Plus, Minus, BadgeCheck } from 'lucide-react'

interface Author {
  name: string
  verified?: boolean
  profileUrl?: string
}

interface AuthorListProps {
  authors: Author[]
  size?: 'sm' | 'base' // For different text sizes
  timestamp?: string
}

export const AuthorList = ({ authors, size = 'base', timestamp }: AuthorListProps) => {
  const [showAll, setShowAll] = useState(false)
  
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
            />
          ))}
          {showAll && authors.length > 3 && (
            <button
              onClick={() => setShowAll(false)}
              className="flex items-center text-blue-500 hover:text-blue-600"
            >
              <Minus className="w-3.5 h-3.5 mr-1" />
              <span className={size === 'sm' ? 'text-sm' : 'text-base'}>
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
        <AuthorItem author={authors[0]} showDot={true} size={size} />
        <AuthorItem author={authors[1]} showDot={authors.length <= 3} size={size} />
        <button
          onClick={() => setShowAll(true)}
          className="flex items-center text-blue-500 hover:text-blue-600"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span className={size === 'sm' ? 'text-sm' : 'text-base'}>
            {authors.length - 3} more
          </span>
        </button>
        <AuthorItem 
          author={authors[authors.length - 1]} 
          showDot={false}
          size={size}
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
          <span className={`text-gray-500 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
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
  size 
}: { 
  author: Author; 
  showDot: boolean;
  size: 'sm' | 'base';
}) => (
  <span className="flex items-center">
    <span className={`${size === 'sm' ? 'text-sm' : 'text-base'} text-gray-900 hover:text-gray-900`}>
      {author.name}
    </span>
    {author.verified && (
      <BadgeCheck className="w-4 h-4 ml-1 text-blue-500" />
    )}
    {showDot && <span className="ml-2 text-gray-400">•</span>}
  </span>
); 