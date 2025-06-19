'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CollapsibleSection, CollapsibleItem } from '@/components/ui/CollapsibleSection';

import Icon from '@/components/ui/icons/Icon';

export const ResearchCoinRightSidebar = () => {
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="w-80 sticky top-[64px] h-[calc(100vh-64px)] bg-white/95 backdrop-blur-md border-gray-100 overscroll-contain">
      <div className="h-full overflow-y-auto pb-16 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {/* About Section */}
        <CollapsibleSection title="About ResearchCoin" className="px-6">
          <CollapsibleItem
            title="What is ResearchCoin (RSC)?"
            icon={<Icon name="earn2" size={16} />}
            isOpen={openSections.includes('what-is-rsc')}
            onToggle={() => toggleSection('what-is-rsc')}
          >
            ResearchCoin (RSC) is a digital currency that incentivizes good science by allowing
            users to create bounties, reward quality contributions, and fund open science
            initiatives on ResearchHub.
          </CollapsibleItem>

          <CollapsibleItem
            title="Why RSC?"
            icon={<Icon name="fund2" size={16} />}
            isOpen={openSections.includes('why-rsc')}
            onToggle={() => toggleSection('why-rsc')}
          >
            RSC creates a transparent, merit-based ecosystem where researchers can be directly
            rewarded for their contributions to science. It helps bridge the gap between valuable
            research work and financial recognition.
          </CollapsibleItem>

          <CollapsibleItem
            title="Getting started with RSC"
            icon={<Icon name="wallet3" size={16} />}
            isOpen={openSections.includes('getting-started')}
            onToggle={() => toggleSection('getting-started')}
          >
            To begin with ResearchCoin:
            <ul className="mt-2 space-y-1.5">
              <li>1. Create a ResearchHub account</li>
              <li>2. Verify your academic credentials</li>
              <li>3. Start engaging with content through reviews and discussions</li>
              <li>4. Earn your first RSC through participation</li>
              <li>5. Explore bounties and funding opportunities</li>
            </ul>
          </CollapsibleItem>
        </CollapsibleSection>

        {/* RSC Utility Section */}
        <CollapsibleSection title="Use ResearchCoin" className="px-6">
          <CollapsibleItem
            title="Create bounties"
            icon={<Icon name="createBounty" size={16} />}
            isOpen={openSections.includes('create-reward')}
            onToggle={() => toggleSection('create-reward')}
          >
            RSC empowers the bounty system on ResearchHub, connecting researchers with tailored
            opportunities. Users can create bounties to engage experts for tasks like data
            processing and literature reviews.
          </CollapsibleItem>

          <CollapsibleItem
            title="Fund open science"
            icon={<Icon name="fundYourRsc2" size={16} />}
            isOpen={openSections.includes('fund-science')}
            onToggle={() => toggleSection('fund-science')}
          >
            RSC enables the community to fund scientific projects through preregistrations,
            streamlining the proposal and funding process.
          </CollapsibleItem>

          <CollapsibleItem
            title="Tip authors"
            icon={<Icon name="fund" size={16} />}
            isOpen={openSections.includes('tip-authors')}
            onToggle={() => toggleSection('tip-authors')}
          >
            RSC incentivizes actions in the ResearchHub ecosystem, providing targeted rewards for
            individual contributions and broader research goals.
          </CollapsibleItem>

          <CollapsibleItem
            title="Change the platform"
            icon={<Icon name="settings" size={16} />}
            isOpen={openSections.includes('governance')}
            onToggle={() => toggleSection('governance')}
          >
            RSC puts governance in the hands of researchers, allowing them to collectively shape the
            incentive structures in their fields. Through voting and proposal mechanisms, the
            research community can determine how to best reward different types of contributions.
          </CollapsibleItem>
        </CollapsibleSection>

        {/* Earning Section */}
        <CollapsibleSection title="Earn ResearchCoin" className="px-6">
          <CollapsibleItem
            title="Share a peer review"
            icon={<Icon name="peerReview1" size={16} />}
            isOpen={openSections.includes('peer-review')}
            onToggle={() => toggleSection('peer-review')}
          >
            Researchers earn RSC by peer reviewing preprints on ResearchHub. After verifying
            identity, peer review opportunities will be surfaced.
          </CollapsibleItem>

          <CollapsibleItem
            title="Complete a bounty"
            icon={<Icon name="earn1" size={16} />}
            isOpen={openSections.includes('answer-reward')}
            onToggle={() => toggleSection('answer-reward')}
          >
            Researchers earn RSC by completing bounties on ResearchHub, from peer reviews to
            specialized research assistance, allowing monetization of expertise.
          </CollapsibleItem>

          <CollapsibleItem
            title="Do reproducible research"
            icon={<Icon name="workType" size={16} />}
            isOpen={openSections.includes('reproducible-research')}
            onToggle={() => toggleSection('reproducible-research')}
          >
            Authors earn RSC on their published papers, earning multipliers for open science
            practices to promote transparency and reproducibility in research.
            <br />• (Required): Open access
            <br />• 2x: Has open data
            <br />• 3x: Was preregistered
          </CollapsibleItem>

          <CollapsibleItem
            title="Get upvotes on your content"
            icon={<Icon name="upvote" size={16} />}
            isOpen={openSections.includes('upvotes')}
            onToggle={() => toggleSection('upvotes')}
          >
            Researchers earn RSC by receiving upvotes on their contributions to open scientific
            discourse, incentivizing critical discussions and informal exchanges.
          </CollapsibleItem>
        </CollapsibleSection>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
    </div>
  );
};
