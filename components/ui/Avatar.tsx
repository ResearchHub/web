'use client'

import { FC, useState } from 'react';
import { cn } from '@/utils/styles';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'xxs' | 'xs' | 'sm' | 'md';
  className?: string;
}

export const Avatar: FC<AvatarProps> = ({ 
  src, 
  alt, 
  size = 'md',
  className 
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const sizeClasses = {
    xxs: 'h-5 w-5 text-[8px]',
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm'
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-gray-100 overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <span className="font-medium text-gray-600">
          {getInitials(alt)}
        </span>
      )}
    </div>
  );
}; 
