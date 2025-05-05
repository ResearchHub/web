import React, { FC, ElementType, ReactNode } from 'react';

interface FeatureCardProps {
  icon: ElementType;
  title: string;
  children: ReactNode;
}

export const FeatureCard: FC<FeatureCardProps> = ({ icon: Icon, title, children }) => {
  return (
    <div className="flex flex-col items-start p-6 gap-6 bg-primary-50 border border-primary-100 rounded-lg hover:-translate-y-1 hover:shadow-md hover:border-primary-200 transition-all duration-200 ease-in-out">
      <Icon className="text-3xl text-primary-600 w-8 h-8" />
      <div className="flex flex-col gap-2 w-full">
        <h3 className="text-lg font-medium text-primary-800">{title}</h3>
        <div className="text-base leading-normal text-primary-700">{children}</div>
      </div>
    </div>
  );
};
