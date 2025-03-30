'use client';

import React from 'react';

export interface SocialIconProps {
  href?: string | null;
  icon: React.ReactNode;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const SocialIcon: React.FC<SocialIconProps> = ({
  href,
  icon,
  label,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
  };

  if (!href) {
    return (
      <div
        className={`text-gray-300 cursor-not-allowed ${sizeClasses[size]} ${className}`}
        title={`No ${label} provided`}
      >
        {icon}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-gray-600 hover:text-indigo-600 ${sizeClasses[size]} ${className}`}
      title={label}
    >
      {icon}
    </a>
  );
};
