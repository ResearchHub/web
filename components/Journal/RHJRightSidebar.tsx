'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopicAndJournalBadge } from '../ui/TopicAndJournalBadge';
import { Button } from '../ui/Button';
import { Feather, Users, ArrowUpRightSquare, Clock, FileText, Unlock } from 'lucide-react';
import { editors, HUBS } from './lib/journalConstants';
import { getHubSlug } from './lib/hubUtils';
import { EditorCard } from './about/EditorCard';
import { CollapsibleItem } from '@/components/ui/CollapsibleSection';
import { Icon } from '../ui/icons/Icon';
import { RHJBanner } from './RHJBanner';
import { RightSidebarBanner } from '@/components/ui/RightSidebarBanner';

interface RHJRightSidebarProps {
  showBanner?: boolean;
}

const keyFeatures = [
  { text: '14 days to peer reviews', highlight: true, icon: Clock },
  { text: 'Immediate preprints', icon: FileText },
  { text: 'Open access by default', icon: Unlock },
];

const quickLinks = [
  {
    href: 'https://drive.google.com/file/d/1qKlGnNSA-98kg-RhmTFKYVB85X0PJWYr/view?usp=sharing',
    text: 'Author Guidelines',
    icon: Feather,
  },
  {
    href: 'https://airtable.com/apptLQP8XMy1kaiID/pag5tkxt0V18Xobje/form',
    text: 'Apply to be a Reviewer',
    icon: Users,
  },
];

// FAQ items from JournalRightSidebar
const faqItems = [
  {
    id: 'who-can-submit',
    question: 'Who can submit to ResearchHub Journal?',
    answer:
      'Any researcher can submit their work to ResearchHub Journal. We welcome submissions from researchers at all career stages and from all institutions.',
  },
  {
    id: 'review-timeline',
    question: 'How long does the review process take?',
    answer:
      'Our peer review process is designed to be efficient. Peer reviews are typically completed within 14 days, and a publication decision is made within 21 days of submission.',
  },
  {
    id: 'reviewer-compensation',
    question: 'Do you compensate peer reviewers?',
    answer:
      'Yes, we value the expertise and time of our peer reviewers. Reviewers receive $150 per review.',
  },
  {
    id: 'who-reviews-work',
    question: 'Who will peer review my work?',
    answer:
      'We recruit experts in your field for invited peer reviews. While any user can also share a review, you may choose to address or disregard comments from non-invited reviewers. Our staff editors screen all reviews to ensure you receive high-quality, constructive feedback.',
  },
  {
    id: 'what-happens-if-tipped',
    question: 'What happens if someone tips my work?',
    answer:
      'Users on ResearchHub can tip ResearchCoin (RSC) to any work, including ResearchHub Journal publications. When a paper receives a tip, the RSC is evenly distributed among all its authors.',
  },
  {
    id: 'become-reviewer',
    question: 'How do I become a reviewer?',
    answer: (
      <>
        <p className="mb-4">
          If you're interested in becoming a reviewer, please contact us at review@researchhub.com
          with your CV and areas of expertise, or apply directly using the button below.
        </p>
        <a
          href="https://airtable.com/apptLQP8XMy1kaiID/pag5tkxt0V18Xobje/form"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
        >
          Apply to be a peer reviewer
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        </a>
      </>
    ),
  },
];

export function RHJRightSidebar({ showBanner = true }: RHJRightSidebarProps) {
  const router = useRouter();
  const [isHubsExpanded, setIsHubsExpanded] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const displayedHubs = isHubsExpanded ? HUBS : HUBS.slice(0, 5);
  const displayEditors = editors.filter((editor) => editor.authorId !== null);

  const handleFaqToggle = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Submit Button and Key Features Banner */}
      {showBanner && (
        <RightSidebarBanner
          title="Publish Faster."
          description="Where fast publishing meets open science."
          bulletPoints={['14 days to peer review', 'Immediate preprints', 'Open access by default']}
          buttonText="Submit Your Manuscript"
          buttonLink="/paper/create"
          iconName="rhJournal2"
          iconColor="#2563eb"
          iconSize={20}
          variant="blue"
        />
      )}

      {/* --- Editorial Board Section --- */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Editorial Board</h3>
        <div className="space-y-4">
          {displayEditors.map((editor) => (
            <EditorCard key={editor.name} editor={editor} />
          ))}
        </div>
      </div>

      {/* Relevant Fields - Updated to link to Hubs and use TopicAndJournalBadge */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Relevant Fields</h3>
        <div className="flex flex-wrap gap-2">
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
        {HUBS.length > 5 && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setIsHubsExpanded(!isHubsExpanded)}
            className="pt-1"
          >
            {isHubsExpanded ? 'Show Less' : `Show More (${HUBS.length - 5})`}
          </Button>
        )}
      </div>

      {/* Resources */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Resources</h3>
        <div className="space-y-3">
          {quickLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <IconComponent size={16} className="text-primary-600" />
                  <span>{link.text}</span>
                </div>
                <div className="ml-4">
                  <ArrowUpRightSquare size={14} className="text-gray-400" />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Frequently Asked Questions</h3>
        <div className="space-y-1">
          {faqItems.map((item) => (
            <CollapsibleItem
              key={item.id}
              title={item.question}
              isOpen={openFaqId === item.id}
              onToggle={() => handleFaqToggle(item.id)}
            >
              <div className="text-sm text-gray-600">{item.answer}</div>
            </CollapsibleItem>
          ))}
        </div>
      </div>
    </div>
  );
}
