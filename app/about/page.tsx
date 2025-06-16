'use client';

import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { AboutValues } from './components/AboutValues';
import { Icon } from '@/components/ui/icons';
import { AboutMission } from './components/AboutMission';
import { AboutContact } from './components/AboutContact';
import { AboutFAQ } from './components/AboutFAQ';
import { PageLayout } from '../layouts/PageLayout';

const AboutPage = () => {
  return (
    <div>
      <div className="pt-4 pb-7">
        {' '}
        <MainPageHeader
          title="About ResearchHub"
          subtitle="Our Mission is to Accelerate the Pace of Scientific Research"
          icon={<Icon name="RSC" size={26} color="#4f46e5" />}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AboutValues />
        <AboutMission />
        <AboutFAQ />
        <AboutContact />
      </div>
    </div>
  );
};

export default AboutPage;
