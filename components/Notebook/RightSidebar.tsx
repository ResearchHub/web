'use client';

import { PublishingForm } from '@/components/Notebook/PublishingForm';

interface RightSidebarProps {
  defaultArticleType?: string;
  isModal?: boolean;
}

export const RightSidebar = ({ defaultArticleType, isModal }: RightSidebarProps) => {
  return (
    <div className="h-full">
      <PublishingForm defaultArticleType={defaultArticleType} isModal={isModal} />
    </div>
  );
};
