'use client'

import { cn } from '@/utils/styles';
import { ResearchCoinIcon } from './ResearchCoinIcon';
import { PlusIcon } from 'lucide-react';
import { AvatarStack } from '../AvatarStack';
import { AuthorProfile } from '@/types/user';

interface ContributeRSCProps {
  /**
   * Size in pixels. Component maintains 1:1 aspect ratio
   */
  size?: number
  /**
   * Primary color
   * @default '#4D525D' (orange)
   */
  iconColor?: string
  /**
   * Text color
   * @default '#101827'
   */
  textColor?: string
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
  /**
   * Contributors to show in avatar stack
   */
  contributors?: AuthorProfile[]
}

export function ContributeRSC({
  size = 24,
  iconColor = '#4D525D',
  textColor = '#101827',
  className,
  onClick,
  amount,
  contributors = [],
}: ContributeRSCProps) {
  const avatarItems = contributors.map(profile => ({
    src: profile.profileImage,
    alt: profile.fullName,
    tooltip: profile.fullName
  }));

  return (
    <div className={cn("relative inline-flex items-center gap-2", className)} onClick={onClick}>
      <div className="inline-flex items-center relative">
        <ResearchCoinIcon
          size={size}
          color={iconColor}
          outlined
          coin
          strokeWidth={1.1}
        />
        <div 
          className="rounded-full bg-white absolute shadow-sm"
          style={{ 
            top: "-2px", 
            right: "-4px", 
            width: "11px", 
            height: "12px",
            border: "1px solid white"
          }}
        >
          <PlusIcon 
            className="absolute" 
            style={{ 
              top: "-1px",
              left: "-1px",
              width: "11px", 
              height: "12px",
              color: iconColor
            }}
            strokeWidth={3}
          />
        </div>
      </div>
      {contributors.length > 0 && (
        <div className="mt-1">
          <AvatarStack
            items={avatarItems}
            size="xxs"
            maxItems={2}
            spacing={-8}
            className="origin-left"
            hideLabel
          />
        </div>
      )}
      {amount !== undefined && (
        <span className="text-sm font-medium" style={{ color: textColor }}>{amount}</span>
      )}      
    </div>
  );
} 