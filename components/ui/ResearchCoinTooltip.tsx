'use client';

import { HelpCircle } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';

interface ResearchCoinTooltipProps {
  /** Size of the help icon in pixels */
  iconSize?: number;
  /** Additional class names for the icon */
  className?: string;
  /** Position of the tooltip */
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Tooltip content explaining what ResearchCoin (RSC) is.
 * Used across the platform to educate users about RSC.
 */
export const ResearchCoinTooltipContent = () => (
  <div className="text-left space-y-2">
    <p className="font-medium text-gray-900">What is ResearchCoin (RSC)?</p>
    <p className="text-gray-600 text-sm">
      ResearchCoin is ResearchHub's native token used to fund research, reward contributions, and
      participate in the scientific community.
    </p>
    <p className="text-gray-500 text-xs mt-2">
      RSC can be earned by contributing to the platform or purchased directly.
    </p>
  </div>
);

/**
 * A reusable component that renders a help icon with a tooltip explaining ResearchCoin.
 * Use this component whenever you need to provide context about RSC to users.
 *
 * @example
 * ```tsx
 * <div className="flex items-center gap-2">
 *   <span>ResearchCoin</span>
 *   <ResearchCoinTooltip />
 * </div>
 * ```
 */
export function ResearchCoinTooltip({
  iconSize = 14,
  className,
  position = 'top',
}: ResearchCoinTooltipProps) {
  return (
    <Tooltip content={<ResearchCoinTooltipContent />} position={position} width="w-72">
      <HelpCircle
        className={cn('text-gray-400 hover:text-gray-600 cursor-help transition-colors', className)}
        style={{ width: iconSize, height: iconSize }}
      />
    </Tooltip>
  );
}
