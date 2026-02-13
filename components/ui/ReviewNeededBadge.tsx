import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import { Star } from 'lucide-react';
import Link from 'next/link';

interface ReviewNeededBadgeProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'xs';
  showTooltip?: boolean;
  /** URL to navigate to for submitting a review */
  reviewHref?: string;
}

export const ReviewNeededBadge = ({
  className = '',
  size = 'default',
  showTooltip = true,
  reviewHref,
}: ReviewNeededBadgeProps) => {
  const badge = (
    <Badge
      variant="default"
      size={size}
      className={cn(
        'gap-1 py-1 h-[26px] border-amber-200 bg-amber-50 text-amber-700 cursor-help',
        className
      )}
    >
      <Star className="w-3 h-3" />
      <span>Review Needed</span>
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip
      content={
        <div className="py-1">
          <p className="text-sm text-gray-700 mb-2">
            Earn <span className="font-semibold">$150</span> for providing a peer review on this
            proposal.
          </p>
          {reviewHref && (
            <Link
              href={reviewHref}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
              onClick={(e) => e.stopPropagation()}
            >
              Submit review →
            </Link>
          )}
        </div>
      }
      position="bottom"
      width="w-56"
    >
      {badge}
    </Tooltip>
  );
};
