import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBadgeCheck } from '@fortawesome/pro-solid-svg-icons';
import clsx from 'clsx';
import { Tooltip } from '@/components/ui/Tooltip';
import { useVerification } from '@/contexts/VerificationContext';
import { Button } from '@/components/ui/Button';

interface VerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isOrganization?: boolean;
  className?: string;
  showTooltip?: boolean;
}

export function VerifiedBadge({
  size = 'md',
  isOrganization = false,
  className,
  showTooltip = false,
}: VerifiedBadgeProps) {
  const { openVerificationModal } = useVerification();

  // Map sizes to pixel values
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const badge = (
    <span
      className={clsx(
        'inline-flex items-center justify-center',
        sizeMap[size],
        showTooltip && 'cursor-pointer',
        className
      )}
    >
      <FontAwesomeIcon
        icon={faBadgeCheck}
        className={clsx('w-full h-full', isOrganization ? 'text-purple-500' : 'text-blue-500')}
      />
    </span>
  );

  if (!showTooltip) {
    return badge;
  }

  const handleLearnMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openVerificationModal();
  };

  const tooltipContent = (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
          <FontAwesomeIcon icon={faBadgeCheck} className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      <div className="text-left flex-1">
        <div className="font-semibold text-gray-900  text-base">Verified Profile</div>
        <div className="text-sm text-gray-600 mb-2">This user has verified their identity</div>
        <Button onClick={handleLearnMoreClick} variant="default" size="sm" className="mt-1">
          Learn more about verification
        </Button>
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} width="w-96" position="top">
      {badge}
    </Tooltip>
  );
}
