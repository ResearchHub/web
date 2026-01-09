'use client';

import { FC, useState } from 'react';
import { cn } from '@/utils/styles';
import { truncateText } from '@/utils/stringUtils';
import { Button } from '@/components/ui/Button';
import { ChevronDown } from 'lucide-react';
import { sanitizeHighlightHtml } from '@/components/Search/lib/htmlSanitizer';

export interface FeedItemAbstractSectionProps {
  content: string;
  highlightedContent?: string;
  maxLength?: number;
  className?: string;
  mobileLabel?: string;
  onAbstractExpanded?: () => void;
}

export const FeedItemAbstractSection: FC<FeedItemAbstractSectionProps> = ({
  content,
  highlightedContent,
  maxLength = 300,
  className,
  mobileLabel = 'Read abstract',
  onAbstractExpanded,
}) => {
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const isTextTruncated = content && content.length > maxLength;

  const handleDesktopToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDesktopExpanded) {
      onAbstractExpanded?.();
    }
    setIsDesktopExpanded(!isDesktopExpanded);
  };

  const handleMobileToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMobileExpanded) {
      onAbstractExpanded?.();
    }
    setIsMobileExpanded(!isMobileExpanded);
  };

  if (!content) return null;

  // If we have highlighted HTML, render it (search results)
  if (highlightedContent) {
    return (
      <div className={className}>
        {/* Desktop: Show content directly */}
        <div className="hidden md:!block text-sm text-gray-700 leading-relaxed">
          <p
            dangerouslySetInnerHTML={{
              __html: sanitizeHighlightHtml(highlightedContent),
            }}
          />
        </div>

        {/* Mobile: Show toggle CTA */}
        <div className="md:!hidden">
          <Button
            variant="link"
            size="sm"
            onClick={handleMobileToggle}
            className="flex items-center gap-1 text-blue-600 p-0 h-auto text-sm font-medium hover:text-blue-700"
          >
            {isMobileExpanded ? 'Hide abstract' : mobileLabel}
            <ChevronDown
              size={14}
              className={cn(
                'transition-transform duration-200',
                isMobileExpanded && 'transform rotate-180'
              )}
            />
          </Button>
          {isMobileExpanded && (
            <div className="mt-2 text-sm text-gray-700 leading-relaxed">
              <p
                dangerouslySetInnerHTML={{
                  __html: sanitizeHighlightHtml(highlightedContent),
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default: render plain text with truncation
  return (
    <div className={className}>
      {/* Desktop: Show content with expand/collapse */}
      <div className="hidden md:!block text-sm text-gray-900 leading-relaxed">
        <p>{isDesktopExpanded ? content : truncateText(content, maxLength)}</p>
        {isTextTruncated && (
          <Button
            variant="link"
            size="sm"
            onClick={handleDesktopToggle}
            className="flex items-center gap-0.5 mt-1 text-blue-500 p-0 h-auto text-sm font-medium"
          >
            {isDesktopExpanded ? 'Show less' : 'Read more'}
            <ChevronDown
              size={14}
              className={cn(
                'transition-transform duration-200',
                isDesktopExpanded && 'transform rotate-180'
              )}
            />
          </Button>
        )}
      </div>

      {/* Mobile: Show toggle CTA */}
      <div className="md:!hidden">
        <Button
          variant="link"
          size="sm"
          onClick={handleMobileToggle}
          className="flex items-center gap-1 text-blue-600 p-0 h-auto text-sm font-medium hover:text-blue-700"
        >
          {isMobileExpanded ? 'Hide abstract' : mobileLabel}
          <ChevronDown
            size={14}
            className={cn(
              'transition-transform duration-200',
              isMobileExpanded && 'transform rotate-180'
            )}
          />
        </Button>
        {isMobileExpanded && (
          <div className="mt-2 text-sm text-gray-900 leading-relaxed">
            <p>{content}</p>
          </div>
        )}
      </div>
    </div>
  );
};
