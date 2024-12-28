'use client'

import { cn } from '@/utils/styles';
import { ResearchCoinIcon } from './ResearchCoinIcon';
import { PlusIcon } from 'lucide-react';
import { AvatarStack } from '../AvatarStack';
import { AuthorProfile } from '@/types/user';
import { formatRSC } from '@/utils/number';
import { Button } from '../Button';

interface ContributeRSCProps {
  /**
   * Size in pixels. Component maintains 1:1 aspect ratio
   */
  size?: number
  /**
   * Primary color
   * @default '#4D525D'
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
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center space-x-1.5 text-gray-900 hover:text-gray-900"
        onClick={onClick}
      >
        <div className="relative">
          <ResearchCoinIcon
            size={size}
            color={iconColor}
            outlined
            coin
            strokeWidth={1.1}
          />
          <div 
            className="absolute -top-0.5 -right-1 rounded-full bg-white shadow-sm border border-white"
            style={{ width: '11px', height: '12px' }}
          >
            <PlusIcon 
              className="absolute -top-px -left-px"
              style={{ 
                width: '11px', 
                height: '12px',
                color: iconColor,
                strokeWidth: 4
              }}
            />
          </div>
        </div>

        {amount !== undefined && (
          <span className="text-sm font-medium" style={{ color: textColor }}>
            {formatRSC({ amount, shorten: true })}
          </span>
        )}
      </Button>

      {contributors.length > 0 && (
        <div style={{ marginTop: '5px', }}>
          <AvatarStack
            items={avatarItems}
            size="xxs"
            maxItems={3}
            spacing={-8}
            // avatarStyle={{ width: '16px', height: '16px' }}
            hideLabel
          />
        </div>
      )}
    </div>
  );
} 