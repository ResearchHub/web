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
  /**
   * Amount of RSC earned
   */
  amount?: number
}

export function ContributeRSC({
  size = 24,
  color = '#F97316',
  className,
  onClick,
  amount,
}: ContributeRSCProps) {
  return (
    <div className={cn("relative inline-flex items-center pl-3", className)} onClick={onClick}>
      <PlusIcon 
        className="w-3.5 h-3.5 absolute text-orange-500" 
        style={{ left: "-1px", top: "4px", width: "12px", height: "12px"}}
        strokeWidth={3}
      />
      <ResearchCoinIcon
        size={size}
        color={color}
        outlined
        coin
        strokeWidth={1.25}
      />
      {amount !== undefined && (
        <span className="ml-1.5 text-sm font-medium text-orange-500">{amount}</span>
      )}
    </div>
  );
} 