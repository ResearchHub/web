import React, { FC, useState } from 'react';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { Button } from '@/components/ui/Button';
import { HUBS } from '../lib/journalConstants';
import { getHubSlug } from '../lib/hubUtils';

interface JournalHeroProps {
  onSubmitNow: () => void;
  onLearnMore: () => void;
}

export const JournalHero: FC<JournalHeroProps> = ({ onSubmitNow, onLearnMore }) => {
  const [isHubsExpanded, setIsHubsExpanded] = useState(false);
  const displayedHubs = isHubsExpanded ? HUBS : HUBS.slice(0, 10);
  const onToggleHubs = () => {
    setIsHubsExpanded(!isHubsExpanded);
  };

  return (
    <div className="relative w-full min-h-[400px] pt-4 pb-16 px-4 flex flex-col items-center bg-white text-gray-900">
      <div className="relative flex flex-col items-center gap-8 w-full max-w-4xl">
        <p className="text-xl text-center text-gray-600 max-w-xl mt-4">
          APC's should go to scientists -{' '}
          <span className="">that's why we pay our peer reviewers</span>
        </p>

        <div className="flex flex-row gap-5 mt-3 mb-3 w-full justify-center">
          <Button variant="default" size="lg" onClick={onSubmitNow}>
            Submit Now
          </Button>
          <Button variant="secondary" size="lg" onClick={onLearnMore}>
            Learn More
          </Button>
        </div>

        <div className="w-full max-w-3xl mt-4 text-center">
          <div className="flex gap-2 justify-center flex-wrap">
            {displayedHubs.map((hubName) => (
              <TopicAndJournalBadge
                key={hubName}
                type="topic"
                name={hubName}
                slug={getHubSlug(hubName)}
                size="sm"
              />
            ))}
          </div>
          {HUBS.length > 10 && (
            <Button variant="link" size="sm" onClick={onToggleHubs} className="mt-3">
              {isHubsExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" /> Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" /> Show More ({HUBS.length - 10})
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 text-lg font-medium text-gray-600 mb-0">
          <Zap className="text-primary-500 text-2xl w-6 h-6" />
          <span>14 days from submission to peer review completion</span>
        </div>
      </div>
    </div>
  );
};
