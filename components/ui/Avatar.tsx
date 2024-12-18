'use client'

import { FC, useState } from 'react';

const COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
];

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const getInitials = (name: string | undefined) => {
  if (!name) return '?';
  
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getRandomColor = (name: string | undefined) => {
  if (!name) return COLORS[0];
  // Use name to consistently get same color for same person
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[index % COLORS.length];
};

const getSizeClasses = (size: AvatarProps['size']) => {
  switch (size) {
    case 'xs':
      return 'w-6 h-6 text-xs';
    case 'sm':
      return 'w-8 h-8 text-sm';
    case 'md':
      return 'w-10 h-10 text-base';
    case 'lg':
      return 'w-12 h-12 text-lg';
    default:
      return 'w-8 h-8 text-sm';
  }
};

export const Avatar: FC<AvatarProps> = ({ 
  src, 
  alt = '', 
  size = 'sm',
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  const sizeClasses = getSizeClasses(size);
  const initials = getInitials(alt);
  const colorClasses = getRandomColor(alt);

  const handleImageError = () => {
    setImageError(true);
  };

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt}
        onError={handleImageError}
        className={`${sizeClasses} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClasses} ${colorClasses} rounded-full flex items-center justify-center font-medium ${className}`}>
      {initials}
    </div>
  );
}; 
