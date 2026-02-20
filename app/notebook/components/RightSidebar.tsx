'use client';

import { PublishingForm } from '@/app/notebook/components/PublishingForm';

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
