import React, { ReactNode } from 'react';

interface MainPageHeaderProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  showTitle?: boolean;
}

export const MainPageHeader: React.FC<MainPageHeaderProps> = ({
  title,
  subtitle,
  icon,
  showTitle = true,
}) => {
  return (
    <div className="tablet:!hidden pt-2 pb-6">
      {showTitle && <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>}
      <p className="text-lg text-gray-600 font-medium">{subtitle}</p>
    </div>
  );
};
