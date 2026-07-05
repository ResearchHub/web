'use client';

import { SpotlightTour, type TourStep } from '../NotebookTour';
import { DEMO_USER_FIRST_NAME } from './mockData';

const STEPS: TourStep[] = [
  {
    selector: '[data-tour="notebook-editor"]',
    title: `Welcome back, ${DEMO_USER_FIRST_NAME} — this proposal is yours`,
    description:
      'We drafted this preregistration for you based on your research profile. Every section is editable, so make it your own.',
    placement: 'center',
  },
  {
    selector: '[data-tour="proposal-demo-chat"]',
    title: 'Chat with ResearchHub AI',
    description:
      'Ask the assistant to revise sections, adjust the scope, expand your methods, or draft a budget.',
    placement: 'left',
  },
  {
    selector: '[data-tour="proposal-demo-connectors"]',
    title: 'Your profile powers the draft',
    description:
      'We used your ORCID and OpenAlex profiles to personalize this proposal. Update them anytime to refine your context.',
    placement: 'left',
  },
];

interface ProposalDemoTourProps {
  run: boolean;
  onClose: () => void;
}

export function ProposalDemoTour({ run, onClose }: ProposalDemoTourProps) {
  return <SpotlightTour run={run} onClose={onClose} steps={STEPS} />;
}
