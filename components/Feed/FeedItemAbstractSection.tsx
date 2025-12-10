'use client';

import { FC, useState } from 'react';
import { cn } from '@/utils/styles';
import { truncateText, stripHtml } from '@/utils/stringUtils';
import { Button } from '@/components/ui/Button';
import { ChevronDown } from 'lucide-react';
import { sanitizeHighlightHtml } from '@/components/Search/lib/htmlSanitizer';

export interface FeedItemAbstractSectionProps {
  content: string;
  highlightedContent?: string;
  maxLength?: number;
  className?: string;
  mobileLabel?: string;
}

// Reusable expand/collapse button component
const ExpandButton: FC<{
  isExpanded: boolean;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'desktop' | 'mobile';
  mobileLabel?: string;
}> = ({ isExpanded, onClick, variant = 'desktop', mobileLabel = 'Read abstract' }) => {
  const isDesktop = variant === 'desktop';

  return (
    <Button
      variant="link"
      size="sm"
      onClick={onClick}
      className={cn(
        'flex items-center p-0 h-auto text-sm font-medium',
        isDesktop ? 'gap-0.5 mt-1 text-blue-500' : 'gap-1 text-blue-600 hover:text-blue-700'
      )}
    >
      {isDesktop
        ? isExpanded
          ? 'Show less'
          : 'Read more'
        : isExpanded
          ? 'Hide abstract'
          : mobileLabel}
      <ChevronDown
        size={14}
        className={cn('transition-transform duration-200', isExpanded && 'transform rotate-180')}
      />
    </Button>
  );
};

export const FeedItemAbstractSection: FC<FeedItemAbstractSectionProps> = ({
  content,
  highlightedContent,
  maxLength = 300,
  className,
  mobileLabel = 'Read abstract',
}) => {
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const handleDesktopToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDesktopExpanded(!isDesktopExpanded);
  };

  const handleMobileToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMobileExpanded(!isMobileExpanded);
  };

  if (!content) return null;

  // Determine if content is truncatable
  const isTextTruncated = content.length > maxLength;

  // For highlighted content, check if full content is meaningfully longer
  const hasMoreContent = highlightedContent
    ? content.length > stripHtml(highlightedContent).length + 50
    : isTextTruncated;

  // Text color varies based on whether we have highlighted content
  const textColorClass = highlightedContent ? 'text-gray-700' : 'text-gray-900';

  // Get the display content for collapsed state
  const getCollapsedContent = () => {
    if (highlightedContent) {
      return (
        <p
          dangerouslySetInnerHTML={{
            __html: sanitizeHighlightHtml(highlightedContent),
          }}
        />
      );
    }
    return <p>{truncateText(content, maxLength)}</p>;
  };

  return (
    <div className={className}>
      {/* Desktop: Show content with expand/collapse */}
      <div className={cn('hidden md:!block text-sm leading-relaxed', textColorClass)}>
        {isDesktopExpanded ? <p>{content}</p> : getCollapsedContent()}
        {hasMoreContent && (
          <ExpandButton
            isExpanded={isDesktopExpanded}
            onClick={handleDesktopToggle}
            variant="desktop"
          />
        )}
      </div>

      {/* Mobile: Show toggle CTA */}
      <div className="md:!hidden">
        <ExpandButton
          isExpanded={isMobileExpanded}
          onClick={handleMobileToggle}
          variant="mobile"
          mobileLabel={mobileLabel}
        />
        {isMobileExpanded && (
          <div className={cn('mt-2 text-sm leading-relaxed', textColorClass)}>
            <p>{highlightedContent ? content : truncateText(content, maxLength)}</p>
          </div>
        )}
      </div>
    </div>
  );
};
