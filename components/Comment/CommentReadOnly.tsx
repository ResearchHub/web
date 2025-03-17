'use client';

import { ContentFormat, Comment } from '@/types/comment';
import { ContentType } from '@/types/work';
import 'highlight.js/styles/atom-one-dark.css';
import React, { ReactNode, useState } from 'react';
import { ChevronDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { parseContent, extractTextFromTipTap } from './lib/commentContentUtils';
import { renderQuillContent, truncateContent, SectionHeaderProps } from './lib/renderUtils';
import TipTapRenderer from './lib/TipTapRenderer';
import { CommentContent } from './lib/types';

interface CommentReadOnlyProps {
  content: CommentContent;
  contentFormat?: ContentFormat;
  contentType?: ContentType;
  debug?: boolean;
  maxLength?: number;
  initiallyExpanded?: boolean;
}

// Simple read-only stars component for displaying review score
const ReadOnlyStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={cn(
            'mr-0.5',
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          )}
        />
      ))}
    </div>
  );
};

// Review section header component
const ReviewSectionHeader = ({ title, description, rating }: SectionHeaderProps) => {
  return (
    <div className="mb-4 border-b pb-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{title}</h3>
        {rating > 0 && <ReadOnlyStars rating={rating} />}
      </div>
      {description && <p className="text-gray-600 mt-1">{description}</p>}
    </div>
  );
};

export const CommentReadOnly = ({
  content,
  contentFormat = 'TIPTAP',
  contentType,
  debug = false,
  maxLength = 300,
  initiallyExpanded = false,
}: CommentReadOnlyProps) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  if (debug) {
    console.log('Original content in CommentReadOnly:', content);
  }

  // Parse the content based on its format
  const parsedContent = parseContent(content, contentFormat, debug);

  if (debug) {
    console.log('Parsed content in CommentReadOnly:', parsedContent);
  }

  // Extract text for debugging and length calculation
  const textContent =
    contentFormat === 'TIPTAP'
      ? extractTextFromTipTap(parsedContent)
      : typeof content === 'string'
        ? content
        : JSON.stringify(content);

  // Check if content is long enough to truncate
  const shouldTruncate = textContent.length > maxLength;

  const getFormattedContent = () => {
    if (!parsedContent) {
      if (debug) console.log('No content provided to CommentReadOnly');
      return null;
    }

    let renderedContent: ReactNode[] = [];

    switch (contentFormat) {
      case 'QUILL_EDITOR': {
        if (debug) console.log('Rendering QUILL content');
        try {
          const quillContent = renderQuillContent(parsedContent);
          if (quillContent) renderedContent = quillContent;
          else if (debug) console.log('Failed to render QUILL content');
        } catch (error) {
          console.error('Error rendering QUILL content:', error);
          if (debug) console.log('Error rendering QUILL content:', error);
        }
        break;
      }
      case 'TIPTAP': {
        try {
          if (debug) console.log('Rendering TIPTAP content with TipTapRenderer');
          // Use the TipTapRenderer component
          renderedContent = [
            <TipTapRenderer
              key="tiptap-renderer"
              content={parsedContent}
              debug={debug}
              renderSectionHeader={(props) => (
                <ReviewSectionHeader key={`section-${props.title}`} {...props} />
              )}
              truncate={!isExpanded && shouldTruncate}
              maxLength={maxLength}
            />,
          ];
        } catch (error) {
          console.error('Error rendering TIPTAP content:', error);
          if (debug) console.log('Error rendering TIPTAP content:', error);
        }
        break;
      }
      default:
        if (debug) console.log('Using default content rendering');
        // For plain text, handle truncation directly
        let displayContent = String(content);
        if (!isExpanded && shouldTruncate) {
          displayContent = displayContent.substring(0, maxLength) + '...';
        }
        renderedContent = [<p key="default">{displayContent}</p>];
    }

    if (renderedContent.length === 0) {
      if (debug) console.log('No rendered content produced');
      return null;
    }

    // Only show the Read more button if content should be truncated
    return (
      <>
        {renderedContent}
        {shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-blue-600"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : 'Read more'}{' '}
            <ChevronDown className={`ml-1 h-4 w-4 ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </>
    );
  };

  return <div className="comment-content prose prose-sm max-w-none">{getFormattedContent()}</div>;
};
