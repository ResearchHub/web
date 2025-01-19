'use client';

import { useState } from 'react';
import { cn } from '@/utils/styles';
import { ResearchCoinIcon } from './ResearchCoinIcon';
import { AuthorProfile } from '@/types/user';
import { formatRSC } from '@/utils/number';
import { Button } from '../Button';
import { ContributorsButton } from '../ContributorsButton';

interface ContributeRSCProps {
  /**
   * Size in pixels. Component maintains 1:1 aspect ratio
   */
  size?: number;
  /**
   * Primary color
   * @default '#4D525D'
   */
  iconColor?: string;
  /**
   * Text color
   * @default '#101827'
   */
  textColor?: string;
  /**
   * Optional CSS class name
   */
  className?: string;
  /**
   * Optional click handler
   */
  onClick?: (event: React.MouseEvent) => void;
  /**
   * Amount of RSC earned
   */
  amount?: number;
  /**
   * Contributors to show in avatar stack
   */
  contributors?: Array<{
    profile: AuthorProfile;
    amount: number;
  }>;
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
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        tooltip="Contribute ResearchCoin"
        className="flex items-center space-x-1.5 text-gray-900 hover:text-gray-900"
        onClick={onClick}
      >
        <ResearchCoinIcon size={size} color={iconColor} contribute />
        {amount !== undefined && amount > 0 && (
          <span className="text-sm font-medium" style={{ color: textColor }}>
            {formatRSC({ amount, shorten: true })}
          </span>
        )}
      </Button>

      {contributors.length > 0 && (
        <ContributorsButton
          contributors={contributors}
          onContribute={onClick ? () => onClick({} as React.MouseEvent) : undefined}
        />
      )}
    </div>
  );
}
