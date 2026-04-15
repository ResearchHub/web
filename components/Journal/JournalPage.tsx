'use client';

import { FC, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { JournalFeed } from './JournalFeed';
import { JournalAboutTab } from './JournalAboutTab';
import Icon from '@/components/ui/icons/Icon';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { useFeedTabs } from '@/hooks/useFeedTabs';

const DEFAULT_TAB = 'all';

export const JournalPage: FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { activeTab } = useFeedTabs();

  useEffect(() => {
    if (!searchParams.get('tab')) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', DEFAULT_TAB);
      window.history.replaceState({}, '', `${pathname}?${params.toString()}`);
    }
  }, [pathname, searchParams]);

  const header = (
    <MainPageHeader
      icon={<Icon name="rhJournal2" size={26} color="#3971ff" />}
      title="ResearchHub Journal"
      subtitle="Accelerating science through open access publishing and peer review."
      showTitle={false}
    />
  );

  return (
    <div className="space-y-1">
      {header}
      {activeTab !== 'about' && (
        <section className="sr-only">
          <p>
            The ResearchHub Journal is an open access, peer-reviewed scientific journal built for
            speed and transparency. We accept research across all scientific disciplines and provide
            peer review in as few as 14 days — a fraction of the timeline at traditional journals.
          </p>
          <p>
            Every paper submitted is immediately available as a preprint, giving your work
            visibility from day one. Peer reviews are conducted openly and published alongside the
            paper, so readers can see how each submission was evaluated. Reviewers are compensated
            with ResearchCoin (RSC) for their contributions, which incentivizes thorough and timely
            feedback.
          </p>
          <p>
            Our editorial process is designed to be rigorous without being slow. Submissions move
            through structured review stages with defined timelines, and authors receive actionable
            feedback to strengthen their work. Papers that successfully complete review are
            published as the version of record within the journal.
          </p>
          <p>
            Scientific publishing should be open by default — open access for readers, open review
            for transparency, and fair compensation for the people who make it work. Browse the
            latest submissions below, filter by papers in review or already published, or visit the
            About tab for editorial guidelines and submission details.
          </p>
        </section>
      )}
      {activeTab === 'about' ? <JournalAboutTab /> : <JournalFeed activeTab={activeTab as any} />}
    </div>
  );
};
