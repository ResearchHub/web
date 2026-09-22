import { cn } from '@/utils/styles';
import { FUNDING_DIRECTION, type FundingDirection } from './fundingDirection';

interface FundingDirectionIconProps {
  readonly direction: FundingDirection;
  /**
   * Coloured by direction, or neutral: a grey circle whose arrow inherits
   * the text colour around it, for a place that colours itself (a tab).
   */
  readonly colored?: boolean;
  readonly className?: string;
  readonly iconClassName?: string;
}

/** The direction's arrow in a circle. */
export function FundingDirectionIcon({
  direction,
  colored = true,
  className,
  iconClassName,
}: FundingDirectionIconProps) {
  const { icon: Icon, iconClass, chipClass } = FUNDING_DIRECTION[direction];
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
        colored ? chipClass : 'bg-gray-100',
        className
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', colored && iconClass, iconClassName)} />
    </span>
  );
}
