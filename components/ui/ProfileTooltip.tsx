'use client'

import { FC } from 'react';
import { Tooltip } from './Tooltip';
import { BadgeCheck } from 'lucide-react';

interface ProfileTooltipProps {
  type: 'user' | 'organization';
  name: string;
  headline?: string;
  verified?: boolean;
  children: React.ReactNode;
}

export const ProfileTooltip: FC<ProfileTooltipProps> = ({
  type,
  name,
  headline,
  verified,
  children
}) => {
  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="font-medium">{name}</span>
            {verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
          </div>
          {headline && (
            <span className="text-gray-600">{headline}</span>
          )}
          <span className="text-gray-500 text-xs capitalize">{type}</span>
        </div>
      }
    >
      {children}
    </Tooltip>
  );
}; 