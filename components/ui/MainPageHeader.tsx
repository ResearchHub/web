import React, { ReactNode } from 'react';

interface MainPageHeaderProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
}

export const MainPageHeader: React.FC<MainPageHeaderProps> = ({ title, subtitle, icon }) => {
  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
        {icon}
        {title}
      </h1>
      <p className="mt-1 text-base text-gray-600">{subtitle}</p>
    </div>
  );
};
