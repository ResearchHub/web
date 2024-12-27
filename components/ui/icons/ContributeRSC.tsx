'use client'

import { cn } from '@/utils/styles';
import { ResearchCoinIcon } from './ResearchCoinIcon';
import { PlusIcon } from 'lucide-react';

interface ContributeRSCProps {
  /**
   * Size in pixels. Component maintains 1:1 aspect ratio
   */
  size?: number
  /**
   * Primary color
   * @default '#F97316' (orange)
   */
  color?: string
  /**
   * Optional CSS class name
   */
  className?: string
  /**
   * Optional click handler
   */
  onClick?: (event: React.MouseEvent) => void
}

export function ContributeRSC({
  size = 24,
  color = '#F97316',
  className,
  onClick,
}: ContributeRSCProps) {
  return (
    <div className={cn("relative inline-flex pl-3", className)} onClick={onClick}>
      <PlusIcon 
        className="w-3.5 h-3.5 absolute text-orange-500" 
        style={{ left: "0px", top: "4px", width: "12px", height: "12px"}}
        strokeWidth={3}
      />
      <ResearchCoinIcon
        size={size}
        color={color}
        outlined
        coin
        strokeWidth={1.25}
      />
    </div>
  );
} 