import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBadgeCheck } from '@fortawesome/pro-solid-svg-icons';
import clsx from 'clsx';

interface VerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isOrganization?: boolean;
  className?: string;
}

export function VerifiedBadge({
  size = 'md',
  isOrganization = false,
  className,
}: VerifiedBadgeProps) {
  // Map sizes to pixel values
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <span className={clsx('inline-flex items-center justify-center', sizeMap[size], className)}>
      <FontAwesomeIcon
        icon={faBadgeCheck}
        className={clsx('w-full h-full', isOrganization ? 'text-yellow-500' : 'text-blue-500')}
      />
    </span>
  );
}
