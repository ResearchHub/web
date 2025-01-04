'use client'

import { FileText, BadgeCheck } from 'lucide-react';
import { cn } from '@/utils/styles';

interface ClaimPaperIconProps {
  /**
   * Size in pixels. Component maintains 1:1 aspect ratio
   */
  size?: number;
  /**
   * Optional CSS class name
   */
  className?: string;
  /**
   * Optional click handler
   */
  onClick?: (event: React.MouseEvent) => void;
}

export function ClaimPaperIcon({
  size = 24,
  className,
  onClick,
}: ClaimPaperIconProps) {
  const badgeSize = Math.max(12, size * 0.65);
  
  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <FileText className="w-full h-full text-current" />
      <div 
        className="absolute bg-white rounded-full"
        style={{ 
          right: -badgeSize/4,
          bottom: -badgeSize/4,
          width: badgeSize,
          height: badgeSize
        }}
      >
        <BadgeCheck strokeWidth={2.5} className="w-full h-full text-indigo-600" />
      </div>
    </div>
  );
} 