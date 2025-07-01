'use client';

import { AboutValues } from './components/AboutValues';
import { AboutMission } from './components/AboutMission';
import { AboutContact } from './components/AboutContact';
import { AboutFAQ } from './components/AboutFAQ';
import { AboutResearchCoin } from './components/AboutResearchCoin';
import { usePathname } from 'next/navigation';
import { PageBanner } from './components/PageBanner';
import { AboutTabs } from './components/AboutTabs';

const AboutPage = () => {
  const pathname = usePathname();

  return (
    <div>
      <PageBanner
        title="About ResearchHub"
        subtitle="Our Mission is to Accelerate the Pace of Scientific Research."
      />

      <AboutTabs activeTab={pathname} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AboutValues />
        <AboutMission />
        <AboutResearchCoin />
        <AboutFAQ />
        <AboutContact />
      </div>
    </div>
  );
};

export default AboutPage;
