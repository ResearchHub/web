'use client';

import { cn } from '@/utils/styles';
import { ResearchCoinIcon } from './ResearchCoinIcon';
import { HandHelping } from 'lucide-react';

interface GrantIconProps {
  /**
   * Size in pixels. Component maintains 1:1 aspect ratio
   */
  size?: number;
  /**
   * Primary color of the icon
   */
  color?: string;
  /**
   * Optional CSS class name
   */
  className?: string;
  /**
   * Optional click handler
   */
  onClick?: (event: React.MouseEvent) => void;
}

export function GrantIcon({
  size = 24,
  color = 'rgb(79, 70, 229)', // Default to indigo-600
  className,
  onClick,
}: GrantIconProps) {
  const coinSize = size * 0.55;

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      {/* Create a container with padding to accommodate the coin */}
      <div className="absolute inset-0 pt-[10%]">
        {/* Hand in background */}
        <HandHelping className="w-full h-full text-current" strokeWidth={1.75} />
      </div>

      {/* ResearchCoin positioned over the palm */}
      <div
        className="absolute"
        style={{
          left: '65%',
          top: '0%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <ResearchCoinIcon size={coinSize} color={color} outlined strokeWidth={1.25} />
      </div>
    </div>
  );
}
