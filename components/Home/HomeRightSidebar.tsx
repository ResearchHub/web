'use client';

import { AvailableFundingSection, NeedsFundingSection } from '@/app/layouts/RightSidebar';

export const HomeRightSidebar = () => {
  return (
    <div className="space-y-8">
      <AvailableFundingSection />
      <NeedsFundingSection />
    </div>
  );
};
