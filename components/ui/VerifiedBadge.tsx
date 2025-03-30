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
  const containerSize = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
  }[size];

  const badgeSize = Math.max(containerSize * 0.65, 8);

  return (
    <div
      className={clsx('relative', className)}
      style={{ width: containerSize, height: containerSize }}
    >
      <div
        className="absolute rounded-full "
        style={{
          right: -badgeSize / 4,
          bottom: -badgeSize / 4,
          width: badgeSize,
          height: badgeSize,
        }}
      >
        <FontAwesomeIcon
          icon={faBadgeCheck}
          className={clsx('w-full h-full', isOrganization ? 'text-purple-500' : 'text-blue-500')}
        />
      </div>
    </div>
  );
}
