import { FC, ReactNode, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/styles';

interface ExpandableContentProps {
  title?: string;
  content: string;
  maxLength?: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  badges?: ReactNode;
  footer?: ReactNode;
  controlled?: boolean;
}

/**
 * A reusable component for displaying expandable content
 * Can be used in controlled or uncontrolled mode
 */
export const ExpandableContent: FC<ExpandableContentProps> = ({
  title,
  content,
  maxLength = 200,
  isExpanded: controlledIsExpanded,
  onToggleExpand: controlledOnToggleExpand,
  className,
  titleClassName,
  contentClassName,
  badges,
  footer,
  controlled = false,
}) => {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);

  // Use either controlled or internal state
  const isExpanded = controlled ? controlledIsExpanded : internalIsExpanded;
  const onToggleExpand = controlled
    ? controlledOnToggleExpand
    : () => setInternalIsExpanded(!internalIsExpanded);

  const truncateText = (text: string) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const isTextTruncated = content.length > maxLength;

  return (
    <div className={cn('', className)}>
      {badges && <div className="flex items-center gap-2 mb-2">{badges}</div>}

      {title && (
        <h3 className={cn('text-sm font-semibold text-gray-900 mb-2', titleClassName)}>{title}</h3>
      )}

      <div className={cn('text-sm text-gray-700', contentClassName)}>
        <p>{isExpanded ? content : truncateText(content)}</p>

        {isTextTruncated && (
          <Button
            variant="link"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              if (onToggleExpand) onToggleExpand();
            }}
            className="flex items-center gap-0.5 mt-1 text-indigo-600"
          >
            {isExpanded ? 'Show less' : 'Read more'}
            <ChevronDown
              size={14}
              className={cn(
                'transition-transform duration-200',
                isExpanded && 'transform rotate-180'
              )}
            />
          </Button>
        )}
      </div>

      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
};
