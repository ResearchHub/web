import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import Icon from '@/components/ui/icons/Icon';
import { cn } from '@/utils/styles';

interface PreprintBadgeProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'xs';
  showTooltip?: boolean;
}

export const PreprintBadge = ({
  className = '',
  size = 'default',
  showTooltip = true,
}: PreprintBadgeProps) => {
  const badge = (
    <Badge
      variant="default"
      size={size}
      className={cn('gap-1.5 py-1 border-gray-300 cursor-pointer rounded-md', className)}
    >
      <Icon name="preprint" size={16} color="#6B7280" />
      <span>Preprint</span>
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip
      content={
        <div className="flex items-start gap-3 text-left">
          <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center">
            <Icon name="preprint" size={24} color="#374151" />
          </div>
          <div>Preprints are research papers that have not yet undergone formal peer review.</div>
        </div>
      }
      position="top"
      width="w-[360px]"
    >
      {badge}
    </Tooltip>
  );
};
