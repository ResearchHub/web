import type { OrgProfile } from '@/components/Funding/documents/types';

/**
 * The funder's organisation, as it exists before the demo starts. The assistant
 * reads this at the case-file stage and shapes the RFP around it — the typical
 * grant size, the preregistration condition, the habit of funding tests that
 * can fail — so the funder sees their own house style come back at them.
 *
 * Representative, not real: Aletheia publishes the case file the demo drafts
 * from, but this funding history is invented for the run.
 */
export const ORG_PROFILE: OrgProfile = {
  id: 'aletheia',
  name: 'Aletheia',
  tagline: 'Funds the measurement that decides a contested question.',
  website: 'https://ejhong.github.io/aletheia/',
  mission:
    'Aletheia publishes structured case files on questions the literature has argued about for decades without resolving, grades the evidence for each claim honestly, and then pays for the specific measurements that would move the grade. We fund tests in either direction: a clean negative retires a hypothesis and is worth as much to us as a positive.',
  focusAreas: [
    'Vascular physiology',
    'Interoception',
    'Autonomic regulation',
    'Contemplative neuroscience',
    'Evidence auditing',
  ],
  typicalGrantUsd: { min: 150_000, max: 600_000 },
  grantsPerYear: 3,
  totalDeployedUsd: 860_000,
  mechanisms: [
    'Open RFPs on ResearchHub, organised around the unresolved claims of a published case file rather than around disciplines.',
    'Direct commissions when a claim draws no credible proposal in an open round.',
    'Awards sized to the applicant’s stated budget, never to the cap.',
  ],
  reviewPreferences: [
    'The application is a preregistration: protocol, analysis plan and prediction frozen at submission.',
    'Open peer review on ResearchHub, scored per claim by reviewers recruited for it.',
    'Null results are expected outputs and are published.',
    'Reviewer disagreement is reported, not averaged away.',
  ],
  pastGrants: [
    {
      title: 'Interoceptive accuracy and the vagal brake',
      year: 2024,
      amountUsd: 420_000,
      outcome: 'published',
      note: 'Preregistered null on the primary endpoint; retired the strong version of the claim.',
      imageUrl: '/ai-mode/grant-vagal.jpg',
    },
    {
      title: 'Dose–response in open-label placebo analgesia',
      year: 2025,
      amountUsd: 260_000,
      outcome: 'completed',
      note: 'Two labs, one protocol. Effect replicated at half the published size.',
      imageUrl: '/ai-mode/grant-placebo.jpg',
    },
    {
      title: 'Cold exposure and brown-fat recruitment in adults',
      year: 2025,
      amountUsd: 180_000,
      outcome: 'in_progress',
      note: 'Imaging study, first cohort enrolled. Reads out early 2027.',
      imageUrl: '/ai-mode/grant-brownfat.jpg',
    },
  ],
};
