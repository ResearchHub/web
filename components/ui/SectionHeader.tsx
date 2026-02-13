import React from 'react';

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export const SectionHeader = ({ title, action }: SectionHeaderProps) => (
  <div className="mb-6">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {action}
    </div>
    <div className="border-b border-gray-200 mt-3" />
  </div>
);
