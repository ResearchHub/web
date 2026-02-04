'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/icons/Icon';
import { Check } from 'lucide-react';
import Link from 'next/link';

interface RightSidebarBannerProps {
  title: string;
  description: string;
  bulletPoints: string[];
  buttonText: string;
  buttonLink: string;
  iconName?: IconName;
  iconColor?: string;
  iconSize?: number;
  className?: string;
  variant?: 'blue' | 'green' | 'purple' | 'gray' | 'orange';
}

export const RightSidebarBanner: React.FC<RightSidebarBannerProps> = ({
  title,
  description,
  bulletPoints,
  buttonText,
  buttonLink,
  iconName,
  iconColor = '#2563eb',
  iconSize = 20,
  className = '',
  variant = 'blue',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'blue':
        return {
          container: 'bg-blue-50 border-blue-100',
          checkIcon: 'text-blue-500',
        };
      case 'green':
        return {
          container: 'bg-green-50 border-green-100',
          checkIcon: 'text-green-500',
        };
      case 'purple':
        return {
          container: 'bg-purple-50 border-purple-100',
          checkIcon: 'text-purple-500',
        };
      case 'gray':
        return {
          container: 'bg-gray-50 border-gray-100',
          checkIcon: 'text-gray-500',
        };
      case 'orange':
        return {
          container: 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200',
          checkIcon: 'text-orange-500',
        };
      default:
        return {
          container: 'bg-blue-50 border-blue-100',
          checkIcon: 'text-blue-500',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`rounded-lg shadow-sm border p-6 ${styles.container} ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
        {iconName && <Icon name={iconName} size={iconSize} color={iconColor} />}
        {title}
      </h3>
      <p className="text-gray-900 mb-3 text-sm">{description}</p>
      <ul className="text-gray-900 mb-4 text-sm space-y-1">
        {bulletPoints.map((point, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className={`w-4 h-4 flex-shrink-0 ${styles.checkIcon}`} strokeWidth={2.5} />
            {point}
          </li>
        ))}
      </ul>
      <Button asChild className="w-full">
        <Link href={buttonLink}>{buttonText}</Link>
      </Button>
    </div>
  );
};
