import { FC } from 'react';
import { Badge } from '@/components/ui/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/pro-solid-svg-icons';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';

interface VersionOfRecordBadgeProps {
  size?: 'xs' | 'sm' | 'default';
  className?: string;
  showTooltip?: boolean;
}

/**
 * A green badge indicating the version of record for a published paper.
 */
export const VersionOfRecordBadge: FC<VersionOfRecordBadgeProps> = ({
  size = 'sm',
  className,
  showTooltip = true,
}) => {
  const badge = (
    <Badge
      variant="default"
      size={size}
      className={cn(
        'gap-1.5 h-[21px] border-green-300 bg-green-50 text-green-700 flex items-center',
        className
      )}
    >
      <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3 text-green-600" />
      <span>Version of Record</span>
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip
      content={
        <div className="flex items-start gap-3 text-left">
          <div className="bg-green-50 p-2 rounded-md flex items-center justify-center">
            <FontAwesomeIcon icon={faCircleCheck} className="h-6 w-6 text-green-600" />
          </div>
          <div>Reviewed and published in the ResearchHub Journal.</div>
        </div>
      }
      position="top"
      width="w-[360px]"
    >
      {badge}
    </Tooltip>
  );
};
