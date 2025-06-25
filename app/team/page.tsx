'use client';

import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { Icon } from '@/components/ui/icons';
import { usePathname } from 'next/navigation';
import { PageBanner } from '../about/components/PageBanner';
import { AboutTabs } from '../about/components/AboutTabs';
import { TeamMembers } from './components/TeamMembers';

const TeamPage = () => {
  const pathname = usePathname();

  return (
    <div>
      <PageBanner title="Team" subtitle="The people behind ResearchHub" />

      <AboutTabs activeTab={pathname} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TeamMembers />
      </div>
    </div>
  );
};

export default TeamPage;
